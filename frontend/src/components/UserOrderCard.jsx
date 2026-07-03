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
    const getStatusPillClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-250";
      case "accepted":
      case "delivered":
      case "completed":
        return "bg-green-50 text-green-700 border-green-250";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-250";
      default: // pickedUp, outForDelivery, etc.
        return "bg-orange-50 text-orange-700 border-orange-250";
    }
  };

  return (
    <div
      className="bg-white rounded-3xl border border-gray-200
      p-6 space-y-6 shadow-sm hover:shadow-md transition"
    >

      {/* ================= ORDER HEADER ================= */}

      <div className="flex justify-between items-start border-b pb-3">

        <div>
          <p className="font-extrabold text-gray-900">
            Order #{data._id.slice(-6)}
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        <div className="text-right">

          {data.paymentMethod === "cod" ? (
            <p className="text-xs text-gray-400 font-bold uppercase">
              {data.paymentMethod}
            </p>
          ) : (
            <p className="text-xs text-gray-500 font-semibold">
              Payment: <span className={data.payment ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>{data.payment ? "Paid" : "Pending"}</span>
            </p>
          )}

          <div className="mt-1">
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${getStatusPillClass(data.shopOrders?.[0]?.status)}`}>
              {data.shopOrders?.[0]?.status}
            </span>
          </div>

        </div>

      </div>

      {/* ================= SHOP ORDERS ================= */}

      {data.shopOrders.map((shopOrder, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-2xl
          p-4 bg-gray-50/50 space-y-4"
        >

          {/* Shop Name */}
          <p className="font-bold text-sm text-gray-800">
            {shopOrder.shop.name}
          </p>

          {/* Items */}
          <div className="flex gap-4 overflow-x-auto pb-2">

            {shopOrder.shopOrderItems.map((item, index) => {

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

                  {shopOrder.status === "delivered" && item.item?._id && (
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          className={`text-base cursor-pointer ${
                            selectedRating[item.item._id] >= star
                              ? "text-yellow-450"
                              : "text-gray-300 hover:text-yellow-300"
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
          <div className="flex justify-between items-center border-t border-gray-200/60 pt-2">

            <p className="font-bold text-xs text-gray-700">
              Subtotal: ₹{shopOrder.subtotal}
            </p>

            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusPillClass(shopOrder.status)}`}>
              {shopOrder.status}
            </span>

          </div>

        </div>
      ))}

      {/* ================= TOTAL + TRACK ================= */}

      <div className="flex justify-between items-center border-t border-gray-200/60 pt-3">

        <p className="font-extrabold text-gray-950 text-base">
          Total: <span className="text-orange-500">₹{data.totalAmount}</span>
        </p>

        <button
          className="bg-orange-500 hover:bg-orange-600 text-white
          px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition hover:scale-102 cursor-pointer"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>

      </div>

    </div>
  );
}

export default UserOrderCard;
