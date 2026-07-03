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
      className="min-h-screen flex justify-center px-6 py-10 bg-[#FAFAFA]"
    >
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <div
            className="p-2 rounded-full bg-white shadow-sm border border-gray-200
            hover:scale-105 transition cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack size={32} className="text-orange-500" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Your Cart
          </h1>
        </div>

        {/* Empty Cart */}
        {cartItems?.length === 0 ? (
          <div
            className="bg-white shadow-sm rounded-3xl p-10
            flex flex-col items-center justify-center
            text-center border border-gray-200"
          >
            <p className="text-gray-500 text-base mb-6 font-medium">
              Your Cart is Empty
            </p>

            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-sm"
              onClick={() => navigate("/")}
            >
              Explore Food Menu
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
              className="mt-8 bg-white shadow-sm rounded-2xl
              p-5 flex justify-between items-center
              border border-gray-200"
            >
              <h2 className="text-base font-semibold text-gray-700">
                Total Amount
              </h2>

              <span className="text-2xl font-extrabold text-orange-500">
                ₹{totalAmount}
              </span>
            </div>

            {/* Checkout Button */}
            {(() => {
              const hasExpiredItems = cartItems?.some(
                (item) => item.isExpired || (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now())
              );
              return (
                <div className="mt-6 flex flex-col items-end gap-3">
                  {hasExpiredItems && (
                    <span className="text-red-600 text-xs font-bold bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
                      ⚠️ Some items in your cart have expired. Please remove them before checkout.
                    </span>
                  )}
                  <button
                    disabled={hasExpiredItems}
                    className={`px-8 py-3.5 rounded-xl text-base font-bold uppercase tracking-wider shadow-sm transition ${
                      hasExpiredItems
                        ? "bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                    }`}
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;