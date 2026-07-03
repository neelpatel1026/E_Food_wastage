/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice.js";

function OwnerOrderCard({ data }) {

  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data.availableBoys);

    } catch (error) {
      console.log(error);
    }
  };

  const getStatusPillClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-250";
      case "preparing":
        return "bg-amber-50 text-amber-700 border-amber-250";
      case "out of delivery":
      case "dispatched":
        return "bg-orange-50 text-orange-700 border-orange-250";
      case "delivered":
      case "completed":
        return "bg-green-50 text-green-700 border-green-250";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-250";
      default:
        return "bg-gray-50 text-gray-750 border-gray-250";
    }
  };

  return (
    <div
      className="bg-white rounded-3xl border border-gray-200
      p-6 space-y-6 shadow-sm hover:shadow-md transition"
    >

      {/* ================= CUSTOMER INFO ================= */}
      <div className="space-y-1 bg-white">

        <h2 className="text-xl font-extrabold text-gray-900">
          {data.user.fullName}
        </h2>

        <p className="text-xs text-gray-400">
          {data.user.email}
        </p>

        <p className="flex items-center gap-2 text-xs font-semibold text-gray-650 mt-1">
          <MdPhone className="text-orange-500" />
          {data.user.mobile}
        </p>

        <div className="mt-2 text-xs text-gray-600">
          {data.paymentMethod === "online" ? (
            <span>
              Payment:{" "}
              <span className={`font-bold ${data.payment ? "text-green-600" : "text-yellow-600"}`}>
                {data.payment ? "Paid Securely" : "Pending"}
              </span>
            </span>
          ) : (
            <span>
              Payment Method:{" "}
              <span className="font-bold uppercase">
                {data.paymentMethod}
              </span>
            </span>
          )}
        </div>

      </div>

      {/* ================= ADDRESS ================= */}
      <div className="text-xs text-gray-600 bg-gray-50/50 border border-gray-200 p-4 rounded-2xl">

        <p className="font-medium text-gray-800">{data?.deliveryAddress?.text}</p>

        <p className="text-[10px] text-gray-400 mt-1.5">
          Lat: {data?.deliveryAddress.latitude} | Lon:{" "}
          {data?.deliveryAddress.longitude}
        </p>

      </div>

      {/* ================= ORDER ITEMS ================= */}
      <div className="flex gap-4 overflow-x-auto pb-2">

        {data.shopOrders.shopOrderItems.map((item, index) => {

          if (!item?.item) return null;

          return (
            <div
              key={index}
              className="shrink-0 w-40 bg-white border border-gray-200
              rounded-2xl p-2.5 hover:shadow-sm transition"
            >

              <img
                src={item.item?.image || "/no-image.png"}
                alt=""
                className="w-full h-20 object-cover rounded-xl"
              />

              <p className="text-xs font-bold text-gray-900 mt-2 truncate">
                {item.name}
              </p>

              <p className="text-[10px] text-gray-400 mt-0.5">
                Qty: {item.quantity} × ₹{item.price}
              </p>

            </div>
          );

        })}
      </div>

      {/* ================= STATUS SECTION ================= */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">

        <span className="text-xs text-gray-600 font-semibold">
          Status:{" "}
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${getStatusPillClass(data.shopOrders.status)}`}>
            {data.shopOrders.status}
          </span>
        </span>

        <select
          className="rounded-xl border border-gray-200 bg-white
          px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-500
          focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value
            )
          }
        >
          <option value="">Change Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out Of Delivery</option>
        </select>

      </div>

      {/* ================= DELIVERY BOYS ================= */}

      {data.shopOrders.status === "out of delivery" && (
        <div
          className="bg-orange-50/30 border border-orange-100
          rounded-2xl p-4 text-xs space-y-2"
        >

          {data.shopOrders.assignedDeliveryBoy ? (
            <p className="font-extrabold text-orange-600 uppercase tracking-wide text-[10px]">
              Assigned Delivery Boy
            </p>
          ) : (
            <p className="font-extrabold text-orange-600 uppercase tracking-wide text-[10px]">
              Available Delivery Boys
            </p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index} className="text-gray-700 font-medium">
                🏍️ {b.fullName} - {b.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div className="text-gray-700 font-medium">
              🏍️ {data.shopOrders.assignedDeliveryBoy.fullName} -{" "}
              {data.shopOrders.assignedDeliveryBoy.mobile}
            </div>
          ) : (
            <div className="text-gray-405 italic">
              Waiting for delivery boy to accept...
            </div>
          )}

        </div>
      )}

      {/* ================= TOTAL ================= */}

      <div className="text-right font-bold text-gray-900 text-base border-t border-gray-200/60 pt-3">
        Total Subtotal:{" "}
        <span className="text-orange-500 font-black">
          ₹{data.shopOrders.subtotal}
        </span>
      </div>

    </div>
  );
}

export default OwnerOrderCard;
