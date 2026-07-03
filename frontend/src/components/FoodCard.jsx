import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice.js";
import { formatPrice } from "../utils/formatPrice";
import { FaBoxOpen } from "react-icons/fa";

function FoodCard({ data }) {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);

  const {
    name,
    image,
    price,
    finalPrice,
    discount,
    expiresAt,
    isExpired,
    stock,
  } = data;

  const [added, setAdded] = useState(false);
  const [limitMsg, setLimitMsg] = useState(false);

  const isOutOfStock = stock <= 0;

  /* ================= STOCK STATUS ================= */

  let stockMessage = "";
  let stockColor = "";

  if (stock === 0) {
    stockMessage = "Out of Stock";
    stockColor = "bg-gray-100 text-gray-600";
  } else if (stock <= 3) {
    stockMessage = `Only ${stock} left`;
    stockColor = "bg-red-100 text-red-600";
  } else if (stock <= 10) {
    stockMessage = `${stock} available`;
    stockColor = "bg-orange-100 text-orange-600";
  } else {
    stockMessage = `${stock} available`;
    stockColor = "bg-green-100 text-green-600";
  }
  /* ================= ADD TO CART ================= */

  const handleAddToCart = () => {
    if (isExpired || isOutOfStock) return;

    const itemInCart = cartItems.find((i) => i._id === data._id);
    const currentQty = itemInCart ? itemInCart.quantity : 0;

    if (currentQty >= stock) {
      setLimitMsg(true);

      setTimeout(() => {
        setLimitMsg(false);
      }, 1500);

      return;
    }

    dispatch(addToCart(data));

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 900);
  };

  const [timeLeft, setTimeLeft] = useState(null);
  const [localExpired, setLocalExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(expiresAt).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        setLocalExpired(true);
      } else {
        setTimeLeft(distance);
        setLocalExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const activeExpired = isExpired || localExpired;

  const getTimerMarkup = () => {
    if (!expiresAt) return null;
    if (activeExpired) {
      return (
        <span className="text-[9px] font-black text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase">
          ❌ Expired
        </span>
      );
    }

    const now = new Date().getTime();
    const distance = new Date(expiresAt).getTime() - now;

    if (distance <= 0) {
      return (
        <span className="text-[9px] font-black text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase">
          ❌ Expired
        </span>
      );
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let timeText = "";
    if (days > 0) {
      timeText = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    } else if (hours > 0) {
      timeText = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    } else if (minutes > 0) {
      timeText = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    } else {
      timeText = `${seconds}s`;
    }

    const totalMinutes = Math.floor(distance / (1000 * 60));

    if (totalMinutes < 15) {
      return (
        <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md uppercase animate-pulse flex items-center gap-1 shrink-0">
          🔥 Almost Expired ({timeText})
        </span>
      );
    } else if (totalMinutes < 60) {
      return (
        <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shrink-0">
          ⚠️ Hurry! Only {totalMinutes} minutes left
        </span>
      );
    }

    return (
      <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shrink-0">
        ⏳ {timeText}
      </span>
    );
  };

  return (
    <div
      className={`relative w-64 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 transition-all duration-300 ${
        activeExpired 
          ? "opacity-65 filter grayscale-[30%] blur-[0.5px] border-gray-300" 
          : "hover:shadow-md hover:-translate-y-1.5"
      }`}
    >
      {/* Discount Badge */}
      {discount > 0 && !activeExpired && (
        <div
          className="absolute top-3 left-3 bg-red-500 text-white
          text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm z-10"
        >
          🔥 {discount}% OFF
        </div>
      )}

      {/* Expired Label overlay */}
      {activeExpired && (
        <div className="absolute top-3 right-3 bg-gray-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm z-10">
          ❌ Expired
        </div>
      )}

      {/* Image */}
      <div className="overflow-hidden aspect-[4/3] bg-gray-50 border-b border-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <h2 className="font-bold text-gray-900 text-sm line-clamp-1">
          {name}
        </h2>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {discount > 0 && !activeExpired ? (
            <>
              <span className="text-red-600 font-extrabold text-lg">
                ₹{formatPrice(finalPrice || price * (1 - discount / 100))}
              </span>
              <span className="line-through text-gray-400 text-xs font-semibold">
                ₹{formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-extrabold text-lg">
              ₹{formatPrice(price)}
            </span>
          )}
        </div>

        {/* Stock & Expiry Badges */}
        <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
          <div
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${stockColor}`}
          >
            {stockMessage}
          </div>

          {getTimerMarkup()}
        </div>

        {/* Cart Limit Warning */}
        {limitMsg && (
          <div
            className="flex items-center gap-1.5
            bg-red-50 text-red-700
            text-[10px] font-bold
            px-2.5 py-1 rounded-lg
            border border-red-100 mt-1"
          >
            <span>⚠️ Limit: {stock} available</span>
          </div>
        )}

        {/* Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={activeExpired || isOutOfStock}
          className={`mt-2 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase
          transition-all duration-200 hover:scale-102
          ${
            activeExpired || isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : added
                ? "bg-green-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
          }`}
        >
          {activeExpired
            ? "Expired"
            : isOutOfStock
              ? "Out of Stock"
              : added
                ? "✓ Added"
                : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
