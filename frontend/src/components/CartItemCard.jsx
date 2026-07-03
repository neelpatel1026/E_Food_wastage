import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { removeCartItem, updateQuantity } from "../redux/userSlice.js";

function CartItemCard({ data }) {

  const dispatch = useDispatch();

  const handleIncrease = () => {

  if (data.quantity >= data.stock) {
    alert(`Only ${data.stock} items available`)
    return
  }

  dispatch(updateQuantity({
    id: data._id,
    quantity: data.quantity + 1
  }))

}

  const handleDecrease = () => {
    if (data.quantity > 1) {
      dispatch(updateQuantity({ id: data._id, quantity: data.quantity - 1 }));
    }
  };

  const isExpired = data.isExpired || (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now());

  return (
    <div
      className={`flex items-center justify-between bg-white rounded-2xl border transition p-4 gap-4 ${
        isExpired 
          ? "opacity-60 border-red-200 bg-red-50/5 grayscale-[30%] blur-[0.5px]" 
          : "border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            {data.name}
            {isExpired && (
              <span className="text-[9px] font-black text-red-650 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md uppercase shrink-0">
                Expired
              </span>
            )}
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            ₹{data.price} × {data.quantity}
          </p>

          <p className="font-extrabold text-orange-500 text-sm mt-1">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* Quantity Controller */}
        <div
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1"
        >
          <button
            disabled={isExpired}
            className="p-1 text-gray-500 hover:text-orange-500 transition disabled:opacity-30 disabled:pointer-events-none"
            onClick={handleDecrease}
          >
            <FaMinus size={10} />
          </button>

          <span className="font-semibold text-xs w-6 text-center text-gray-800">
            {data.quantity}
          </span>

          <button
            disabled={isExpired}
            className="p-1 text-gray-500 hover:text-orange-500 transition disabled:opacity-30 disabled:pointer-events-none"
            onClick={handleIncrease}
          >
            <FaPlus size={10} />
          </button>
        </div>

        {/* Delete */}
        <button
          className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition"
          onClick={() => dispatch(removeCartItem(data._id))}
        >
          <CiTrash size={16} />
        </button>
      </div>
    </div>
  );
}

export default CartItemCard;