// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();
// import connectDb from "./config/db.js";
// import cookieParser from "cookie-parser";
// import authRouter from "./routes/auth.routes.js";
// import cors from "cors";
// import userRouter from "./routes/user.routes.js";

// import itemRouter from "./routes/item.routes.js";
// import shopRouter from "./routes/shop.routes.js";
// import orderRouter from "./routes/order.routes.js";
// import http from "http";
// import { Server } from "socket.io";
// import { socketHandler } from "./socket.js";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["POST", "GET"],
//   },
// });

// app.set("io", io);

// const port = process.env.PORT || 5000;
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );
// app.use(express.json());
// app.use(cookieParser());
// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);
// app.use("/api/shop", shopRouter);
// app.use("/api/item", itemRouter);
// app.use("/api/order", orderRouter);

// socketHandler(io);
// server.listen(port, () => {
//   connectDb();
//   console.log(`server started at ${port}`);
// });

import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import shopRouter from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";
import adminRouter from "./routes/admin.routes.js";

import { socketHandler } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : "";
const allowedOrigins = [
  "http://localhost:5173", // local development
  clientUrl, // deployed frontend URL
].filter(Boolean);


/* ===============================
   Socket.IO Configuration
================================ */
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
// });

// const io = new Server(server, {
//   cors: {
//     origin: "https://e-food-wastage.vercel.app",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

/* ===============================
   Middleware
================================ */
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" }
});
app.use("/api/", limiter);

console.log("CLIENT_URL =", process.env.CLIENT_URL);
console.log("allowedOrigins =", allowedOrigins);

/* ===============================
   Routes
================================ */
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);

/* ===============================
   Socket Handler
================================ */
socketHandler(io);

/* ===============================
   Database + Server Start
================================ */
const port = process.env.PORT || 5000;

server.listen(port, async () => {
  await connectDb();
  console.log(`🚀 Server running on port ${port}`);
});
