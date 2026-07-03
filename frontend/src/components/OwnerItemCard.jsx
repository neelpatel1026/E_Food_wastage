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
  const [localExpired, setLocalExpired] = useState(false);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(expiresAt).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        setLocalExpired(true);
      } else {
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
          setTimeLeft(`🔥 Almost Expired (${timeText})`);
        } else if (totalMinutes < 60) {
          setTimeLeft(`⚠️ Hurry! Only ${totalMinutes} minutes left`);
        } else {
          setTimeLeft(`⏳ Expires In ${timeText}`);
        }
        setLocalExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const activeExpired = isExpired || localExpired;

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
      className={`relative flex bg-white rounded-2xl shadow-sm overflow-hidden
      border border-gray-200 w-full max-w-3xl transition-all duration-300 ${
        activeExpired ? "opacity-70 border-gray-300" : "hover:shadow-md"
      }`}
    >
      {/* Discount Badge */}
      {discount > 0 && !activeExpired && (
        <div
          className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase
          px-2.5 py-1 rounded-lg shadow-sm z-10"
        >
          🔥 {discount}% OFF
        </div>
      )}

      {/* Expired Overlay */}
      {activeExpired && (
        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <span className="text-white font-black text-sm uppercase tracking-widest border-2 border-white px-3 py-1 rounded-md">
            EXPIRED
          </span>
        </div>
      )}

      {/* Image */}
      <div className="w-40 h-36 shrink-0 relative bg-gray-50 border-r border-gray-100">
        <img src={image} alt={name} className="w-full h-full object-cover" />

        {/* Veg / Non Veg Badge */}
        <div
          className={`absolute bottom-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded border
          ${
            foodType === "veg"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-650 border-red-100"
          }`}
        >
          {foodType}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-5 flex-1 bg-white">
        {/* Top Info */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{name}</h2>

          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Category:</span>{" "}
            {category}
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-700">Stock:</span> {stock} units
          </p>

          {/* Expiry Box */}
          {expiresAt && (
            <div
              className={`mt-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border w-fit
              ${
                activeExpired
                  ? "bg-red-50 text-red-600 border-red-100"
                  : timeLeft.includes("⚠️")
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : timeLeft.includes("🔥")
                      ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                      : "bg-blue-50 text-blue-605 border-blue-100"
              }`}
            >
              {timeLeft}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-4">
          {/* Price */}
          <div className="text-lg font-bold">
            {discount > 0 && !activeExpired ? (
              <div className="flex items-baseline gap-2">
                <span className="text-red-600 font-extrabold text-lg">
                  ₹{formatPrice(finalPrice || price * (1 - discount / 100))}
                </span>
                <span className="line-through text-gray-400 text-xs font-semibold">
                  ₹{formatPrice(price)}
                </span>
              </div>
            ) : (
              <span className="text-gray-900 font-extrabold text-lg">
                ₹{formatPrice(price)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100
              hover:bg-orange-100 transition cursor-pointer"
              onClick={() => navigate(`/edit-item/${_id}`)}
            >
              <FaPen size={13} />
            </button>

            <button
              className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100
              hover:bg-red-100 transition cursor-pointer"
              onClick={handleDelete}
            >
              <FaTrashAlt size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
