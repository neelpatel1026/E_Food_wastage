// import React from 'react'
// import { FaCircleCheck } from "react-icons/fa6";
// import { useNavigate } from 'react-router-dom';
// function OrderPlaced() {
//     const navigate=useNavigate()
//   return (
//     <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
//       <FaCircleCheck className='text-green-500 text-6xl mb-4'/>
//       <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!
//       </h1>
//       <p className='text-gray-600 max-w-md mb-6'>Thank you for your purchase. Your order is being prepared.  
//         You can track your order status in the "My Orders" section.
//      </p>
//      <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition' onClick={()=>navigate("/my-orders")}>Back to my orders</button>
//     </div>
//   )
// }

// export default OrderPlaced


import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function OrderPlaced() {

  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6
      bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50"
    >

      {/* Success Card */}

      <div
        className="bg-white shadow-xl rounded-3xl
        p-10 max-w-md w-full text-center
        border border-gray-100"
      >

        {/* Success Icon */}

        <div className="flex justify-center mb-5">
          <div
            className="bg-green-100 p-4 rounded-full
            shadow-sm"
          >
            <FaCircleCheck className="text-green-500 text-5xl" />
          </div>
        </div>

        {/* Title */}

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Order Placed!
        </h1>

        {/* Description */}

        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Thank you for your purchase. Your order is being prepared.
          You can track your order status in the{" "}
          <span className="font-medium text-gray-700">
            My Orders
          </span>{" "}
          section.
        </p>

        {/* Button */}

        <button
          className="w-full bg-orange-500 hover:bg-orange-600
          text-white py-3 rounded-xl
          font-semibold transition shadow-md"
          onClick={() => navigate("/my-orders")}
        >
          Back to My Orders
        </button>

      </div>

    </div>
  );
}

export default OrderPlaced;
