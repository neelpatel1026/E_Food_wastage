import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function EditItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { itemId } = useParams();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  // const [expiryMinutes, setExpiryMinutes] = useState("");
  const [expiryHours, setExpiryHours] = useState("");
  const [stock, setStock] = useState("");

  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  /* ================= LOAD ITEM ================= */
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true },
        );

        const item = result.data;

        setName(item.name);
        setPrice(item.price);
        setCategory(item.category);
        setFoodType(item.foodType);
        setFrontendImage(item.image);
        setStock(item.stock);
        setDiscount(item.discount || 0);

        if (item.expiresAt) {
          // const remaining =
          //   (new Date(item.expiresAt) - new Date()) / 60000;
          const remaining = (new Date(item.expiresAt) - new Date()) / 3600000;
          if (remaining > 0) {
            setExpiryHours(Math.floor(remaining));
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchItem();
  }, [itemId]);

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      formData.append("discount", discount);
      // formData.append("expiryMinutes", expiryHours);
      formData.append("expiryHours", expiryHours);
      formData.append("stock", stock);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true },
      );

      dispatch(setMyShopData(result.data));
      navigate("/");
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-[#FAFAFA]">
      {/* Back Button */}
      <div
        className="absolute top-6 left-6 cursor-pointer hover:scale-105 transition p-2 bg-white rounded-full border border-gray-200 shadow-sm"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={28} className="text-orange-500" />
      </div>

      {/* Card */}
      <div className="max-w-lg w-full bg-white border border-gray-200 shadow-sm rounded-3xl p-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Edit Food Item
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Food Name */}
          <div>
            <label className="text-sm text-gray-700 font-semibold mb-2 block">
              Food Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter food name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm text-gray-750 font-semibold mb-2 block">
              Food Image
            </label>

            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-500 transition bg-gray-50/50">
              <div className="text-center text-orange-500">
                <span className="text-3xl mb-1 block">📸</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Click to upload food image
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </label>

            {frontendImage && (
              <img
                src={frontendImage}
                alt="food"
                className="w-full h-48 object-cover rounded-xl mt-4 border border-gray-200"
              />
            )}
          </div>
          
          {/* Price */}
          <div>
            <label className="text-sm text-gray-705 font-semibold mb-2 block">
              Base Price (₹)
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onWheel={(e) => e.target.blur()}
              placeholder="Enter price"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-750 font-semibold mb-2 block">
              Discount (%)
            </label>

            <input
              type="number"
              value={discount}
              min="0"
              max="100"
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Expiry Time */}
          <div>
            <label className="text-sm text-gray-750 font-semibold mb-2 block">
              Expiry Time (Hours)
            </label>

            <input
              type="number"
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              onWheel={(e) => e.target.blur()}
              placeholder="Example: 24"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm text-gray-750 font-semibold mb-2 block">
              Available Quantity
            </label>

            <input
              type="number"
              value={stock}
              min="0"
              onChange={(e) => setStock(e.target.value)}
              onWheel={(e) => e.target.blur()}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-805 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-700 font-semibold mb-2 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-750 transition cursor-pointer"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Food Type */}
          <div>
            <label className="text-sm text-gray-750 font-semibold mb-2 block">
              Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-750 transition cursor-pointer"
            >
              <option value="veg">Veg 🌱</option>
              <option value="non veg">Non Veg 🍗</option>
            </select>
          </div>

          {/* Submit */}
          <button
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm hover:bg-orange-600 transition flex justify-center items-center gap-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditItem;
