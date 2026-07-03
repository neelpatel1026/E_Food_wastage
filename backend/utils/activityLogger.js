import ActivityLog from "../models/activityLog.model.js";
import User from "../models/user.model.js";

export const logActivity = async (req, data) => {
  try {
    const { activityType, action, targetEntity, entityId, description, status = "success" } = data;
    
    let userId = req?.userId || data.userId;
    let userName = data.userName || "Guest";
    let userRole = data.userRole || "guest";
    let email = data.email || "";

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userName = user.fullName;
        userRole = user.role;
        email = user.email;
        // Dynamically promote SUPER_ADMIN_EMAIL to superAdmin
        if (email && process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
          userRole = "superAdmin";
        }
      }
    }

    const ipAddress = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || "";

    // Create entry in background
    ActivityLog.create({
      activityType,
      action,
      userId,
      userName,
      userRole,
      email,
      targetEntity,
      entityId: entityId ? entityId.toString() : "",
      description,
      ipAddress,
      status
    }).catch(err => console.error("Async ActivityLog.create error:", err));

  } catch (error) {
    console.error("Activity logging error:", error);
  }
};
