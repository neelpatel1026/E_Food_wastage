// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { serverUrl } from "../App.jsx";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaUtensils } from "react-icons/fa";
// import { FaArrowLeft } from "react-icons/fa";
// import FoodCard from "../components/FoodCard.jsx";

// function Shop() {
//   const { shopId } = useParams();
//   const [items, setItems] = useState([]);
//   const navigate = useNavigate();

//   const handleShop = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/item/get-by-shop/${shopId}`,
//         { withCredentials: true }
//       );
//       setItems(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     handleShop();
//   }, [shopId]);

//   return (
//     <div className="min-h-screen bg-gray-50">

//       <button
//         className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition"
//         onClick={() => navigate("/")}
//       >
//         <FaArrowLeft />
//         <span>Back</span>
//       </button>

//       <div className="max-w-7xl mx-auto px-6 py-20">
//         <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800">
//           <FaUtensils color="red" /> Our Menu
//         </h2>

//         {items.length > 0 ? (
//           <div className="flex flex-wrap justify-center gap-8">
//             {items.map((item) => (
//               <FoodCard key={item._id} data={item} />
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-500 text-lg">
//             No Items Available
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Shop;


import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../App.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils, FaArrowLeft } from "react-icons/fa";
import FoodCard from "../components/FoodCard.jsx";

function Shop() {

  const { shopId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const handleShop = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true }
      );

      setItems(result.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleShop();
  }, [shopId]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br
      from-orange-50 via-rose-50 to-pink-50"
    >

      {/* Back Button */}

      <button
        className="fixed top-5 left-5 z-20 flex items-center gap-2
        bg-white shadow-md border border-gray-100
        px-4 py-2 rounded-full
        hover:shadow-lg transition"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="text-orange-500" />
        <span className="text-sm font-medium text-gray-700">
          Back
        </span>
      </button>

      {/* Page Container */}

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}

        <div className="flex flex-col items-center gap-3 mb-10">

          <div
            className="flex items-center gap-3
            text-3xl font-bold text-gray-800"
          >
            <FaUtensils className="text-orange-500" />
            Our Menu
          </div>

          <p className="text-gray-500 text-sm">
            Delicious food freshly prepared 🍽
          </p>

        </div>

        {/* Food Grid */}

        {items.length > 0 ? (

          <div
            className="grid gap-8
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            justify-items-center"
          >

            {items.map((item) => (
              <FoodCard key={item._id} data={item} />
            ))}

          </div>

        ) : (

          <div
            className="flex flex-col items-center justify-center
            py-20 text-gray-500"
          >

            <FaUtensils size={40} className="mb-3 opacity-60" />

            <p className="text-lg font-medium">
              No Items Available
            </p>

            <p className="text-sm text-gray-400">
              The shop hasn't added food items yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Shop;

