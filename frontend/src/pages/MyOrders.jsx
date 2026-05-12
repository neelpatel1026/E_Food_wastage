/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import {
  setMyOrders,
  updateRealtimeOrderStatus
} from "../redux/userSlice";

function MyOrders() {

  const { userData, myOrders, socket } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {

    socket?.on("newOrder", (data) => {
      if (data.shopOrders?.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    });

    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId === userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
      }
    });

    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
    };

  }, [socket]);
  
//   useEffect(() => {

//   if (!socket || !userData) return;

//   const handleNewOrder = (data) => {

//     if (data?.shopOrders?.owner?._id === userData._id) {
//       dispatch(setMyOrders(prev => [data, ...prev]));
//     }

//   };

//   const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {

//     if (userId === userData._id) {
//       dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
//     }

//   };

//   socket.on("newOrder", handleNewOrder);
//   socket.on("update-status", handleStatusUpdate);

//   return () => {
//     socket.off("newOrder", handleNewOrder);
//     socket.off("update-status", handleStatusUpdate);
//   };

// }, [socket, userData, dispatch]);

useEffect(() => {

  if (!socket || !userData) return;

  const handleNewOrder = (data) => {

    if (data?.shopOrders?.owner?._id === userData._id) {

      dispatch(setMyOrders(prev => [data, ...prev]));
    }
  };
  const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {
    if (userId === userData._id) {
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
    }
  };
  socket.on("newOrder", handleNewOrder);
  socket.on("update-status", handleStatusUpdate);
  return () => {
    socket.off("newOrder", handleNewOrder);
    socket.off("update-status", handleStatusUpdate);
  };

}, [socket, userData, dispatch]);

  return (
    <div
      className="w-full min-h-screen flex justify-center px-4 py-10
      bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50"
    >

      <div className="w-full max-w-5xl">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <button
            className="p-2 rounded-full bg-white shadow-md
            hover:shadow-lg transition"
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack
              size={28}
              className="text-orange-500"
            />
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>

        </div>

        {/* ORDERS LIST */}

        {myOrders?.length > 0 ? (

          <div className="space-y-6">

            {myOrders.map((order, index) => (

              userData.role === "user" ? (

                <UserOrderCard
                  data={order}
                  key={index}
                />

              ) : userData.role === "owner" ? (

                <OwnerOrderCard
                  data={order}
                  key={index}
                />

              ) : null

            ))}

          </div>

        ) : (

          <div
            className="flex flex-col items-center justify-center
            text-center py-20 bg-white rounded-3xl shadow
            border border-gray-100"
          >

            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Orders Yet
            </h2>

            <p className="text-gray-500 text-sm">
              Your orders will appear here once you place one.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default MyOrders;





// /* eslint-disable no-unused-vars */
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { IoIosArrowRoundBack } from "react-icons/io";
// import { useNavigate } from "react-router-dom";
// import UserOrderCard from "../components/UserOrderCard";
// import OwnerOrderCard from "../components/OwnerOrderCard";
// import {
//   setMyOrders,
//   updateRealtimeOrderStatus
// } from "../redux/userSlice";

// function MyOrders() {

//   const { userData, myOrders, socket } = useSelector((state) => state.user);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {

//     if (!socket || !userData) return;

//     const handleNewOrder = (data) => {

//       if (data?.shopOrders?.owner?._id === userData._id) {

//         dispatch(setMyOrders(prev => [data, ...prev]));

//       }

//     };

//     const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {

//       if (userId === userData._id) {

//         dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));

//       }

//     };

//     socket.on("newOrder", handleNewOrder);
//     socket.on("update-status", handleStatusUpdate);

//     return () => {

//       socket.off("newOrder", handleNewOrder);
//       socket.off("update-status", handleStatusUpdate);

//     };

//   }, [socket, userData, dispatch]);

//   return (
//     <div
//       className="w-full min-h-screen flex justify-center px-4 py-10
//       bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50"
//     >

//       <div className="w-full max-w-5xl">

//         {/* HEADER */}

//         <div className="flex items-center gap-4 mb-8">

//           <button
//             className="p-2 rounded-full bg-white shadow-md
//             hover:shadow-lg transition"
//             onClick={() => navigate("/")}
//           >
//             <IoIosArrowRoundBack
//               size={28}
//               className="text-orange-500"
//             />
//           </button>

//           <h1 className="text-3xl font-bold text-gray-800">
//             My Orders
//           </h1>

//         </div>

//         {/* ORDERS LIST */}

//         {Array.isArray(myOrders) && myOrders.length > 0 ? (

//           <div className="space-y-6">

//             {myOrders.map((order) => (

//               userData?.role === "user" ? (

//                 <UserOrderCard
//                   data={order}
//                   key={order._id}
//                 />

//               ) : userData?.role === "owner" ? (

//                 <OwnerOrderCard
//                   data={order}
//                   key={order._id}
//                 />

//               ) : null

//             ))}

//           </div>

//         ) : (

//           <div
//             className="flex flex-col items-center justify-center
//             text-center py-20 bg-white rounded-3xl shadow
//             border border-gray-100"
//           >

//             <h2 className="text-xl font-semibold text-gray-700 mb-2">
//               No Orders Yet
//             </h2>

//             <p className="text-gray-500 text-sm">
//               Your orders will appear here once you place one.
//             </p>

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }

// export default MyOrders;