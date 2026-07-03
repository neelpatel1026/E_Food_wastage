import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket } from "./redux/userSlice";

// export const serverUrl="http://localhost:8000"
export const serverUrl = import.meta.env.VITE_API_URL;

function App() {
  const { userData, isLoading, socket } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  // Create socket once on app mount
  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  // Handle identity mapping and connection/reconnection events
  useEffect(() => {
    if (!socket || !userData?._id) return;

    const handleConnect = () => {
      socket.emit("identity", { userId: userData._id });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, userData?._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-2xl animate-bounce shadow-md">
          🥑
        </div>
        <h1 className="text-xl font-extrabold text-orange-500 mt-4 tracking-wider animate-pulse">
          Rebite Loading...
        </h1>
      </div>
    );
  }

  const isOwnerOrAdmin = userData && (userData.role === "owner" || userData.role === "superAdmin");
  const isCustomer = userData && userData.role === "user";

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/create-edit-shop"
        element={isOwnerOrAdmin ? <CreateEditShop /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/add-item"
        element={isOwnerOrAdmin ? <AddItem /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/edit-item/:itemId"
        element={isOwnerOrAdmin ? <EditItem /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/cart"
        element={isCustomer ? <CartPage /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/checkout"
        element={isCustomer ? <CheckOut /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/order-placed"
        element={isCustomer ? <OrderPlaced /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <Shop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/payment/:orderId"
        element={isCustomer ? <PaymentPage /> : <Navigate to={userData ? "/" : "/signin"} />}
      />
      <Route
        path="/admin"
        element={userData && userData.role === "superAdmin" ? <AdminDashboard /> : <Navigate to={"/"} />}
      />
    </Routes>
  );
}

export default App;
