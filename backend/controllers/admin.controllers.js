import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { logActivity } from "../utils/activityLogger.js";

// Helper helper to check if email matches SUPER_ADMIN_EMAIL
const checkSuperAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return false;
  return user.email && process.env.SUPER_ADMIN_EMAIL && user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();
};

/* ================= SCREEN STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied. Super Admin required." });
    }

    const [
      totalUsers,
      totalOwners,
      totalDeliveryBoys,
      totalShops,
      totalOrders,
      pendingOrders,
      completedOrders,
      pendingPayments,
      verifiedPayments,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "deliveryBoy" }),
      Shop.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ "shopOrders.status": "pending" }),
      Order.countDocuments({ "shopOrders.status": "delivered" }),
      Order.countDocuments({ paymentMethod: "online", paymentStatus: "Under Verification" }),
      Order.countDocuments({ paymentMethod: "online", paymentStatus: "Verified" }),
    ]);

    // Sum revenue for verified or cod orders
    const completedPaidOrders = await Order.find({
      $or: [
        { payment: true },
        { paymentStatus: "Verified" },
        { paymentMethod: "cod" }
      ]
    });
    const revenue = completedPaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalShopOwners: totalOwners,
        totalDeliveryBoys,
        totalShops,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders: 0, // placeholder since not in enum schema
        pendingPayments,
        verifiedPayments,
        revenue,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch stats: ${error.message}` });
  }
};

/* ================= USERS MANAGEMENT ================= */
export const getAdminUsers = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { search = "", role = "", page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const skipIndex = (page - 1) * limit;
    const [usersList, totalCount] = await Promise.all([
      User.find(query).skip(skipIndex).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // Dynamically override role in-memory for the superadmin to prevent mismatch
    const mappedUsers = usersList.map(u => {
      const uObj = u.toObject();
      if (uObj.email && process.env.SUPER_ADMIN_EMAIL && uObj.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
        uObj.role = "superAdmin";
      }
      return uObj;
    });

    return res.status(200).json({
      users: mappedUsers,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch users: ${error.message}` });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { id } = req.params;
    const { fullName, email, mobile, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Do NOT modify role or status if editing the super admin email
    const isEditingSuperAdmin = user.email && process.env.SUPER_ADMIN_EMAIL && user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

    const oldStatus = user.status || "active";
    const statusChanged = status && !isEditingSuperAdmin && oldStatus !== status;

    if (fullName) user.fullName = fullName;
    if (email && !isEditingSuperAdmin) user.email = email;
    if (mobile) user.mobile = mobile;
    if (role && !isEditingSuperAdmin) user.role = role;
    if (status && !isEditingSuperAdmin) user.status = status;

    await user.save();

    if (statusChanged) {
      logActivity(req, {
        activityType: "Admin",
        action: status === "suspended" ? "User Blocked" : "User Unblocked",
        targetEntity: "User",
        entityId: user._id,
        description: status === "suspended"
          ? `User account ${user.email} was suspended/blocked`
          : `User account ${user.email} was unblocked/activated`,
        status: status === "suspended" ? "warning" : "success"
      });
    } else {
      logActivity(req, {
        activityType: "Admin",
        action: "Profile Updated",
        targetEntity: "User",
        entityId: user._id,
        description: `Admin updated profile details for ${user.email}`,
        status: "success"
      });
    }

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: `Failed to update user: ${error.message}` });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isTargetSuperAdmin = user.email && process.env.SUPER_ADMIN_EMAIL && user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();
    if (isTargetSuperAdmin) {
      return res.status(400).json({ message: "Cannot delete the Super Admin account" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete user: ${error.message}` });
  }
};

/* ================= SHOPS MANAGEMENT ================= */
export const getAdminShops = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const shops = await Shop.find().populate("owner").sort({ createdAt: -1 });
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch shops: ${error.message}` });
  }
};

export const updateAdminShopStatus = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { id } = req.params;
    const { status } = req.body; // pending, approved, rejected, disabled

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const oldStatus = shop.status || "approved";
    shop.status = status;
    await shop.save();

    let action = "Shop Updated";
    let statusColor = "success";
    if (status === "approved") {
      action = oldStatus === "pending" || oldStatus === "rejected" ? "Shop Approved" : "Shop Enabled";
      statusColor = "success";
    } else if (status === "rejected") {
      action = "Shop Rejected";
      statusColor = "warning";
    } else if (status === "disabled") {
      action = "Shop Disabled";
      statusColor = "warning";
    }

    logActivity(req, {
      activityType: "Shops",
      action,
      targetEntity: "Shop",
      entityId: shop._id,
      description: `Shop "${shop.name}" status updated to ${status} by admin`,
      status: statusColor
    });

    logActivity(req, {
      activityType: "Admin",
      action,
      targetEntity: "Shop",
      entityId: shop._id,
      description: `Admin updated status for shop "${shop.name}" to ${status}`,
      status: statusColor
    });

    return res.status(200).json({ message: "Shop status updated successfully", shop });
  } catch (error) {
    return res.status(500).json({ message: `Failed to update shop: ${error.message}` });
  }
};

/* ================= ORDERS & PAYMENTS ================= */
export const getAdminOrders = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const orders = await Order.find()
      .populate("user")
      .populate("shopOrders.shop")
      .populate("shopOrders.assignedDeliveryBoy")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch orders: ${error.message}` });
  }
};

export const adminVerifyPayment = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { orderId } = req.params;
    const { action } = req.body; // approve, reject, refund

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (action === "approve") {
      if (order.paymentStatus === "Verified") {
        return res.status(400).json({ message: "Payment is already verified" });
      }
      order.payment = true;
      order.paymentStatus = "Verified";
      order.paymentTime = new Date();
      await order.save();

      // Reduce item stock
      for (const shopOrder of order.shopOrders) {
        for (const item of shopOrder.shopOrderItems) {
          await Item.findByIdAndUpdate(item.item, {
            $inc: { stock: -item.quantity },
          });
        }
      }
    } else if (action === "reject") {
      order.payment = false;
      order.paymentStatus = "Rejected";
      await order.save();
    } else if (action === "refund") {
      order.payment = false;
      order.paymentStatus = "Refunded";
      await order.save();
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Log verification activities
    if (action === "approve") {
      logActivity(req, {
        activityType: "Payments",
        action: "Payment Completed",
        targetEntity: "Order",
        entityId: order._id,
        description: `Manual UPI payment verified & completed for Order ${order._id}`,
        status: "success"
      });
      logActivity(req, {
        activityType: "Admin",
        action: "Payment Approved",
        targetEntity: "Order",
        entityId: order._id,
        description: `Admin approved payment for Order ${order._id}`,
        status: "success"
      });
    } else if (action === "reject") {
      logActivity(req, {
        activityType: "Payments",
        action: "Payment Rejected",
        targetEntity: "Order",
        entityId: order._id,
        description: `Manual UPI payment rejected for Order ${order._id}`,
        status: "failed"
      });
      logActivity(req, {
        activityType: "Admin",
        action: "Payment Rejected",
        targetEntity: "Order",
        entityId: order._id,
        description: `Admin rejected payment for Order ${order._id}`,
        status: "failed"
      });
    } else if (action === "refund") {
      logActivity(req, {
        activityType: "Payments",
        action: "Payment Refunded",
        targetEntity: "Order",
        entityId: order._id,
        description: `Payment refunded for Order ${order._id}`,
        status: "neutral"
      });
      logActivity(req, {
        activityType: "Orders",
        action: "Order Refunded",
        targetEntity: "Order",
        entityId: order._id,
        description: `Order ${order._id} marked as refunded`,
        status: "neutral"
      });
    }

    return res.status(200).json({ message: `Payment ${action}d successfully`, order });
  } catch (error) {
    return res.status(500).json({ message: `Failed to verify payment: ${error.message}` });
  }
};

/* ================= ANALYTICS ================= */
export const getAdminAnalytics = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Fetch last 30 days orders for sales chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });

    // Group sales by date
    const dailySalesMap = {};
    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
      });
      dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + (o.totalAmount || 0);
    });

    const dailySales = Object.keys(dailySalesMap).map(date => ({
      date,
      sales: dailySalesMap[date]
    }));

    // Group registration by user roles
    const [usersCount, ownersCount, deliveryCount] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "deliveryBoy" }),
    ]);

    const registrationShare = [
      { name: "Users", value: usersCount },
      { name: "Shop Owners", value: ownersCount },
      { name: "Delivery Boys", value: deliveryCount },
    ];

    // Popular foods (aggregate count from orders)
    const foodMap = {};
    orders.forEach(o => {
      o.shopOrders.forEach(so => {
        so.shopOrderItems.forEach(i => {
          foodMap[i.name] = (foodMap[i.name] || 0) + i.quantity;
        });
      });
    });

    const popularFoods = Object.keys(foodMap).map(name => ({
      name,
      quantity: foodMap[name]
    })).sort((a,b) => b.quantity - a.quantity).slice(0, 5);

    return res.status(200).json({
      dailySales,
      registrationShare,
      popularFoods,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch analytics: ${error.message}` });
  }
};

export const getAdminActivityLogs = async (req, res) => {
  try {
    const isSuperAdmin = await checkSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const {
      search = "",
      activityType = "",
      status = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (activityType) {
      query.activityType = activityType;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skipIndex = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      ActivityLog.find(query)
        .sort(sortOption)
        .skip(skipIndex)
        .limit(Number(limit)),
      ActivityLog.countDocuments(query)
    ]);

    return res.status(200).json({
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch activity logs: ${error.message}` });
  }
};
