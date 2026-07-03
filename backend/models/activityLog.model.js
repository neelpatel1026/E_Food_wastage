import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: ["Authentication", "Orders", "Payments", "Delivery", "Users", "Shops", "Food", "Admin", "System"],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  userName: {
    type: String,
    default: "Guest"
  },
  userRole: {
    type: String,
    default: "guest"
  },
  email: {
    type: String,
    default: ""
  },
  targetEntity: {
    type: String,
    default: ""
  },
  entityId: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  ipAddress: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["success", "failed", "warning", "info", "neutral"],
    default: "success"
  }
}, { timestamps: true });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
