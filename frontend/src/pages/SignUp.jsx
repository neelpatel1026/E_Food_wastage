// /* eslint-disable no-unused-vars */
// import React from 'react'
// import { useState } from 'react';
// import { FaRegEye } from "react-icons/fa";
// import { FaRegEyeSlash } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
// import { useNavigate } from 'react-router-dom';
// import axios from "axios"
// import { serverUrl } from '../App.jsx';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { auth } from '../firebase.js';
// import { ClipLoader } from "react-spinners"
// import { useDispatch } from 'react-redux';
// import { setUserData } from '../redux/userSlice.js';
// function SignUp() {
//     const primaryColor = "#ff4d2d";
//     const hoverColor = "#e64323";
//     const bgColor = "#fff9f6";
//     const borderColor = "#ddd";
//     const [showPassword, setShowPassword] = useState(false)
//     const [role, setRole] = useState("user")
//     const navigate=useNavigate()
//     const [fullName,setFullName]=useState("")
//     const [email,setEmail]=useState("")
//     const [password,setPassword]=useState("")
//     const [mobile,setMobile]=useState("")
//     const [err,setErr]=useState("")
//     const [loading,setLoading]=useState(false)
//     const dispatch=useDispatch()
//      const handleSignUp=async () => {
//         setLoading(true)
//         try {
//             const result=await axios.post(`${serverUrl}/api/auth/signup`,{
//                 fullName,email,password,mobile,role
//             },{withCredentials:true})
//             dispatch(setUserData(result.data))
//             setErr("")
//             setLoading(false)
//         } catch (error) {
//             setErr(error?.response?.data?.message)
//              setLoading(false)
//         }
//      }

//      const handleGoogleAuth=async () => {
//         if(!mobile){
//           return setErr("mobile no is required")
//         }
//         const provider=new GoogleAuthProvider()
//         const result=await signInWithPopup(auth,provider)
//   try {
//     const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
//         fullName:result.user.displayName,
//         email:result.user.email,
//         role,
//         mobile
//     },{withCredentials:true})
//    dispatch(setUserData(data))
//   } catch (error) {
//     console.log(error)
//   }
//      }
//     return (
//         <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
//             <div className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border `} style={{
//                 border: `1px solid ${borderColor}`
//             }}>
//                 <h1 className={`text-3xl font-bold mb-2 `} style={{ color: primaryColor }}>Vingo</h1>
//                 <p className='text-gray-600 mb-8'> Create your account to get started with delicious food deliveries
//                 </p>

//                 {/* fullName */}

//                 <div className='mb-4'>
//                     <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1'>Full Name</label>
//                     <input type="text" className='w-full border rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter your Full Name' style={{ border: `1px solid ${borderColor}` }} onChange={(e)=>setFullName(e.target.value)} value={fullName} required/>
//                 </div>
//                 {/* email */}

//                 <div className='mb-4'>
//                     <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
//                     <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter your Email' style={{ border: `1px solid ${borderColor}` }} onChange={(e)=>setEmail(e.target.value)} value={email} required/>
//                 </div>
//                 {/* mobile*/}

//                 <div className='mb-4'>
//                     <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1'>Mobile</label>
//                     <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter your Mobile Number' style={{ border: `1px solid ${borderColor}` }} onChange={(e)=>setMobile(e.target.value)} value={mobile} required/>
//                 </div>
//                 {/* password*/}

//                 <div className='mb-4'>
//                     <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
//                     <div className='relative'>
//                         <input type={`${showPassword ? "text" : "password"}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none pr-10' placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }} onChange={(e)=>setPassword(e.target.value)} value={password} required/>

//                         <button className='absolute right-3 cursor-pointer top-3.5 text-gray-500' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
//                     </div>
//                 </div>
//                 {/* role*/}

//                 <div className='mb-4'>
//                     <label htmlFor="role" className='block text-gray-700 font-medium mb-1'>Role</label>
//                     <div className='flex gap-2'>
//                         {["user", "owner", "deliveryBoy"].map((r) => (
//                             <button
//                                 className='flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer'
//                                 onClick={()=>setRole(r)}
//                                 style={
//                                    role==r?
//                                    {backgroundColor:primaryColor,color:"white"}
//                                    :{border:`1px solid ${primaryColor}`,color:primaryColor}
//                                 }>
//                                 {r}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//             <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} onClick={handleSignUp} disabled={loading}>
//                 {loading?<ClipLoader size={20} color='white'/>:"Sign Up"}
            
//             </button>
//             {err && <p className='text-red-500 text-center my-2.5'>*{err}</p>}
            

//             <button className='w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition cursor-pointer duration-200 border-gray-400 hover:bg-gray-100' onClick={handleGoogleAuth}>
// <FcGoogle size={20}/>
// <span>Sign up with Google</span>
//             </button>
//             <p className='text-center mt-6 cursor-pointer' onClick={()=>navigate("/signin")}>Already have an account ?  <span className='text-[#ff4d2d]'>Sign In</span></p>
//             </div>
//         </div>
//     )
// }

// export default SignUp



/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash, FaMoon, FaSun } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase.js";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { motion } from "framer-motion";

/* ================= Floating Input (OUTSIDE) ================= */

function FloatingInput({
  label,
  type = "text",
  value,
  setValue,
  isPassword,
  showPassword,
  togglePassword,
  darkMode,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative mb-6">
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-4 pt-5 pb-2 text-sm rounded-xl outline-none transition-all duration-300 border backdrop-blur-sm
        ${
          darkMode
            ? "bg-slate-800 text-white border-slate-600 focus:ring-2 focus:ring-green-400"
            : "bg-white/80 text-gray-800 border-gray-300 focus:ring-2 focus:ring-green-500"
        }`}
        required
      />

      <label
        className={`absolute left-4 transition-all duration-300 pointer-events-none
        ${
          focused || value
            ? "top-1 text-xs text-green-500"
            : darkMode
            ? "top-3.5 text-sm text-gray-400"
            : "top-3.5 text-sm text-gray-500"
        }`}
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          className="absolute right-3 top-4 text-gray-500"
          onClick={togglePassword}
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
      )}
    </div>
  );
}

/* ================= MAIN SIGNUP COMPONENT ================= */

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [swing, setSwing] = useState(true);

  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => setSwing(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  /* ================= AUTH LOGIC (UNCHANGED) ================= */

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
    } catch (error) {
      setErr(error?.response?.data?.message);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!mobile) return setErr("mobile no is required");

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-all duration-700 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-[#F6F1E7] via-[#f4efe5] to-[#e8f5ec]"
      }`}
    >
      {/* Floating Food Icons */}
      {["🍕", "🍔", "🥗", "🍣", "🍩"].map((icon, index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity }}
          className="absolute text-5xl opacity-20"
          style={{
            top: `${10 + index * 15}%`,
            left: `${5 + index * 18}%`,
          }}
        >
          {icon}
        </motion.div>
      ))}

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 text-xl p-3 rounded-full bg-white/30 backdrop-blur-md border border-white/40"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Swing Card */}
      <motion.div
        animate={swing ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
        transition={{
          duration: 2,
          repeat: swing ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="p-[2px] rounded-3xl bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400"
      >
        <div
          className={`w-full max-w-md p-10 rounded-3xl shadow-2xl backdrop-blur-xl ${
            darkMode
              ? "bg-slate-900/85 text-white"
              : "bg-white/80 border border-white/50"
          }`}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-2xl shadow-lg">
              🥑
            </div>
            <h1 className="text-3xl font-semibold text-green-600 mt-4">
              Rebite
            </h1>
            <p className="text-sm mt-2 text-gray-500">
              Create your account and start ordering.
            </p>
          </div>

          <FloatingInput
            label="Full Name"
            value={fullName}
            setValue={setFullName}
            darkMode={darkMode}
          />

          <FloatingInput
            label="Email"
            type="email"
            value={email}
            setValue={setEmail}
            darkMode={darkMode}
          />

          <FloatingInput
            label="Mobile"
            value={mobile}
            setValue={setMobile}
            darkMode={darkMode}
          />

          <FloatingInput
            label="Password"
            isPassword
            value={password}
            setValue={setPassword}
            showPassword={showPassword}
            togglePassword={() =>
              setShowPassword((prev) => !prev)
            }
            darkMode={darkMode}
          />

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm rounded-xl transition ${
                  role === r
                    ? "bg-green-700 text-white"
                    : "border border-green-600 text-green-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-green-700 text-white hover:bg-green-800 transition"
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Sign Up 🌱"}
          </button>

          {err && (
            <p className="text-red-500 text-center mt-4 text-sm">
              *{err}
            </p>
          )}

          {/* Google Button Fixed */}
          <button
            onClick={handleGoogleAuth}
            className={`w-full mt-5 flex items-center justify-center gap-3 rounded-2xl px-4 py-3 transition text-sm
            ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-white border border-gray-300 hover:bg-gray-100 text-black"
            }`}
          >
            <FcGoogle size={20} />
            Sign up with Google
          </button>

          <p
            className="text-center mt-6 text-sm cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            Already have an account?{" "}
            <span className="text-green-600 font-semibold">
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUp;





