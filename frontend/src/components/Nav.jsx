// // /* eslint-disable no-unused-vars */
// // import React, { useEffect, useState } from 'react'
// // import { FaLocationDot } from "react-icons/fa6";
// // import { IoIosSearch } from "react-icons/io";
// // import { FiShoppingCart } from "react-icons/fi";
// // import { useDispatch, useSelector } from 'react-redux';
// // import { RxCross2 } from "react-icons/rx";
// // import axios from 'axios';
// // import { serverUrl } from '../App.jsx';
// // import { setSearchItems, setUserData } from '../redux/userSlice.js';
// // import { FaPlus } from "react-icons/fa6";
// // import { TbReceipt2 } from "react-icons/tb";
// // import { useNavigate } from 'react-router-dom';
// // function Nav() {
// //     const { userData, currentCity ,cartItems} = useSelector(state => state.user)
// //         const { myShopData} = useSelector(state => state.owner)
// //     const [showInfo, setShowInfo] = useState(false)
// //     const [showSearch, setShowSearch] = useState(false)
// //     const [query,setQuery]=useState("")
// //     const dispatch = useDispatch()
// //     const navigate=useNavigate()
// //     const handleLogOut = async () => {
// //         try {
// //             const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
// //             dispatch(setUserData(null))
// //         } catch (error) {
// //             console.log(error)
// //         }
// //     }

// //     const handleSearchItems=async () => {
// //       try {
// //         const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
// //     dispatch(setSearchItems(result.data))
// //       } catch (error) {
// //         console.log(error)
// //       }
// //     }

// //     useEffect(()=>{
// //         if(query){
// // handleSearchItems()
// //         }else{
// //               dispatch(setSearchItems(null))
// //         }

// //     },[query])
// //     return (
// //         <div className='w-full h-20 flex items-center justify-between md:justify-center gap-7.5 px-5 fixed top-0 z-9999 bg-[#fff9f6] overflow-visible'>

// //             {showSearch && userData.role == "user" && <div className='w-[90%] h-17.5  bg-white shadow-xl rounded-lg items-center gap-5 flex fixed top-20 left-[5%] md:hidden'>
// //                 <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400'>
// //                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
// //                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
// //                 </div>
// //                 <div className='w-[80%] flex items-center gap-2.5'>
// //                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
// //                     <input type="text" placeholder='search delicious food...' className='px-2.5 text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
// //                 </div>
// //             </div>}



// //             <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>
// //             {userData.role == "user" && <div className='md:w-[60%] lg:w-[40%] h-17.5 bg-white shadow-xl rounded-lg items-center gap-5 hidden md:flex'>
// //                 <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400'>
// //                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
// //                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
// //                 </div>
// //                 <div className='w-[80%] flex items-center gap-2.5'>
// //                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
// //                     <input type="text" placeholder='search delicious food...' className='px-2.5 text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
// //                 </div>
// //             </div>}

// //             <div className='flex items-center gap-4'>
// //                 {userData.role == "user" && (showSearch ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} /> : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />)
// //                 }
// //                 {userData.role == "owner"? <>
// //                  {myShopData && <> <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
// //                         <FaPlus size={20} />
// //                         <span>Add Food Item</span>
// //                     </button>
// //                       <button className='md:hidden flex items-center  p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
// //                         <FaPlus size={20} />
// //                     </button></>}
                   
// //                     <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
// //                       <TbReceipt2 size={20}/>
// //                       <span>My Orders</span>
                      
// //                     </div>
// //                      <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
// //                       <TbReceipt2 size={20}/>
                      
// //                     </div>
// //                 </>: (
// //                     <>
// //                  {userData.role=="user" &&    <div className='relative cursor-pointer' onClick={()=>navigate("/cart")}>
// //                     <FiShoppingCart size={25} className='text-[#ff4d2d]' />
// //                     <span className='absolute -right-2.25 -top-3 text-[#ff4d2d]'>{cartItems.length}</span>
// //                 </div>}   
           


// //                 <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium' onClick={()=>navigate("/my-orders")}>
// //                     My Orders
// //                 </button>
// //                     </>
// //                 )}



// //                 <div className='w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer' onClick={() => setShowInfo(prev => !prev)}>
// //                     {userData?.fullName.slice(0, 1)}
// //                 </div>
// //                 {showInfo && <div className={`fixed top-20 right-2.5 
// //                     ${userData.role=="deliveryBoy"?"md:right-[20%] lg:right-[40%]":"md:right-[10%] lg:right-[25%]"} w-45 bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 z-9999`}>
// //                     <div className='text-[17px] font-semibold'>{userData.fullName}</div>
// //                     {userData.role=="user" && <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer' onClick={()=>navigate("/my-orders")}>My Orders</div>}
                    
// //                     <div className='text-[#ff4d2d] font-semibold cursor-pointer' onClick={handleLogOut}>Log Out</div>
// //                 </div>}

// //             </div>
// //         </div>
// //     )
// // }


// // export default Nav




// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { FaLocationDot } from "react-icons/fa6";
// import { IoIosSearch } from "react-icons/io";
// import { FiShoppingCart } from "react-icons/fi";
// import { useDispatch, useSelector } from "react-redux";
// import { RxCross2 } from "react-icons/rx";
// import axios from "axios";
// import { serverUrl } from "../App.jsx";
// import { setSearchItems, setUserData } from "../redux/userSlice.js";
// import { FaPlus } from "react-icons/fa6";
// import { TbReceipt2 } from "react-icons/tb";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// function Nav() {
//   const { userData, currentCity, cartItems } = useSelector(
//     (state) => state.user
//   );
//   const { myShopData } = useSelector((state) => state.owner);

//   const [showInfo, setShowInfo] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [query, setQuery] = useState("");
//   const [scrolled, setScrolled] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   /* ================= Scroll Shrink + Blur ================= */
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 30);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogOut = async () => {
//     try {
//       await axios.get(`${serverUrl}/api/auth/signout`, {
//         withCredentials: true,
//       });
//       dispatch(setUserData(null));
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   /* ================= SEARCH ================= */
//   const handleSearchItems = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
//         { withCredentials: true }
//       );
//       dispatch(setSearchItems(result.data));
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (query) {
//       handleSearchItems();
//     } else {
//       dispatch(setSearchItems(null));
//     }
//   }, [query]);

//   return (
//     <motion.div
//       animate={{
//         height: scrolled ? 65 : 80,
//         backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
//       }}
//       transition={{ duration: 0.3 }}
//       className="w-full fixed top-0 z-[9999] px-6 flex items-center justify-between md:justify-center gap-8
//       bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
//       text-white shadow-2xl overflow-visible"
//     >
//       {/* ===== Animated Gradient Shimmer ===== */}
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_6s_linear_infinite]" />

//       {/* ===== LOGO ===== */}
//       <h1
//         className="text-2xl md:text-3xl font-bold tracking-wide cursor-pointer hover:scale-105 transition relative z-10"
//         onClick={() => navigate("/")}
//       >
//         Rebite
//       </h1>

//       {/* ===== SEARCH DESKTOP ===== */}
//       {userData.role === "user" && (
//         <div className="hidden md:flex md:w-[60%] lg:w-[40%] h-12 bg-white/95 text-gray-700 shadow-xl rounded-2xl items-center gap-4 px-4 relative z-10">
//           <div className="flex items-center w-[30%] gap-2 border-r border-gray-300 pr-3">
//             <FaLocationDot size={18} className="text-emerald-600" />
//             <div className="truncate font-medium">{currentCity}</div>
//           </div>

//           <div className="flex items-center w-full gap-2">
//             <IoIosSearch size={20} className="text-emerald-600" />
//             <input
//               type="text"
//               placeholder="Search delicious food..."
//               className="w-full outline-none bg-transparent"
//               onChange={(e) => setQuery(e.target.value)}
//               value={query}
//             />
//           </div>
//         </div>
//       )}

//       {/* ===== RIGHT SECTION ===== */}
//       <div className="flex items-center gap-5 relative z-10">

//         {/* ===== CART ===== */}
//         {userData.role === "user" && (
//           <div
//             className="relative cursor-pointer"
//             onClick={() => navigate("/cart")}
//           >
//             <FiShoppingCart
//               size={22}
//               className="hover:scale-110 transition"
//             />
//             <span className="absolute -right-2 -top-2 bg-white text-emerald-600 text-xs font-bold rounded-full px-1.5 py-0.5 shadow-md">
//               {cartItems.length}
//             </span>
//           </div>
//         )}

//         {/* ===== OWNER BUTTONS ===== */}
//         {userData.role === "owner" && myShopData && (
//           <>
//             <button
//               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition"
//               onClick={() => navigate("/add-item")}
//             >
//               <FaPlus size={16} />
//               Add Food
//             </button>

//             <button
//               className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition"
//               onClick={() => navigate("/my-orders")}
//             >
//               <TbReceipt2 size={16} />
//               <span className="hidden md:block">My Orders</span>
//             </button>
//           </>
//         )}

//         {/* ===== PROFILE ===== */}
//         <div
//           className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-emerald-600 font-bold shadow-lg cursor-pointer hover:scale-105 transition"
//           onClick={() => setShowInfo((prev) => !prev)}
//         >
//           {userData?.fullName?.slice(0, 1)}
//         </div>

//         {/* ===== Smooth Dropdown ===== */}
//         <AnimatePresence>
//           {showInfo && (
//             <motion.div
//               initial={{ opacity: 0, y: -15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -15 }}
//               transition={{ duration: 0.25 }}
//               className="absolute top-14 right-0 w-52 bg-white text-gray-800 shadow-2xl rounded-2xl p-5 flex flex-col gap-3"
//             >
//               <div className="font-semibold text-lg">
//                 {userData.fullName}
//               </div>

//               {userData.role === "user" && (
//                 <div
//                   className="md:hidden text-emerald-600 font-semibold cursor-pointer"
//                   onClick={() => navigate("/my-orders")}
//                 >
//                   My Orders
//                 </div>
//               )}

//               <div
//                 className="text-red-500 font-semibold cursor-pointer"
//                 onClick={handleLogOut}
//               >
//                 Log Out
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// }

// export default Nav;



/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setSearchItems, setUserData } from "../redux/userSlice.js";
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Nav() {
  const { userData, currentCity, cartItems, searchItems } = useSelector(
    (state) => state.user
  );
  const { myShopData } = useSelector((state) => state.owner);

  const [showInfo, setShowInfo] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= Scroll Navbar ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= SEARCH ================= */
  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <motion.div
      animate={{
        height: scrolled ? 68 : 80,
      }}
      transition={{ duration: 0.3 }}
      className={`w-full fixed top-0 z-[9999] px-6 flex items-center justify-between gap-8 transition-shadow duration-300
      bg-white border-b border-gray-200 text-gray-900 ${scrolled ? "shadow-md" : "shadow-sm"}`}
    >
      {/* Logo */}
      <h1
        className="text-3xl font-extrabold tracking-tight cursor-pointer text-orange-500 hover:scale-105 transition"
        onClick={() => navigate("/")}
      >
        Rebite
      </h1>

      {/* ================= SEARCH BAR ================= */}
      {userData.role === "user" && (
        <div className="relative hidden md:flex md:w-[50%] lg:w-[40%]">
          <div
            className="flex w-full h-11 bg-gray-50 border border-gray-200
            rounded-full items-center gap-3 px-4 text-gray-700 transition focus-within:bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100"
          >
            {/* Location */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
              <FaLocationDot className="text-orange-500 shrink-0" size={15} />
              <span className="font-semibold text-sm max-w-28 truncate">{currentCity}</span>
            </div>

            {/* Search Input */}
            <IoIosSearch className="text-gray-400 shrink-0" size={18} />

            <input
              type="text"
              placeholder="Search food, pizza, burger..."
              className="w-full outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* ================= AI SEARCH SUGGESTIONS ================= */}
          <AnimatePresence>
            {query && searchItems && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-13 w-full bg-white text-gray-800 shadow-xl rounded-2xl p-3 flex flex-col gap-2 max-h-72 overflow-y-auto border border-gray-100"
              >
                {searchItems.length === 0 ? (
                  <div className="text-gray-400 text-sm p-2">
                    No food found...
                  </div>
                ) : (
                  searchItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/50 cursor-pointer transition"
                      onClick={() => navigate(`/shop/${item.shop._id}`)}
                    >
                      <img
                        src={item.image}
                        className="w-10 h-10 object-cover rounded-lg"
                      />

                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400">
                          {item.shopName}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex items-center gap-5">

        {/* CART */}
        {userData.role === "user" && (
          <div
            className="relative cursor-pointer hover:scale-105 transition p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-700"
            onClick={() => navigate("/cart")}
          >
            <FiShoppingCart size={20} />

            <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border border-white">
              {cartItems.length}
            </span>
          </div>
        )}

        {/* OWNER BUTTONS */}
        {userData.role === "owner" && myShopData && (
          <div className="flex gap-2">
            <button
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
              onClick={() => navigate("/add-item")}
            >
              <FaPlus size={14} />
              Add Food
            </button>

            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={16} />
              <span>My Orders</span>
            </button>
          </div>
        )}

        {/* PROFILE */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform
          bg-orange-500 text-white font-extrabold shadow-md cursor-pointer text-sm"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1).toUpperCase()}
        </div>

        {/* PROFILE DROPDOWN */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-16 right-6 w-56 bg-white text-gray-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 border border-gray-100"
            >
              <div>
                <div className="font-bold text-gray-800 text-sm">{userData.fullName}</div>
                <div className="text-[10px] font-semibold text-gray-400 capitalize mt-0.5">{userData.role}</div>
              </div>

              <hr className="border-gray-100" />

              {userData.role === "user" && (
                <div
                  className="text-gray-700 text-sm font-medium cursor-pointer hover:text-orange-500 transition"
                  onClick={() => {
                    setShowInfo(false);
                    navigate("/my-orders");
                  }}
                >
                  My Orders
                </div>
              )}

              {userData.role === "superAdmin" && (
                <div
                  className="text-gray-700 text-sm font-semibold cursor-pointer hover:text-orange-500 transition"
                  onClick={() => {
                    setShowInfo(false);
                    navigate("/admin");
                  }}
                >
                  Admin Dashboard
                </div>
              )}

              <div
                className="text-red-500 text-sm font-medium cursor-pointer hover:text-red-600 transition"
                onClick={handleLogOut}
              >
                Log Out
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Nav;


