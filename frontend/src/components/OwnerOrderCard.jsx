// /* eslint-disable no-unused-vars */
// import axios from 'axios';
// import React from 'react'
// import { MdPhone } from "react-icons/md";
// import { serverUrl } from '../App.jsx';
// import { useDispatch } from 'react-redux';
// import { updateOrderStatus } from '../redux/userSlice.js';
// import { useState } from 'react';
// import { useEffect } from 'react';
// function OwnerOrderCard({ data }) {
//     const [availableBoys,setAvailableBoys]=useState([])
// const dispatch=useDispatch()
//     const handleUpdateStatus=async (orderId,shopId,status) => {
//         try {
//             const result=await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true})
//              dispatch(updateOrderStatus({orderId,shopId,status}))
//              setAvailableBoys(result.data.availableBoys)
//              console.log(result.data)
//         } catch (error) {
//             console.log(error)
//         }
//     }


  
//     return (
//         <div className='bg-white rounded-lg shadow p-4 space-y-4'>
//             <div>
//                 <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullName}</h2>
//                 <p className='text-sm text-gray-500'>{data.user.email}</p>
//                 <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdPhone /><span>{data.user.mobile}</span></p>
//                 {data.paymentMethod=="online"?<p className='gap-2 text-sm text-gray-600'>payment: {data.payment?"true":"false"}</p>:<p className='gap-2 text-sm text-gray-600'>Payment Method: {data.paymentMethod}</p>}
                
//             </div>

//             <div className='flex items-start flex-col gap-2 text-gray-600 text-sm'>
//                 <p>{data?.deliveryAddress?.text}</p>
//                 <p className='text-xs text-gray-500'>Lat: {data?.deliveryAddress.latitude} , Lon {data?.deliveryAddress.longitude}</p>
//             </div>

//             <div className='flex space-x-4 overflow-x-auto pb-2'>
//                 {data.shopOrders.shopOrderItems.map((item, index) => (
//                     <div key={index} className='shrink-0 w-40 border rounded-lg p-2 bg-white"'>
//                         <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
//                         <p className='text-sm font-semibold mt-1'>{item.name}</p>
//                         <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>
//                     </div>
//                 ))}
//             </div>

// <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
// <span className='text-sm'>status: <span className='font-semibold capitalize text-[#ff4d2d]'>{data.shopOrders.status}</span>
// </span>

// <select  className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]' onChange={(e)=>handleUpdateStatus(data._id,data.shopOrders.shop._id,e.target.value)}>
//     <option value="">Change</option>
// <option value="pending">Pending</option>
// <option value="preparing">Preparing</option>
// <option value="out of delivery">Out Of Delivery</option>
// </select>

// </div>

// {data.shopOrders.status=="out of delivery" && 
// <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50 gap-4">
//     {data.shopOrders.assignedDeliveryBoy?<p>Assigned Delivery Boy:</p>:<p>Available Delivery Boys:</p>}
//    {availableBoys?.length>0?(
//      availableBoys.map((b,index)=>(
//         <div className='text-gray-800'>{b.fullName}-{b.mobile}</div>
//      ))
//    ):data.shopOrders.assignedDeliveryBoy?<div>{data.shopOrders.assignedDeliveryBoy.fullName}-{data.shopOrders.assignedDeliveryBoy.mobile}</div>:<div>Waiting for delivery boy to accept</div>}
// </div>}

// <div className='text-right font-bold text-gray-800 text-sm'>
//  Total: ₹{data.shopOrders.subtotal}
// </div>
//         </div>
//     )
// }

// export default OwnerOrderCard



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
