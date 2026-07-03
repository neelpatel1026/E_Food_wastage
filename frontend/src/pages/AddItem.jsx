/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [expiryHours, setExpiryHours] = useState("1");
  const [stock, setStock] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [discount, setDiscount] = useState(""); // ⭐ FIX


  const categories = [
    "Snacks","Main Course","Desserts","Pizza","Burgers",
    "Sandwiches","South Indian","North Indian",
    "Chinese","Fast Food","Others"
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      // formData.append("price", price);
      formData.append("price", price);
formData.append("discount", discount);
      formData.append("expiryHours", expiryHours);
      formData.append("stock", stock);
      if (backendImage) formData.append("image", backendImage);

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMyShopData(result.data));

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate("/");
      }, 900);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#FAFAFA] relative overflow-hidden">

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute text-6xl top-20 left-12 opacity-10"
      >
        🍕
      </motion.div>

      <motion.div
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute text-6xl bottom-24 right-20 opacity-10"
      >
        🍔
      </motion.div>

      {/* Back Button */}
      <div
        className="absolute top-6 left-6 bg-white p-2 rounded-full shadow-sm border border-gray-200 cursor-pointer
        hover:scale-105 transition"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={32} className="text-orange-500" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-xl bg-white border border-gray-200
        shadow-sm rounded-3xl p-10 relative z-10"
      >

        {/* Header */}
        <div className="flex flex-col items-center mb-8">

          <div className="bg-orange-50 p-4 rounded-full border border-orange-100 mb-4">
            <FaUtensils className="text-orange-500 w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">
            Add Food Item
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Add delicious food to your restaurant menu 🍽
          </p>

        </div>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Food Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter food name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-750">
              Upload Food Image
            </label>

            <div
              className="relative border-2 border-dashed border-gray-200 hover:border-orange-500
              rounded-2xl p-6 text-center cursor-pointer hover:bg-orange-50/20 transition"
            >

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {!frontendImage ? (
                <div className="flex flex-col items-center text-orange-500">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Click to Upload Image
                  </p>
                </div>
              ) : (
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-52 object-cover rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Base Price (₹)
            </label>

            <input
              type="text"
              value={price}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setPrice(val);
              }}
              placeholder="Enter price"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-750">
              Discount (%)
            </label>

            <input
              type="number"
              value={discount}
              min="0"
              max="100"
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter discount %"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Expiry + Stock */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-750">
                Expiry Time (Hours)
              </label>

              <input
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-750">
                Stock Quantity
              </label>

              <input
                type="number"
                value={stock}
                min="0"
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
              />
            </div>

          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
              focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-750 transition cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cate, index) => (
                <option key={index} value={cate}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          {/* Food Type */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-750">
              Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
              focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-750 transition cursor-pointer"
            >
              <option value="veg">Veg 🌱</option>
              <option value="non veg">Non Veg 🍗</option>
            </select>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl
            font-bold uppercase tracking-wider text-sm shadow-sm hover:bg-orange-600 transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color="white" />
            ) : (
              "Save Food Item"
            )}
          </motion.button>

        </form>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3
            rounded-xl shadow-md z-[9999] font-bold text-sm"
          >
            ✅ Food Added Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddItem;
