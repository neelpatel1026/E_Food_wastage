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

  return (
    <div
      className="flex items-center justify-between
      bg-white rounded-2xl border border-gray-100
      shadow-md hover:shadow-xl transition-all
      p-4 gap-4"
    >

      {/* LEFT SECTION */}

      <div className="flex items-center gap-4">

        <div className="w-20 h-20 rounded-xl overflow-hidden border">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">

          <h2 className="font-semibold text-gray-800 text-sm md:text-base">
            {data.name}
          </h2>

          <p className="text-xs text-gray-500">
            ₹{data.price} × {data.quantity}
          </p>

          <p className="font-bold text-orange-500 text-sm md:text-base">
            ₹{data.price * data.quantity}
          </p>

        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-3">

        {/* Quantity Controller */}

        <div
          className="flex items-center gap-3
          bg-gray-100 rounded-full
          px-3 py-1"
        >

          <button
            className="text-gray-600 hover:text-orange-600 transition"
            onClick={handleDecrease}
          >
            <FaMinus size={12} />
          </button>

          <span className="font-medium text-sm w-5 text-center">
            {data.quantity}
          </span>

          <button
            className="text-gray-600 hover:text-orange-600 transition"
            onClick={handleIncrease}
          >
            <FaPlus size={12} />
          </button>

        </div>

        {/* Delete */}

        <button
          className="p-2 rounded-full
          bg-red-100 text-red-600
          hover:bg-red-200 transition"
          onClick={() => dispatch(removeCartItem(data._id))}
        >
          <CiTrash size={18} />
        </button>

      </div>

    </div>
  );
}

export default CartItemCard;