/* eslint-disable react-hooks/set-state-in-effect */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

function TrackOrderPage() {

  const { orderId } = useParams();
  const navigate = useNavigate();

  const [currentOrder, setCurrentOrder] = useState();
  const [liveLocations, setLiveLocations] = useState({});

  const { socket } = useSelector((state) => state.user);

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    };

    socket.on("updateDeliveryLocation", handleUpdate);

    return () => {
      socket.off("updateDeliveryLocation", handleUpdate);
    };
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  const getStatusPillClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-250";
      case "preparing":
        return "bg-amber-50 text-amber-700 border-amber-250";
      case "out of delivery":
      case "dispatched":
        return "bg-orange-50 text-orange-700 border-orange-250";
      case "delivered":
      case "completed":
        return "bg-green-50 text-green-700 border-green-250";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-250";
      default:
        return "bg-gray-50 text-gray-750 border-gray-250";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">

      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* HEADER */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:scale-105 transition cursor-pointer"
          >
            <IoIosArrowRoundBack size={28} className="text-orange-500" />
          </button>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Track Your Order
          </h1>

        </div>

        {/* ORDER LIST */}

        {currentOrder?.shopOrders?.map((shopOrder, index) => (

          <div
            key={index}
            className="bg-white rounded-3xl border border-gray-200
            p-6 flex flex-col gap-6 shadow-sm hover:shadow-md transition"
          >

            {/* SHOP HEADER */}

            <div className="flex justify-between items-center bg-white">

              <div>

                <p className="text-xl font-extrabold text-orange-500">
                  {shopOrder.shop.name}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Order #{currentOrder._id.slice(-6)}
                </p>

              </div>

              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${getStatusPillClass(shopOrder.status)}`}>
                {shopOrder.status}
              </span>

            </div>

            {/* ORDER DETAILS */}

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-650 bg-gray-50/50 border border-gray-200 p-4 rounded-2xl">

              <p>
                <span className="font-semibold text-gray-800">Items:</span>{" "}
                {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
              </p>

              <p>
                <span className="font-semibold text-gray-800">Subtotal:</span> ₹{shopOrder.subtotal}
              </p>

              <p className="md:col-span-2">
                <span className="font-semibold text-gray-800">Delivery Address:</span>{" "}
                {currentOrder.deliveryAddress?.text}
              </p>

            </div>

            {/* DELIVERY INFO */}

            {shopOrder.status !== "delivered" ? (

              <>
                {shopOrder.assignedDeliveryBoy ? (

                  <div className="bg-orange-50/30 border border-orange-100 rounded-2xl p-4 text-xs space-y-1.5">

                    <p>
                      <span className="font-extrabold text-orange-600 uppercase tracking-wide text-[10px]">Assigned Delivery Boy</span>
                    </p>

                    <p className="font-bold text-gray-800">
                      🏍️ {shopOrder.assignedDeliveryBoy.fullName}
                    </p>

                    <p className="text-gray-500 font-semibold">
                      📞 {shopOrder.assignedDeliveryBoy.mobile}
                    </p>

                  </div>

                ) : (

                  <p className="text-gray-500 font-semibold text-sm">
                    ⌛ Delivery boy is not assigned yet. Waiting for pickup...
                  </p>

                )}
              </>

            ) : (

              <p className="text-green-650 font-bold text-base flex items-center gap-1.5">
                🟢 Delivered Successfully
              </p>

            )}

            {/* MAP */}

            {(shopOrder.assignedDeliveryBoy &&
              shopOrder.status !== "delivered") && (

              <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-gray-200">

                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation:
                      liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                        lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                        lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                      },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default TrackOrderPage;