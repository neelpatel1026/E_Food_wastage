import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice.js";
import { formatPrice } from "../utils/formatPrice";

function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    _id,
    image,
    name,
    category,
    foodType,
    price,
    stock,
    finalPrice,
    discount,
    expiresAt,
    isExpired,
  } = data;

  const [timeLeft, setTimeLeft] = useState("");

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
      //   const hours = Math.floor(distance / (1000 * 60 * 60));
      //   const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      //   setTimeLeft(`${hours}h ${minutes}m`);
      //   setTimeLeft(`${minutes}m ${seconds}s`);
      // }

      if (distance <= 0) {
        setTimeLeft("Expired");
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

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/delete/${_id}`, {
        withCredentials: true,
      });

      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="relative flex bg-white rounded-2xl shadow-lg overflow-hidden
      border border-gray-100 w-full max-w-3xl transition
      hover:shadow-2xl hover:scale-[1.01]"
    >
      {/* Discount Badge */}
      {discount > 0 && !isExpired && (
        <div
          className="absolute top-3 left-3 bg-red-500 text-white text-xs
          px-3 py-1 rounded-full font-semibold shadow-md"
        >
          🔥 {discount}% OFF
        </div>
      )}

      {/* Expired Overlay */}
      {isExpired && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
          <span className="text-white font-bold text-lg tracking-wide">
            EXPIRED
          </span>
        </div>
      )}

      {/* Image */}
      <div className="w-40 h-36 shrink-0 relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />

        {/* Veg / Non Veg Badge */}
        <div
          className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full font-semibold
          ${
            foodType === "veg"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {foodType}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-4 flex-1">
        {/* Top Info */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">{name}</h2>

          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Category:</span>{" "}
            {category}
          </p>

          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Stock:</span> {stock}
          </p>

          {/* Expiry Box */}
          {expiresAt && (
            <div
              className={`mt-3 px-3 py-1.5 rounded-full text-xs font-medium w-fit
              ${
                isExpired
                  ? "bg-red-100 text-red-600"
                  : discount > 0
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-600"
              }`}
            >
              {isExpired
                ? "Expired"
                : discount > 0
                  ? `Expiring Soon ⏳ ${timeLeft}`
                  : `Fresh 🟢 ${timeLeft}`}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-4">
          {/* Price */}
          <div className="text-lg font-bold">
            {discount > 0 && !isExpired ? (
              <div className="flex items-center gap-2">
                <span className="line-through text-gray-400 text-sm">
                  {/* ₹{price} */}₹{formatPrice(price)}
                </span>

                <span className="text-red-600 text-lg">
                  {/* ₹{finalPrice} */}
                  {/* ₹{formatPrice(finalPrice)} */}₹
                  {formatPrice(finalPrice || price * (1 - discount / 100))}
                </span>
              </div>
            ) : (
              <span className="text-orange-600">
                {/* ₹{price} */}₹{formatPrice(price)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-full bg-orange-50 text-orange-600
              hover:bg-orange-100 transition cursor-pointer"
              onClick={() => navigate(`/edit-item/${_id}`)}
            >
              <FaPen size={15} />
            </button>

            <button
              className="p-2 rounded-full bg-red-50 text-red-500
              hover:bg-red-100 transition cursor-pointer"
              onClick={handleDelete}
            >
              <FaTrashAlt size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
