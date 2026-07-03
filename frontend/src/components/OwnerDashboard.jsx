// import React from "react";
// import Nav from "./Nav.jsx";
// import { useSelector } from "react-redux";
// import { FaUtensils } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { FaPen } from "react-icons/fa";
// import OwnerItemCard from "./OwnerItemCard.jsx";

// function OwnerDashboard() {
//   const { myShopData } = useSelector((state) => state.owner);
//   const navigate = useNavigate();

//   return (
//     <div className="w-full min-h-screen bg-linear-to-br from-[#fff9f6] to-[#f4fdf9] flex flex-col items-center">
//       <Nav />

//       {!myShopData && (
//         <div className="flex justify-center items-center p-6">
//           <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 border text-center">
//             <FaUtensils className="text-[#ff4d2d] w-20 h-20 mb-4 mx-auto" />
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">
//               Add Your Restaurant
//             </h2>
//             <p className="text-gray-500 mb-6">
//               Start selling before food expires and reduce waste.
//             </p>
//             <button
//               className="bg-[#ff4d2d] text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
//               onClick={() => navigate("/create-edit-shop")}
//             >
//               Get Started
//             </button>
//           </div>
//         </div>
//       )}

//       {myShopData && (
//         <div className="w-full flex flex-col items-center gap-8 px-6">

//           <h1 className="text-3xl font-bold text-gray-800 mt-10">
//             Welcome to {myShopData.name}
//           </h1>

//           {/* Shop Card */}
//           <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-3xl relative">
//             <div
//               className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full cursor-pointer"
//               onClick={() => navigate("/create-edit-shop")}
//             >
//               <FaPen size={18} />
//             </div>

//             <img
//               src={myShopData.image}
//               alt=""
//               className="w-full h-60 object-cover"
//             />

//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {myShopData.name}
//               </h2>
//               <p className="text-gray-500">
//                 {myShopData.city}, {myShopData.state}
//               </p>
//               <p className="text-gray-500">
//                 {myShopData.address}
//               </p>
//             </div>
//           </div>

//           {/* Items */}
//           {myShopData.items.length > 0 && (
//             <div className="flex flex-col gap-5 w-full max-w-3xl">
//               {myShopData.items.map((item, index) => (
//                 <OwnerItemCard key={index} data={item} />
//               ))}
//             </div>
//           )}

//         </div>
//       )}
//     </div>
//   );
// }

// export default OwnerDashboard;


import React from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import OwnerItemCard from "./OwnerItemCard.jsx";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#FAFAFA] pb-16">

      <Nav />

      {/* ================= EMPTY SHOP STATE ================= */}
      {!myShopData && (
        <div className="flex justify-center items-center w-full mt-28 px-6">
          <div className="w-full max-w-md bg-white shadow-md rounded-3xl p-10 border border-gray-200 text-center hover:shadow-lg transition">

            <div className="flex justify-center mb-5">
              <FaUtensils className="text-orange-500 w-16 h-16" />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              Add Your Restaurant
            </h2>

            <p className="text-gray-500 mb-7 text-sm leading-relaxed">
              Start selling food before it expires and help reduce food waste.
            </p>

            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-sm transition hover:scale-102"
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* ================= SHOP DASHBOARD ================= */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-10 px-6 mt-28">

          {/* Welcome Text */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center">
            Welcome to <span className="text-orange-500">{myShopData.name}</span>
          </h1>

          {/* ================= SHOP CARD ================= */}
          <div className="relative w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition">

            {/* Edit Button */}
            <div
              className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full cursor-pointer shadow-md transition hover:scale-105"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={16} />
            </div>

            {/* Shop Image */}
            <img
              src={myShopData.image}
              alt="shop"
              className="w-full h-64 object-cover"
            />

            {/* Shop Details */}
            <div className="p-7 flex flex-col gap-2 bg-white">

              <h2 className="text-2xl font-extrabold text-gray-900">
                {myShopData.name}
              </h2>

              <p className="text-gray-500 text-sm font-semibold">
                📍 {myShopData.city}, {myShopData.state}
              </p>

              <p className="text-gray-500 text-sm">
                {myShopData.address}
              </p>

            </div>
          </div>

          {/* ================= ITEMS SECTION ================= */}
          {myShopData.items.length > 0 && (
            <div className="w-full max-w-3xl flex flex-col gap-5">

              <h2 className="text-2xl font-semibold text-gray-800">
                Your Food Items
              </h2>

              <div className="flex flex-col gap-5">
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard key={index} data={item} />
                ))}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
