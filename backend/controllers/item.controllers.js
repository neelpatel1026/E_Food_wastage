import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { logActivity } from "../utils/activityLogger.js";

const applyDynamicPricing = (items) => {
  const now = new Date();

  return items.map((item) => {
    let isExpired = false;
    let discount = item.discount || 0; // owner discount
    let finalPrice = item.price;

    if (item.expiresAt) {
      const totalTime = new Date(item.expiresAt) - new Date(item.createdAt);
      const remaining = new Date(item.expiresAt) - now;

      if (remaining <= 0) {
        isExpired = true;
      } else {
        const percentageRemaining = remaining / totalTime;

        // expiry discount
        if (percentageRemaining <= 0.2) {
          const expiryDiscount = 20;

          // choose highest discount
          discount = Math.max(discount, expiryDiscount);
        }
      }
    }

    finalPrice = item.price - (item.price * discount) / 100;

    return {
      ...item._doc,
      isExpired,
      discount,
      finalPrice,
    };
  });
};

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price, discount, expiryHours, stock } =
      req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }

    let expiresAt = null;
    // if (expiryMinutes) {
    //   expiresAt = new Date(Date.now() + expiryMinutes * 60000);
    // }
    if (expiryHours) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      discount,
      stock,
      image,
      shop: shop._id,
      expiresAt,
    });

    shop.items.push(item._id);
    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    logActivity(req, {
      activityType: "Food",
      action: "Food Added",
      targetEntity: "Item",
      entityId: item._id,
      description: `Added new food item "${name}" (Price: ₹${price}, Stock: ${stock})`,
      status: "success"
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `add item error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    // const { name, category, foodType, price, expiryMinutes } = req.body;
    const { name, category, foodType, price, discount, expiryHours } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let expiresAt = null;

    // if (expiryMinutes) {
    //   expiresAt = new Date(Date.now() + expiryMinutes * 60000);
    // }
    if (expiryHours) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    // const updateData = {
    //   name,
    //   category,
    //   foodType,
    //   price,
    //   stock: req.body.stock,
    // };
    const updateData = {
      name,
      category,
      foodType,
      price,
      discount,
      stock: req.body.stock,
    };

    if (image) updateData.image = image;
    // if (expiryMinutes !== undefined) updateData.expiresAt = expiresAt;
    if (expiryHours !== undefined) updateData.expiresAt = expiresAt;

    const originalItem = await Item.findById(itemId);
    if (!originalItem) {
      return res.status(400).json({ message: "item not found" });
    }

    const isDiscountChanged = discount !== undefined && Number(originalItem.discount || 0) !== Number(discount || 0);

    const item = await Item.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });

    logActivity(req, {
      activityType: "Food",
      action: isDiscountChanged ? "Discount Changed" : "Food Updated",
      targetEntity: "Item",
      entityId: item._id,
      description: isDiscountChanged
        ? `Discount for "${name}" changed from ${originalItem.discount || 0}% to ${discount}%`
        : `Food item "${name}" details updated`,
      status: "success"
    });

    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i.toString() !== item._id.toString());
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    logActivity(req, {
      activityType: "Food",
      action: "Food Deleted",
      targetEntity: "Item",
      entityId: item._id,
      description: `Deleted food item "${item.name}" from inventory`,
      status: "success"
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    if (!shops.length) {
      return res.status(400).json({ message: "shops not found" });
    }

    const shopIds = shops.map((shop) => shop._id);

    const items = await Item.find({ shop: { $in: shopIds } });

    const updatedItems = applyDynamicPricing(items);

    return res.status(200).json(updatedItems);
  } catch (error) {
    return res.status(500).json({
      message: `get item by city error ${error}`,
    });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const items = await Item.find({ shop: shopId });

    const updatedItems = applyDynamicPricing(items);

    return res.status(200).json(updatedItems);
  } catch (error) {
    return res.status(500).json({
      message: `get item by shop error ${error}`,
    });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;

    if (!query || !city) {
      return res.status(400).json({ message: "query and city required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    const shopIds = shops.map((s) => s._id);

    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");

    const updatedItems = applyDynamicPricing(items);

    return res.status(200).json(updatedItems);
  } catch (error) {
    return res.status(500).json({
      message: `search item error ${error}`,
    });
  }
};

export const rating = async (req, res) => {
  try {
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "itemId and rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 to 5" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const newCount = item.rating.count + 1;
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();
    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return res.status(500).json({ message: `rating error ${error}` });
  }
};
