import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaQrcode, FaMobileAlt, FaCreditCard, FaRegBuilding, FaWallet, FaMoneyBillWave } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({
    isRazorpayAvailable: false,
    upiId: "rebite@upi",
    upiQrCode: ""
  });

  const [selectedMethod, setSelectedMethod] = useState("upi_qr"); // upi_qr, upi_apps, card, net_banking, wallet, cod
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchOrderAndConfig = async () => {
    try {
      const [orderRes, configRes] = await Promise.all([
        axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true }),
        axios.get(`${serverUrl}/api/order/payment-config`, { withCredentials: true })
      ]);
      setOrder(orderRes.data);
      setPaymentConfig(configRes.data);
    } catch (err) {
      console.error("Error fetching order/config:", err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndConfig();
  }, [orderId]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentConfig.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmitManualPayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!utrNumber || !/^\d{12}$/.test(utrNumber)) {
      setError("Please enter a valid 12-digit UPI UTR reference number.");
      return;
    }

    if (!screenshotFile) {
      setError("Please upload your payment confirmation screenshot.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append("image", screenshotFile);
      const uploadRes = await axios.post(`${serverUrl}/api/order/upload-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      const uploadedUrl = uploadRes.data.screenshotUrl;
      setScreenshotUrl(uploadedUrl);

      // 2. Submit payment details
      await axios.post(`${serverUrl}/api/order/submit-manual-payment/${orderId}`, {
        paymentUTR: utrNumber,
        paymentScreenshot: uploadedUrl
      }, { withCredentials: true });

      navigate("/order-placed");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to submit payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <ClipLoader size={40} color="#F97316" />
      </div>
    );
  }

  const amount = order?.totalAmount || 0;
  // Generate dynamic QR code matching the amount and platform UPI
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(paymentConfig.upiId)}%26pn%3DRebite%26am%3D${amount}%26cu%3DINR`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      {/* Header Back Button */}
      <div
        className="absolute top-6 left-6 cursor-pointer hover:scale-105 transition p-2 bg-white rounded-full border border-gray-200 shadow-sm"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={28} className="text-orange-500" />
      </div>

      <div className="w-full max-w-4xl bg-white border border-gray-200 shadow-sm rounded-3xl p-6 md:p-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Payment Method Options */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Choose Payment Method</h1>
            <p className="text-xs text-gray-400 mt-1">Select your preferred payment options below.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "upi_qr", name: "Scan UPI QR Code", icon: <FaQrcode />, desc: "Pay instantly using any UPI scanner app" },
              { id: "upi_apps", name: "UPI Apps", icon: <FaMobileAlt />, desc: "GPay, PhonePe, Paytm, BHIM" },
              { id: "card", name: "Credit / Debit Card", icon: <FaCreditCard />, desc: "Visa, Mastercard, RuPay, Maestro" },
              { id: "net_banking", name: "Net Banking", icon: <FaRegBuilding />, desc: "All Indian national banks" },
              { id: "wallet", name: "Wallets", icon: <FaWallet />, desc: "Paytm Wallet, PhonePe Wallet, Amazon Pay" },
              { id: "cod", name: "Cash on Delivery", icon: <FaMoneyBillWave />, desc: "Pay in cash at your doorstep" }
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition ${
                  selectedMethod === m.id
                    ? "border-orange-500 bg-orange-50/20 shadow-sm"
                    : "border-gray-200 hover:bg-gray-50/50"
                }`}
              >
                <div className={`p-3 rounded-xl border ${
                  selectedMethod === m.id
                    ? "bg-orange-50 border-orange-100 text-orange-500"
                    : "bg-gray-50 border-gray-150 text-gray-500"
                }`}>
                  {m.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{m.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Payment Execution Details */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Total Bill Amount</span>
              <span className="text-2xl font-black text-orange-500">₹{amount}</span>
            </div>

            {/* If Razorpay is configured, show default prompt */}
            {paymentConfig.isRazorpayAvailable && (selectedMethod !== "cod" && selectedMethod !== "upi_qr") ? (
              <div className="text-center p-6 space-y-4">
                <div className="text-4xl">⚡</div>
                <h3 className="font-bold text-gray-800 text-base">Secure Checkout via Razorpay</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Razorpay is available! You can proceed to complete your card, net banking, or wallet payment securely.
                </p>
                <button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition"
                  onClick={() => alert("Razorpay checkout is simulated. If integration is active, it would launch standard Razorpay payment window.")}
                >
                  Pay via Razorpay
                </button>
              </div>
            ) : selectedMethod === "cod" ? (
              <div className="text-center p-6 space-y-4">
                <div className="text-4xl">💵</div>
                <h3 className="font-bold text-gray-800 text-base">Pay cash on delivery</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  No advance payment needed. Place order now and pay when your food arrives.
                </p>
                <button
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      await axios.post(`${serverUrl}/api/order/place-order`, {
                        paymentMethod: "cod",
                        deliveryAddress: order.deliveryAddress,
                        totalAmount: order.totalAmount,
                        cartItems: order.shopOrders.flatMap(so => so.shopOrderItems)
                      }, { withCredentials: true });
                      navigate("/order-placed");
                    } catch (err) {
                      setError("Failed to convert order to Cash on Delivery.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition cursor-pointer"
                >
                  {submitting ? <ClipLoader size={20} color="white" /> : "Confirm Order"}
                </button>
              </div>
            ) : (
              /* fallback Manual UPI Payment */
              <form onSubmit={handleSubmitManualPayment} className="space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl bg-white space-y-3">
                  <img src={dynamicQrUrl} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Scan code to pay exact amount</p>
                </div>

                {/* UPI copy details */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Platform UPI ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentConfig.upiId}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition hover:bg-orange-600 cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* UTR Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-750">12-Digit UTR / Transaction ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit transaction ID"
                    value={utrNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && val.length <= 12) setUtrNumber(val);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition text-gray-800"
                  />
                </div>

                {/* Screenshot Uploader */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-750">Payment Confirmation Screenshot</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl px-4 py-6 cursor-pointer hover:border-orange-500 bg-gray-50/50 transition">
                    <span className="text-3xl mb-1">📸</span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Upload Screenshot</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  {screenshotPreview && (
                    <img src={screenshotPreview} alt="Screenshot Preview" className="w-full h-32 object-cover rounded-xl mt-3 border border-gray-200" />
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-center text-xs font-bold mt-2">*{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm transition flex justify-center items-center gap-2 cursor-pointer"
                >
                  {submitting ? <ClipLoader size={20} color="white" /> : "Submit Payment for Verification"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PaymentPage;
