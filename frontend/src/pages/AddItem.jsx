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
  const [expiryMinutes, setExpiryMinutes] = useState("1");
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
      formData.append("expiryMinutes", expiryMinutes);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6
    bg-gradient-to-br from-orange-50 via-emerald-50 to-teal-100 relative overflow-hidden">

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
        className="absolute top-6 left-6 bg-white p-2 rounded-full shadow-md cursor-pointer
        hover:scale-110 transition"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={32} className="text-emerald-600" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-xl bg-white/90 backdrop-blur-xl
        shadow-2xl rounded-3xl p-10 border border-white/40 relative z-10"
      >

        {/* Header */}
        <div className="flex flex-col items-center mb-8">

          <div className="bg-emerald-100 p-4 rounded-full shadow-md mb-4">
            <FaUtensils className="text-emerald-600 w-12 h-12" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
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
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Food Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter food name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Upload Food Image
            </label>

            <div
              className="relative border-2 border-dashed border-emerald-400
              rounded-xl p-6 text-center cursor-pointer hover:bg-emerald-50 transition"
            >

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {!frontendImage ? (
                <div className="flex flex-col items-center text-emerald-600">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-sm font-medium">
                    Click to Upload Image
                  </p>
                </div>
              ) : (
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-52 object-cover rounded-xl shadow-md"
                />
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Price
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
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
<div>
  <label className="block mb-2 text-sm font-medium text-gray-600">
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
    focus:outline-none focus:ring-2 focus:ring-emerald-500"
  />
</div>


</div>

          {/* Expiry + Stock */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Expiry Time (Minutes)
              </label>

              <input
                type="number"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                placeholder="60"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Quantity
              </label>

              <input
                type="number"
                value={stock}
                min="0"
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200
            focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cate, index) => (
              <option key={index} value={cate}>
                {cate}
              </option>
            ))}
          </select>

          {/* Food Type */}
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200
            focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="veg">Veg</option>
            <option value="non veg">Non Veg</option>
          </select>

          {/* Submit */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl
            font-semibold shadow-lg hover:bg-emerald-700 transition"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color="white" />
            ) : (
              "Save Food 🍽"
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
            className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3
            rounded-xl shadow-xl z-[9999]"
          >
            ✅ Food Added Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddItem;
