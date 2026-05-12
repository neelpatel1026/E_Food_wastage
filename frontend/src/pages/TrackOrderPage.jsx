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

    socket.on("updateDeliveryLocation", ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    });

    return () => {
      socket.off("updateDeliveryLocation");
    };
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-10 px-4">

      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* HEADER */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <IoIosArrowRoundBack size={28} className="text-orange-500" />
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Track Your Order
          </h1>

        </div>

        {/* ORDER LIST */}

        {currentOrder?.shopOrders?.map((shopOrder, index) => (

          <div
            key={index}
            className="bg-white rounded-3xl shadow-lg border border-orange-100
            p-6 flex flex-col gap-5 hover:shadow-xl transition"
          >

            {/* SHOP HEADER */}

            <div className="flex justify-between items-center">

              <div>

                <p className="text-xl font-bold text-orange-600">
                  {shopOrder.shop.name}
                </p>

                <p className="text-sm text-gray-500">
                  Order #{currentOrder._id.slice(-6)}
                </p>

              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold
                ${
                  shopOrder.status === "delivered"
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {shopOrder.status}
              </span>

            </div>

            {/* ORDER DETAILS */}

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">

              <p>
                <span className="font-semibold">Items:</span>{" "}
                {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
              </p>

              <p>
                <span className="font-semibold">Subtotal:</span> ₹{shopOrder.subtotal}
              </p>

              <p className="md:col-span-2">
                <span className="font-semibold">Delivery Address:</span>{" "}
                {currentOrder.deliveryAddress?.text}
              </p>

            </div>

            {/* DELIVERY INFO */}

            {shopOrder.status !== "delivered" ? (

              <>
                {shopOrder.assignedDeliveryBoy ? (

                  <div className="bg-orange-50 rounded-xl p-4 text-sm space-y-1">

                    <p>
                      <span className="font-semibold">Delivery Boy:</span>{" "}
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>

                    <p>
                      <span className="font-semibold">Contact:</span>{" "}
                      {shopOrder.assignedDeliveryBoy.mobile}
                    </p>

                  </div>

                ) : (

                  <p className="text-gray-600 font-medium">
                    Delivery Boy is not assigned yet.
                  </p>

                )}
              </>

            ) : (

              <p className="text-green-600 font-semibold text-lg">
                Delivered Successfully
              </p>

            )}

            {/* MAP */}

            {(shopOrder.assignedDeliveryBoy &&
              shopOrder.status !== "delivered") && (

              <div className="h-[420px] w-full rounded-2xl overflow-hidden shadow">

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