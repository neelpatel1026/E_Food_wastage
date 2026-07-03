/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice.js';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App.jsx';
import { addMyOrder, setTotalAmount } from '../redux/userSlice.js';

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    const latitude = userData?.location?.coordinates?.[1] || 19.0760
    const longitude = userData?.location?.coordinates?.[0] || 72.8777
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results?.[0]?.address_line2 || "Selected Location"))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    if (!addressInput || addressInput.trim() === "") {
      alert("Please enter a valid delivery address.");
      return;
    }
    if (!location?.lat || !location?.lon) {
      alert("Please select your location on the map.");
      return;
    }
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        if (razorOrder) {
          openRazorpayWindow(orderId, razorOrder)
        } else {
          navigate(`/payment/${orderId}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "Rebite",
      description: "Food Delivery Platform",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="absolute top-5 left-5 z-10 p-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-full cursor-pointer transition shrink-0" onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={30} className="text-orange-500" />
      </div>
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>

        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800"><IoLocationSharp className="text-orange-500" /> Delivery Location</h2>
          <div className="flex gap-2">
            <input type="text" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-gray-800" placeholder="Enter Your Delivery Address.." value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl flex items-center justify-center cursor-pointer transition" onClick={getLatLngByAddress}><IoSearchOutline size={17} /></button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center cursor-pointer transition" onClick={getCurrentLocation}><TbCurrentLocation size={17} /></button>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center bg-gray-50">
              {location?.lat && location?.lon ? (
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker position={[location.lat, location.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
                </MapContainer>
              ) : (
                <div className="text-gray-400">Loading map location...</div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50/50" : "border-gray-200 hover:border-gray-300"
              }`} onClick={() => setPaymentMethod("cod")}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 border border-orange-100">
                <MdDeliveryDining className="text-xl" />
              </span>
              <div>
                <p className="font-bold text-sm text-gray-800">Cash On Delivery</p>
                <p className="text-xs text-gray-500">Pay when your food arrives</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${paymentMethod === "online" ? "border-orange-500 bg-orange-50/50" : "border-gray-200 hover:border-gray-300"
              }`} onClick={() => setPaymentMethod("online")}>
              <div className="flex -space-x-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-650 border border-purple-100 z-10">
                  <FaMobileScreenButton className="text-base" />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FaCreditCard className="text-base" />
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">UPI / Cards / Net Banking</p>
                <p className="text-xs text-gray-500">Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3.5">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-gray-700 font-medium">
                <span>{item.name} <span className="text-xs text-gray-400">× {item.quantity}</span></span>
                <span>₹{(item.finalPrice || item.price) * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-semibold text-sm text-gray-800">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-650">
              <span>Delivery Fee</span>
              <span className="font-semibold text-green-600">{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between text-xl font-black text-orange-500 pt-1">
              <span>Total Amount</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        {(() => {
          const hasExpiredItems = cartItems?.some(
            (item) => item.isExpired || (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now())
          );
          return (
            <div className="space-y-4">
              {hasExpiredItems && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100">
                  ⚠️ One or more items in your cart have expired. Please return to the cart and remove them.
                </div>
              )}
              <button
                disabled={hasExpiredItems}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition ${
                  hasExpiredItems
                    ? "bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                }`}
                onClick={handlePlaceOrder}
              >
                {paymentMethod === "cod" ? "Confirm & Place Order" : "Pay & Place Order"}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  )
}

export default CheckOut
