// /* eslint-disable no-unused-vars */
// import axios from 'axios'
// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { serverUrl } from '../App.jsx'

// function UserOrderCard({ data }) {
//     const navigate = useNavigate()
//     const [selectedRating, setSelectedRating] = useState({})//itemId:rating

//     const formatDate = (dateString) => {
//         const date = new Date(dateString)
//         return date.toLocaleString('en-GB', {
//             day: "2-digit",
//             month: "short",
//             year: "numeric"
//         })

//     }

//     const handleRating = async (itemId, rating) => {
//         try {
//             const result = await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
//             setSelectedRating(prev => ({
//                 ...prev, [itemId]: rating
//             }))
//         } catch (error) {
//             console.log(error)
//         }
//     }


//     return (
//         <div className='bg-white rounded-lg shadow p-4 space-y-4'>
//             <div className='flex justify-between border-b pb-2'>
//                 <div>
//                     <p className='font-semibold'>
//                         order #{data._id.slice(-6)}
//                     </p>
//                     <p className='text-sm text-gray-500'>
//                         Date: {formatDate(data.createdAt)}
//                     </p>
//                 </div>
//                 <div className='text-right'>
//                     {data.paymentMethod == "cod" ? <p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p> : <p className='text-sm text-gray-500 font-semibold'>Payment: {data.payment ? "true" : "false"}</p>}

//                     <p className='font-medium text-blue-600'>{data.shopOrders?.[0].status}</p>
//                 </div>
//             </div>

//             {data.shopOrders.map((shopOrder, index) => (
//                 <div className='"border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
//                     <p>{shopOrder.shop.name}</p>

//                     <div className='flex space-x-4 overflow-x-auto pb-2'>
//                         {shopOrder.shopOrderItems.map((item, index) => (
//                             <div key={index} className='shrink-0 w-40 border rounded-lg p-2 bg-white"'>
//                                 <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
//                                 <p className='text-sm font-semibold mt-1'>{item.name}</p>
//                                 <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>

//                                 {shopOrder.status == "delivered" && <div className='flex space-x-1 mt-2'>
//                                     {[1, 2, 3, 4, 5].map((star) => (
//                                         <button className={`text-lg ${selectedRating[item.item._id] >= star ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => handleRating(item.item._id,star)}>★</button>
//                                     ))}
//                                 </div>}



//                             </div>
//                         ))}
//                     </div>
//                     <div className='flex justify-between items-center border-t pt-2'>
//                         <p className='font-semibold'>Subtotal: {shopOrder.subtotal}</p>
//                         <span className='text-sm font-medium text-blue-600'>{shopOrder.status}</span>
//                     </div>
//                 </div>
//             ))}

//             <div className='flex justify-between items-center border-t pt-2'>
//                 <p className='font-semibold'>Total: ₹{data.totalAmount}</p>
//                 <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm' onClick={() => navigate(`/track-order/${data._id}`)}>Track Order</button>
//             </div>



//         </div>
//     )
// }

// export default UserOrderCard


/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App.jsx";

function UserOrderCard({ data }) {

  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({}); // itemId:rating

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );

      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100
      p-5 space-y-5 hover:shadow-xl transition"
    >

      {/* ================= ORDER HEADER ================= */}

      <div className="flex justify-between border-b pb-3">

        <div>
          <p className="font-bold text-gray-800">
            Order #{data._id.slice(-6)}
          </p>

          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        <div className="text-right">

          {data.paymentMethod === "cod" ? (
            <p className="text-sm text-gray-500 uppercase">
              {data.paymentMethod}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-semibold">
              Payment: {data.payment ? "Paid" : "Pending"}
            </p>
          )}

          <p className="text-sm font-semibold text-blue-600 capitalize">
            {data.shopOrders?.[0].status}
          </p>

        </div>

      </div>

      {/* ================= SHOP ORDERS ================= */}

      {data.shopOrders.map((shopOrder, index) => (
        <div
          key={index}
          className="border border-orange-100 rounded-xl
          p-4 bg-orange-50 space-y-4"
        >

          {/* Shop Name */}
          <p className="font-semibold text-gray-800">
            {shopOrder.shop.name}
          </p>

          {/* Items */}
          <div className="flex gap-4 overflow-x-auto pb-2">

            {shopOrder.shopOrderItems.map((item, index) => {

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

      {shopOrder.status === "delivered" && item.item?._id && (
        <div className="flex gap-1 mt-2">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              className={`text-lg ${
                selectedRating[item.item._id] >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() =>
                handleRating(item.item._id, star)
              }
            >
              ★
            </button>
          ))}
        </div>
      )}

    </div>
  );

})}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center border-t pt-2">

            <p className="font-semibold text-gray-700">
              Subtotal: ₹{shopOrder.subtotal}
            </p>

            <span className="text-sm font-semibold text-blue-600 capitalize">
              {shopOrder.status}
            </span>

          </div>

        </div>
      ))}

      {/* ================= TOTAL + TRACK ================= */}

      <div className="flex justify-between items-center border-t pt-3">

        <p className="font-bold text-gray-800 text-lg">
          Total: ₹{data.totalAmount}
        </p>

        <button
          className="bg-orange-500 hover:bg-orange-600 text-white
          px-4 py-2 rounded-lg text-sm font-medium transition"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>

      </div>

    </div>
  );
}

export default UserOrderCard;
