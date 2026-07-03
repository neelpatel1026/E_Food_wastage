import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getDashboardStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminShops,
  updateAdminShopStatus,
  getAdminOrders,
  adminVerifyPayment,
  getAdminAnalytics,
  getAdminActivityLogs,
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.get("/stats", isAuth, getDashboardStats);
adminRouter.get("/users", isAuth, getAdminUsers);
adminRouter.put("/users/:id", isAuth, updateAdminUser);
adminRouter.delete("/users/:id", isAuth, deleteAdminUser);
adminRouter.get("/shops", isAuth, getAdminShops);
adminRouter.put("/shops/:id", isAuth, updateAdminShopStatus);
adminRouter.get("/orders", isAuth, getAdminOrders);
adminRouter.post("/payments/:orderId/verify", isAuth, adminVerifyPayment);
adminRouter.get("/analytics", isAuth, getAdminAnalytics);
adminRouter.get("/activity-logs", isAuth, getAdminActivityLogs);

export default adminRouter;
