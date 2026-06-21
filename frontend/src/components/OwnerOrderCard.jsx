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

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100
      p-5 space-y-5 hover:shadow-xl transition"
    >

      {/* ================= CUSTOMER INFO ================= */}
      <div className="space-y-1">

        <h2 className="text-lg font-bold text-gray-800">
          {data.user.fullName}
        </h2>

        <p className="text-sm text-gray-500">
          {data.user.email}
        </p>

        <p className="flex items-center gap-2 text-sm text-gray-600">
          <MdPhone className="text-orange-500" />
          {data.user.mobile}
        </p>

        {data.paymentMethod === "online" ? (
          <p className="text-sm text-gray-600">
            Payment:{" "}
            <span className="font-semibold text-green-600">
              {data.payment ? "Paid" : "Pending"}
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Payment Method:{" "}
            <span className="font-semibold capitalize">
              {data.paymentMethod}
            </span>
          </p>
        )}

      </div>

      {/* ================= ADDRESS ================= */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">

        <p>{data?.deliveryAddress?.text}</p>

        <p className="text-xs text-gray-400 mt-1">
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
      className="shrink-0 w-40 bg-white border border-gray-100
      rounded-xl shadow-sm p-2 hover:shadow-md transition"
    >

      <img
        src={item.item?.image || "/no-image.png"}
        alt=""
        className="w-full h-24 object-cover rounded-lg"
      />

      <p className="text-sm font-semibold mt-2">
        {item.name}
      </p>

      <p className="text-xs text-gray-500">
        Qty: {item.quantity} × ₹{item.price}
      </p>

    </div>
  );

})}

      </div>

      {/* ================= STATUS SECTION ================= */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">

        <span className="text-sm text-gray-600">
          Status:{" "}
          <span className="font-semibold capitalize text-orange-600">
            {data.shopOrders.status}
          </span>
        </span>

        <select
          className="rounded-lg border border-orange-400
          px-3 py-1 text-sm text-orange-600
          focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value
            )
          }
        >

          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out Of Delivery</option>

        </select>

      </div>

      {/* ================= DELIVERY BOYS ================= */}

      {data.shopOrders.status === "out of delivery" && (
        <div
          className="bg-orange-50 border border-orange-200
          rounded-xl p-3 text-sm space-y-2"
        >

          {data.shopOrders.assignedDeliveryBoy ? (
            <p className="font-semibold text-orange-600">
              Assigned Delivery Boy
            </p>
          ) : (
            <p className="font-semibold text-orange-600">
              Available Delivery Boys
            </p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index} className="text-gray-700">
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div className="text-gray-700">
              {data.shopOrders.assignedDeliveryBoy.fullName} -{" "}
              {data.shopOrders.assignedDeliveryBoy.mobile}
            </div>
          ) : (
            <div className="text-gray-500">
              Waiting for delivery boy to accept
            </div>
          )}

        </div>
      )}

      {/* ================= TOTAL ================= */}

      <div className="text-right font-bold text-gray-800 text-lg">

        Total:{" "}
        <span className="text-orange-600">
          ₹{data.shopOrders.subtotal}
        </span>

      </div>

    </div>
  );
}

export default OwnerOrderCard;
