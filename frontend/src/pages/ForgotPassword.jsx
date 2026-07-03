import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App.jsx';
import { ClipLoader } from 'react-spinners';
function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email,setEmail]=useState("")
  const [otp,setOtp]=useState("")
  const [newPassword,setNewPassword]=useState("")
  const [confirmPassword,setConfirmPassword]=useState("")
  const [err,setErr]=useState("")
  const navigate=useNavigate()
const [loading,setLoading]=useState(false)
  const handleSendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/send-otp`,{email},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
       setErr(error.response.data.message)
       setLoading(false)
    }
  }
  const handleVerifyOtp=async () => {
      setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(3)
        setLoading(false)
    } catch (error) {
        setErr(error?.response?.data?.message)
          setLoading(false)
    }
  }
  const handleResetPassword=async () => {
    if(newPassword!=confirmPassword){
      setErr("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword},{withCredentials:true})
      setErr("")
      console.log(result)
        setLoading(false)
      navigate("/signin")
    } catch (error) {
     setErr(error?.response?.data?.message)
       setLoading(false)
    }
  }
  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#FAFAFA]'>
      <div className='bg-white border border-gray-200 rounded-3xl shadow-sm w-full max-w-md p-8'>
        <div className='flex items-center gap-4 mb-6'>
          <div className="p-1 hover:bg-gray-50 border border-gray-200 rounded-full cursor-pointer transition shrink-0" onClick={()=>navigate("/signin")}>
            <IoIosArrowRoundBack size={26} className='text-orange-500'/>
          </div>
          <h1 className='text-xl font-extrabold text-gray-900'>Reset Password</h1>
        </div>
        {step == 1
          &&
          <div>
            <div className='mb-6'>
              <label htmlFor="email" className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
              <input type="email" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-sm text-gray-800' placeholder='Enter your Email' onChange={(e)=>setEmail(e.target.value)} value={email} required/>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition hover:scale-[1.01] cursor-pointer" onClick={handleSendOtp} disabled={loading}>
              {loading?<ClipLoader size={20} color='white'/>:"Send OTP"}
            </button>
            {err && <p className='text-red-500 text-center mt-4 text-sm font-semibold'>*{err}</p>}
          </div>}

         {step == 2
          &&
          <div>
            <div className='mb-6'>
              <label htmlFor="otp" className='block text-sm font-semibold text-gray-700 mb-2'>Verification Code</label>
              <input type="text" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-sm text-gray-800' placeholder='Enter OTP' onChange={(e)=>setOtp(e.target.value)} value={otp} required/>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition hover:scale-[1.01] cursor-pointer" onClick={handleVerifyOtp} disabled={loading}>
              {loading?<ClipLoader size={20} color='white'/>:"Verify Code"}
            </button>
            {err && <p className='text-red-500 text-center mt-4 text-sm font-semibold'>*{err}</p>}
          </div>}

          {step == 3
          &&
          <div>
            <div className='mb-4'>
              <label htmlFor="newPassword" className='block text-sm font-semibold text-gray-700 mb-2'>New Password</label>
              <input type="password" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-sm text-gray-800' placeholder='Enter New Password' onChange={(e)=>setNewPassword(e.target.value)} value={newPassword}/>
            </div>
            <div className='mb-6'>
              <label htmlFor="ConfirmPassword" className='block text-sm font-semibold text-gray-700 mb-2'>Confirm Password</label>
              <input type="password" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-sm text-gray-800' placeholder='Confirm Password' onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword} required/>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition hover:scale-[1.01] cursor-pointer" onClick={handleResetPassword} disabled={loading}>
              {loading?<ClipLoader size={20} color='white'/>:"Reset Password"}
            </button>
            {err && <p className='text-red-500 text-center mt-4 text-sm font-semibold'>*{err}</p>}
          </div>}
      </div>
    </div>
  )
}

export default ForgotPassword
