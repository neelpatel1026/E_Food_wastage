import dotenv from "dotenv";
import RazorPay from "razorpay";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { logActivity } from "../utils/activityLogger.js";

dotenv.config();
let instance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    console.log(`[placeOrder] Request body received:`, JSON.stringify(req.body, null, 2));
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      console.log(`[placeOrder] Validation failed: cart is empty`);
      return res.status(400).json({ message: "cart is empty" });
    }

    if (
      !deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      console.log(`[placeOrder] Validation failed: incomplete delivery address:`, deliveryAddress);
      return res.status(400).json({ message: "send complete deliveryAddress" });
    }

    /* ================= STOCK VALIDATION ================= */
    for (const item of cartItems) {
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        console.log(`[placeOrder] Validation failed: Item not found ${item._id}`);
        return res.status(400).json({ message: "Item not found" });
      }

      if (dbItem.stock < item.quantity) {
        console.log(`[placeOrder] Validation failed: Insufficient stock for ${dbItem.name}. Stock: ${dbItem.stock}, Requested: ${item.quantity}`);
        return res.status(400).json({
          message: `${dbItem.name} has only ${dbItem.stock} items left`,
        });
      }
    }

    /* ================= GROUP BY SHOP ================= */
    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      const shopId = typeof item.shop === "object" && item.shop?._id ? String(item.shop._id) : String(item.shop);
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error(`Shop not found for ID ${shopId}`);
        }
        if (!shop.owner) {
          throw new Error(`Owner not found for Shop ID ${shopId}`);
        }

        const items = groupItemsByShop[shopId];

        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i._id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    /* ================= ONLINE ================= */
    if (paymentMethod === "online") {
      let razorOrder = null;
      const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

      if (isRazorpayConfigured) {
        try {
          razorOrder = await instance.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          });
        } catch (err) {
          console.error("Razorpay order creation failed, falling back to manual payment:", err);
        }
      }

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder ? razorOrder.id : "",
        payment: false,
        paymentStatus: "Pending",
      });

      logActivity(req, {
        activityType: "Orders",
        action: "Order Placed",
        targetEntity: "Order",
        entityId: newOrder._id,
        description: `New online order placed for amount ₹${totalAmount}`,
        status: "success"
      });

      logActivity(req, {
        activityType: "Payments",
        action: "Payment Started",
        targetEntity: "Order",
        entityId: newOrder._id,
        description: `Payment initialized via online gateway for order amount ₹${totalAmount}`,
        status: "info"
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    /* ================= COD ================= */
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    /* 🔥 Reduce stock */
    for (const item of cartItems) {
      await Item.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity },
      });
    }

    logActivity(req, {
      activityType: "Orders",
      action: "Order Placed",
      targetEntity: "Order",
      entityId: newOrder._id,
      description: `New Cash On Delivery order placed for amount ₹${totalAmount}`,
      status: "success"
    });

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error(`[placeOrder] Exception caught during order placement:`, error);
    return res.status(500).json({ message: `place order error ${error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "payment not captured" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    // Verify payment amount and order ID match
    if (payment.amount !== Math.round(order.totalAmount * 100)) {
      return res.status(400).json({ message: "payment amount mismatch" });
    }

    if (payment.order_id !== order.razorpayOrderId) {
      return res.status(400).json({ message: "payment order ID mismatch" });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "Verified";
    await order.save();

    /* 🔥 Reduce stock after payment */
    for (const shopOrder of order.shopOrders) {
      for (const item of shopOrder.shopOrderItems) {
        await Item.findByIdAndUpdate(item.item, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    logActivity(req, {
      activityType: "Payments",
      action: "Payment Completed",
      targetEntity: "Order",
      entityId: order._id,
      description: `Payment captured successfully via Razorpay (ID: ${razorpay_payment_id})`,
      status: "success"
    });

    logActivity(req, {
      activityType: "Payments",
      action: "Payment Verified",
      targetEntity: "Order",
      entityId: order._id,
      description: `Razorpay signature verification successful for order amount ₹${order.totalAmount}`,
      status: "success"
    });

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({
      message: `verify payment error ${error}`,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner && String(o.owner) === String(req.userId)),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        payment: order.payment,
      }));

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `get User order error ${error}` });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (o) => String(o.shop) === String(shopId),
    );
    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    shopOrder.status = status;

    let deliveryBoysPayload = [];
    let assignmentId = null;

    /* ================= DELIVERY ASSIGNMENT ================= */

    if ((status === "preparing" || status === "out of delivery") && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      let nearByDeliveryBoys = [];
      if (longitude && latitude) {
        nearByDeliveryBoys = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              $maxDistance: 5000,
            },
          },
        });

        // Fallback: If no delivery boys within 5km, search within 50km
        if (nearByDeliveryBoys.length === 0) {
          nearByDeliveryBoys = await User.find({
            role: "deliveryBoy",
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [Number(longitude), Number(latitude)],
                },
                $maxDistance: 50000,
              },
            },
          });
        }
      }

      // Fallback: If still no delivery boys, find all registered delivery boys
      if (nearByDeliveryBoys.length === 0) {
        nearByDeliveryBoys = await User.find({ role: "deliveryBoy" });
      }

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length === 0) {
        await order.save();
        const updatedShopOrder = order.shopOrders.find(
          (o) => String(o.shop) === String(shopId),
        );
        await order.populate("shopOrders.shop", "name");
        await order.populate("user", "socketId");
        return res.status(200).json({
          shopOrder: updatedShopOrder,
          assignedDeliveryBoy: null,
          availableBoys: [],
          assignment: null,
          message: "order status updated but there is no available delivery boys",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "brodcasted",
      });

      shopOrder.assignment = deliveryAssignment._id;
      assignmentId = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      /* ================= SOCKET EMIT ================= */

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      const io = req.app.get("io");

      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;

          if (boySocketId) {
            const shopOrderData = deliveryAssignment.order.shopOrders.find(
              (so) => String(so._id) === String(deliveryAssignment.shopOrderId),
            );

            io.to(boySocketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items: shopOrderData?.shopOrderItems || [],
              subtotal: shopOrderData?.subtotal,
            });
          }
        });
      }
    }

    /* ================= SAVE ORDER ================= */

    await order.save();

    if (status === "preparing") {
      logActivity(req, {
        activityType: "Orders",
        action: "Order Prepared",
        targetEntity: "Order",
        entityId: order._id,
        description: `Order ${order._id} status updated to preparing`,
        status: "success"
      });
    } else if (status === "out of delivery") {
      logActivity(req, {
        activityType: "Delivery",
        action: "Delivery Started",
        targetEntity: "Order",
        entityId: order._id,
        description: `Delivery started for order ${order._id}`,
        status: "success"
      });
    } else if (status === "delivered") {
      logActivity(req, {
        activityType: "Orders",
        action: "Order Delivered",
        targetEntity: "Order",
        entityId: order._id,
        description: `Order ${order._id} marked as delivered`,
        status: "success"
      });
      logActivity(req, {
        activityType: "Delivery",
        action: "Delivery Completed",
        targetEntity: "Order",
        entityId: order._id,
        description: `Delivery completed successfully for order ${order._id}`,
        status: "success"
      });
    } else if (status === "cancelled") {
      logActivity(req, {
        activityType: "Orders",
        action: "Order Cancelled",
        targetEntity: "Order",
        entityId: order._id,
        description: `Order ${order._id} has been cancelled`,
        status: "warning"
      });
    }

    const updatedShopOrder = order.shopOrders.find(
      (o) => String(o.shop) === String(shopId),
    );

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );
    await order.populate("user", "socketId");

    /* ================= USER SOCKET ================= */

    const io = req.app.get("io");

    if (io) {
      const userSocketId = order.user.socketId;

      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: assignmentId,
    });
  } catch (error) {
    return res.status(500).json({
      message: `order status error ${error}`,
    });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignments
      .filter((a) => a.order && a.shop)
      .map((a) => {
        const shopOrder = a.order.shopOrders.find(
          (so) => String(so._id) === String(a.shopOrderId)
        );
        return {
          assignmentId: a._id,
          orderId: a.order._id,
          shopName: a.shop.name,
          deliveryAddress: a.order.deliveryAddress,
          items: shopOrder ? shopOrder.shopOrderItems : [],
          subtotal: shopOrder ? shopOrder.subtotal : 0,
        };
      });

    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({ message: `get Assignment error ${error}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You are already assigned to another order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    let shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    logActivity(req, {
      activityType: "Delivery",
      action: "Delivery Boy Accepted",
      targetEntity: "DeliveryAssignment",
      entityId: assignment._id,
      description: `Delivery boy accepted order assignment ${assignment._id}`,
      status: "success"
    });

    logActivity(req, {
      activityType: "Orders",
      action: "Order Accepted",
      targetEntity: "Order",
      entityId: order._id,
      description: `Order ${order._id} accepted by delivery partner`,
      status: "success"
    });

    return res.status(200).json({
      message: "order accepted",
    });
  } catch (error) {
    return res.status(500).json({ message: `accept order error ${error}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [
          { path: "user", select: "fullName email location mobile" },
          { path: "shopOrders.shop", select: "name image" }
        ],
      });

    if (!assignment) {
      return res.status(200).json(null);
    }
    if (!assignment.order) {
      return res.status(404).json({ message: "order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) === String(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(404).json({ message: "shopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo && assignment.assignedTo.location && assignment.assignedTo.location.coordinates && assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({ message: `get current order error ${error}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `get by id order error ${error}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderid" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    
    console.log(`[sendDeliveryOtp] Generated OTP for Order ${orderId}: ${otp}`);

    try {
      await sendDeliveryOtpMail(order.user, otp);
    } catch (mailError) {
      console.warn("[sendDeliveryOtp] Nodemailer failed to send email:", mailError.message || mailError);
      const responsePayload = {
        success: true,
        message: "Otp generated (Nodemailer fallback).",
      };
      if (process.env.NODE_ENV !== "production") {
        responsePayload.otp = otp;
        responsePayload.message += ` OTP is ${otp}`;
      } else {
        return res.status(400).json({
          success: false,
          message: "Unable to deliver OTP via email. Please check configuration.",
          error: mailError.message || mailError,
        });
      }
      return res.status(200).json(responsePayload);
    }

    return res
      .status(200)
      .json({ message: `Otp sent Successfuly to ${order?.user?.fullName}` });
  } catch (error) {
    console.error("[sendDeliveryOtp] Critical exception caught:", error);
    return res.status(400).json({
      success: false,
      message: "Unable to send OTP",
      error: error.message || error,
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderid" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Expired Otp" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: req.userId,
    });

    logActivity(req, {
      activityType: "Delivery",
      action: "Delivery Completed",
      targetEntity: "Order",
      entityId: order._id,
      description: `Delivery of order ${order._id} completed successfully`,
      status: "success"
    });

    logActivity(req, {
      activityType: "Orders",
      action: "Order Delivered",
      targetEntity: "Order",
      entityId: order._id,
      description: `Order ${order._id} delivered successfully`,
      status: "success"
    });

    return res.status(200).json({ message: "Order Delivered Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verify delivery otp error ${error}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let todaysDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          String(shopOrder.assignedDeliveryBoy) === String(deliveryBoyId) &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};

    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json(formattedStats);
  } catch (error) {
    return res.status(500).json({ message: `today deliveries error ${error}` });
  }
};

export const getPaymentConfig = async (req, res) => {
  try {
    return res.status(200).json({
      isRazorpayAvailable: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      upiId: process.env.UPI_ID || "rebite@upi",
      upiQrCode: process.env.UPI_QR_CODE_URL || ""
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No screenshot file provided" });
    }
    const screenshotUrl = await uploadOnCloudinary(req.file.path);
    if (!screenshotUrl) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }
    return res.status(200).json({ screenshotUrl });
  } catch (error) {
    return res.status(500).json({ message: `Screenshot upload error: ${error.message}` });
  }
};

export const submitManualPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentUTR, paymentScreenshot } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.totalAmount || order.totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({ message: "Payment screenshot is required" });
    }

    const utrRegex = /^\d{12}$/;
    if (!paymentUTR || !utrRegex.test(paymentUTR)) {
      return res.status(400).json({ message: "Invalid UTR number. It must be exactly 12 digits." });
    }

    order.paymentStatus = "Under Verification";
    order.paymentUTR = paymentUTR;
    order.paymentScreenshot = paymentScreenshot;
    order.paymentTime = new Date();
    await order.save();

    logActivity(req, {
      activityType: "Payments",
      action: "Payment Started",
      targetEntity: "Order",
      entityId: order._id,
      description: `Manual UPI payment details submitted (UTR: ${paymentUTR}) for verification`,
      status: "info"
    });

    return res.status(200).json({ message: "Payment details submitted for verification", order });
  } catch (error) {
    return res.status(500).json({ message: `submitManualPayment error: ${error.message}` });
  }
};
