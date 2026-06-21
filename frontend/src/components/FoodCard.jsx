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

  const [timeLeft, setTimeLeft] = useState("");
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

  /* ================= COUNTDOWN ================= */

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiresAt).getTime() - now;

      // if (distance <= 0) {
      //   setTimeLeft("Expired");
      //   clearInterval(interval);
      // } else {
      //   // const minutes = Math.floor((distance / 1000 / 60) % 60);
      //   // const seconds = Math.floor((distance / 1000) % 60);

      //   // setTimeLeft(`${minutes}m ${seconds}s`);
      //   const hours = Math.floor(distance / (1000 * 60 * 60));

      //   const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      //   if (hours > 0) {
      //     setTimeLeft(`${hours}h ${minutes}m`);
      //   } else {
      //     setTimeLeft(`${minutes}m`);
      //   }
      // }
      if (distance <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div
      className="relative w-60 bg-white rounded-2xl shadow-md
      overflow-hidden border border-gray-100
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Discount Badge */}
      {discount > 0 && !isExpired && (
        <div
          className="absolute top-3 left-3 bg-red-500 text-white
          text-xs px-3 py-1 rounded-full font-semibold shadow"
        >
          🔥 {discount}% OFF
        </div>
      )}

      {/* Expired Overlay */}
      {isExpired && (
        <div
          className="absolute inset-0 bg-black/60 flex items-center
          justify-center z-10 backdrop-blur-sm"
        >
          <span className="text-white font-bold text-lg">EXPIRED</span>
        </div>
      )}

      {/* Image */}
      <div className="overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="font-semibold text-gray-800 text-sm line-clamp-2">
          {name}
        </h2>

        {/* Price */}
        <div className="flex items-center gap-2">
          {discount > 0 && !isExpired ? (
            <>
              <span className="line-through text-gray-400 text-sm">
                ₹{formatPrice(price)}
              </span>

              <span className="text-red-600 font-bold text-base">
                ₹{formatPrice(finalPrice || price * (1 - discount / 100))}
              </span>
            </>
          ) : (
            <span className="text-gray-800 font-bold text-base">
              ₹{formatPrice(price)}
            </span>
          )}
          {/* <div
  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${stockColor}`}
>
  <FaBoxOpen size={12} />
  {stockMessage}
</div> */}
        </div>

        {/* STOCK BADGE (NEW UI) */}
        <div
          className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${stockColor}`}
        >
          {stockMessage}
        </div>

        {/* Expiry Timer */}
        {timeLeft && !isExpired && (
          <div
            className="text-xs font-medium text-red-500
            bg-red-50 px-2 py-1 rounded-full w-fit"
          >
            ⏳ {timeLeft}
          </div>
        )}

        {/* Out Of Stock Badge */}
        {/* {isOutOfStock && (
          <div
            className="text-xs font-medium text-gray-600
            bg-gray-100 px-2 py-1 rounded-full w-fit"
          >
            Out of Stock
          </div>
        )} */}

        {/* Cart Limit Warning */}
        {limitMsg && (
          <div
            className="flex items-center gap-2
            bg-red-100 text-red-700
            text-xs font-semibold
            px-3 py-1.5 rounded-lg
            shadow-md
            border border-red-200"
          >
            <span className="text-sm">⚠</span>
            Only {stock} items available
          </div>
        )}

        {/* Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isExpired || isOutOfStock}
          className={`mt-2 py-2 rounded-xl text-sm font-semibold
          transition-all duration-200
          ${
            isExpired || isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : added
                ? "bg-green-500 text-white scale-95"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
          }`}
        >
          {isExpired
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
