// import React from 'react'
// import { IoIosArrowRoundBack } from "react-icons/io";
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import CartItemCard from '../components/CartItemCard.jsx';
// function CartPage() {
//     const navigate = useNavigate()
//     const { cartItems, totalAmount } = useSelector(state => state.user)
//     return (
//         <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
//             <div className='w-full max-w-200'>
//                 <div className='flex items-center gap-5 mb-6 '>
//                     <div className=' z-10 ' onClick={() => navigate("/")}>
//                         <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
//                     </div>
//                     <h1 className='"text-2xl font-bold  text-start'>Your Cart</h1>
//                 </div>
//                 {cartItems?.length == 0 ? (
//                     <p className='text-gray-500 text-lg text-center'>Your Cart is Empty</p>
//                 ) : (<>
//                     <div className='space-y-4'>
//                         {cartItems?.map((item, index) => (
//                             <CartItemCard data={item} key={index} />
//                         ))}
//                     </div>
//                     <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>

//                         <h1 className='text-lg font-semibold'>Total Amount</h1>
//                         <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
//                     </div>
//                     <div className='mt-4 flex justify-end' > 
//                         <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer' onClick={()=>navigate("/checkout")}>Proceed to CheckOut</button>
//                     </div>
//                 </>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default CartPage


import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard.jsx";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  return (
    <div
      className="min-h-screen flex justify-center px-6 py-10
      bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50"
    >
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <div
            className="p-2 rounded-full bg-white shadow-md
            hover:scale-110 transition cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack size={32} className="text-orange-500" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Your Cart
          </h1>
        </div>

        {/* Empty Cart */}
        {cartItems?.length === 0 ? (
          <div
            className="bg-white shadow-xl rounded-2xl p-10
            flex flex-col items-center justify-center
            text-center border border-gray-100"
          >
            <p className="text-gray-500 text-lg mb-4">
              Your Cart is Empty
            </p>

            <button
              className="bg-gradient-to-r from-orange-500 to-red-500
              text-white px-6 py-3 rounded-full
              font-medium shadow-lg
              hover:scale-105 transition"
              onClick={() => navigate("/")}
            >
              Explore Food
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-5">
              {cartItems?.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            {/* Total Amount */}
            <div
              className="mt-8 bg-white shadow-xl rounded-2xl
              p-5 flex justify-between items-center
              border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-gray-700">
                Total Amount
              </h2>

              <span className="text-2xl font-bold text-orange-500">
                ₹{totalAmount}
              </span>
            </div>

            {/* Checkout Button */}
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gradient-to-r from-orange-500 to-red-500
                text-white px-8 py-3 rounded-full
                text-lg font-medium shadow-lg
                hover:scale-105 hover:shadow-xl
                transition cursor-pointer"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;