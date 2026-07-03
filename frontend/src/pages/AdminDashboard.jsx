import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { ClipLoader } from "react-spinners";
import {
  MdDashboard,
  MdPeople,
  MdStorefront,
  MdDeliveryDining,
  MdShoppingCart,
  MdOutlinePayments,
  MdAnalytics,
  MdAccountCircle,
  MdSettings,
  MdLogout,
  MdOutlineSearch,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdHistory,
} from "react-icons/md";

function AdminItemRow({ item }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!item.expiresAt) {
      setTimeLeft("No Expiry Set");
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(item.expiresAt).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timeText = "";
        if (days > 0) {
          timeText = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          timeText = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
          timeText = `${minutes}m ${seconds}s`;
        } else {
          timeText = `${seconds}s`;
        }
        setTimeLeft(timeText);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item.expiresAt]);

  return (
    <div className="flex justify-between items-center text-xs font-bold text-gray-700 py-3.5 border-b border-gray-100">
      <div className="flex flex-col gap-1">
        <span className="text-gray-905 font-extrabold text-sm">{item.name || "Item Name"}</span>
        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Category: {item.category} | Stock: {item.stock}</span>
      </div>
      <div className="text-right flex flex-col gap-1">
        <span className="text-gray-905 font-extrabold text-sm">₹{item.price || 0}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
          isExpired 
            ? "bg-red-50 text-red-650 border-red-200" 
            : item.expiresAt 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-gray-50 text-gray-550 border-gray-200"
        }`}>
          {isExpired ? "❌ Expired" : item.expiresAt ? `⏳ ${timeLeft}` : "Fresh (No Expiry)"}
        </span>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, users, owners, delivery, shops, orders, payments, analytics, profile, settings
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [shopsData, setShopsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Users paginated query states
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRole, setUsersRole] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  // General detail modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ fullName: "", mobile: "", role: "", status: "" });
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [screenshotZoom, setScreenshotZoom] = useState(null);

  // Settings states
  const [upiSettings, setUpiSettings] = useState({ upiId: "rebite@upi" });
  const [settingsStatus, setSettingsStatus] = useState("");

  // Activity Logs states
  const [logsData, setLogsData] = useState([]);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsType, setLogsType] = useState("");
  const [logsStatus, setLogsStatus] = useState("");
  const [logsStartDate, setLogsStartDate] = useState("");
  const [logsEndDate, setLogsEndDate] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  const [error, setError] = useState("");

  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/admin/activity-logs?search=${logsSearch}&activityType=${logsType}&status=${logsStatus}&startDate=${logsStartDate}&endDate=${logsEndDate}&page=${logsPage}&limit=12`,
        { withCredentials: true }
      );
      setLogsData(res.data.logs);
      setLogsTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const handleExportCSV = () => {
    if (logsData.length === 0) {
      alert("No activity logs available to export.");
      return;
    }
    const headers = ["Date", "Type", "Action", "User", "Role", "Email", "Description", "Status", "IP Address"];
    const rows = logsData.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.activityType,
      log.action,
      log.userName,
      log.userRole,
      log.email,
      log.description,
      log.status,
      log.ipAddress
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true });
      setStats(statsRes.data.stats);

      // 2. Shops
      const shopsRes = await axios.get(`${serverUrl}/api/admin/shops`, { withCredentials: true });
      setShopsData(shopsRes.data);

      // 3. Orders
      const ordersRes = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true });
      setOrdersData(ordersRes.data);

      // 4. Analytics
      const analyticsRes = await axios.get(`${serverUrl}/api/admin/analytics`, { withCredentials: true });
      setAnalyticsData(analyticsRes.data);

      // 5. Payment settings config
      const configRes = await axios.get(`${serverUrl}/api/order/payment-config`, { withCredentials: true });
      setUpiSettings({ upiId: configRes.data.upiId });

      await fetchUsers();
      await fetchActivityLogs();
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRes = await axios.get(
        `${serverUrl}/api/admin/users?search=${usersSearch}&role=${usersRole}&page=${usersPage}&limit=8`,
        { withCredentials: true }
      );
      setUsersData(usersRes.data.users);
      setUsersTotalPages(usersRes.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [usersPage, usersRole]);

  useEffect(() => {
    fetchActivityLogs();
  }, [logsPage, logsType, logsStatus, logsStartDate, logsEndDate]);

  const handleUsersSearchSubmit = (e) => {
    e.preventDefault();
    setUsersPage(1);
    fetchUsers();
  };

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.error("Signout failed:", error);
    }
  };

  // User Actions
  const handleEditUserClick = (u) => {
    setSelectedUser(u);
    setEditUserForm({
      fullName: u.fullName,
      mobile: u.mobile,
      role: u.role,
      status: u.status || "active",
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${serverUrl}/api/admin/users/${selectedUser._id}`, editUserForm, { withCredentials: true });
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user details");
    }
  };

  const handleSuspendToggle = async (u) => {
    const targetStatus = u.status === "suspended" ? "active" : "suspended";
    try {
      await axios.put(`${serverUrl}/api/admin/users/${u._id}`, { status: targetStatus }, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert("Failed to change user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await axios.delete(`${serverUrl}/api/admin/users/${userId}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user account");
    }
  };

  // Shop Actions
  const handleShopStatusUpdate = async (shopId, newStatus) => {
    try {
      await axios.put(`${serverUrl}/api/admin/shops/${shopId}`, { status: newStatus }, { withCredentials: true });
      // update state locally
      setShopsData(prev => prev.map(s => s._id === shopId ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert("Failed to update shop status");
    }
  };

  // Payment Verification Actions
  const handleVerifyPayment = async (orderId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) return;
    try {
      await axios.post(`${serverUrl}/api/admin/payments/${orderId}/verify`, { action }, { withCredentials: true });
      // refresh orders & stats
      const ordersRes = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true });
      setOrdersData(ordersRes.data);
      const statsRes = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true });
      setStats(statsRes.data.stats);
      setScreenshotZoom(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to execute verification action");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-4">
          <ClipLoader size={45} color="#F97316" />
          <p className="text-xs font-semibold text-gray-500">Loading Super Admin panel...</p>
        </div>
      </div>
    );
  }

  // Delivery boys logic
  const deliveryBoysList = usersData.filter(u => u.role === "deliveryBoy") || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-gray-800">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-250 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Rebite Admin</span>
            <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">Super</span>
          </div>

          <nav className="mt-8 space-y-1">
            {[
              { id: "dashboard", name: "Dashboard", icon: <MdDashboard /> },
              { id: "users", name: "Users", icon: <MdPeople /> },
              { id: "owners", name: "Shop Owners", icon: <MdStorefront /> },
              { id: "delivery", name: "Delivery Boys", icon: <MdDeliveryDining /> },
              { id: "shops", name: "Shops", icon: <MdStorefront /> },
              { id: "orders", name: "Orders", icon: <MdShoppingCart /> },
              { id: "payments", name: "Payments", icon: <MdOutlinePayments /> },
              { id: "analytics", name: "Analytics", icon: <MdAnalytics /> },
              { id: "logs", name: "Activity Logs", icon: <MdHistory /> },
              { id: "profile", name: "Profile", icon: <MdAccountCircle /> },
              { id: "settings", name: "Settings", icon: <MdSettings /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            <MdLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 capitalize">{activeTab} Section</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition cursor-pointer"
            >
              <MdRefresh size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-xs">
                {userData?.fullName?.slice(0,1).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 leading-none">{userData?.fullName}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{userData?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="p-8 overflow-y-auto flex-1">
          
          {/* TAB: DASHBOARD HOME */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { name: "Total Users", value: stats.totalUsers || 0, color: "text-blue-500", bg: "bg-blue-50" },
                  { name: "Total Shop Owners", value: stats.totalShopOwners || 0, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { name: "Total Delivery Boys", value: stats.totalDeliveryBoys || 0, color: "text-teal-500", bg: "bg-teal-50" },
                  { name: "Total Shops", value: stats.totalShops || 0, color: "text-purple-500", bg: "bg-purple-50" },
                  { name: "Total Orders", value: stats.totalOrders || 0, color: "text-orange-500", bg: "bg-orange-50" },
                  { name: "Pending Orders", value: stats.pendingOrders || 0, color: "text-amber-500", bg: "bg-amber-50" },
                  { name: "Completed Orders", value: stats.completedOrders || 0, color: "text-green-500", bg: "bg-green-50" },
                  { name: "Cancelled Orders", value: stats.cancelledOrders || 0, color: "text-rose-500", bg: "bg-rose-50" },
                  { name: "Pending Payments", value: stats.pendingPayments || 0, color: "text-yellow-500", bg: "bg-yellow-50" },
                  { name: "Verified Payments", value: stats.verifiedPayments || 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((c, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.name}</p>
                    <p className="text-3xl font-black text-gray-800 mt-2">{c.value}</p>
                  </div>
                ))}

                {/* Revenue widget */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Estimated Revenue</p>
                  <p className="text-4xl font-black text-gray-800 mt-2">₹{stats.revenue || 0}</p>
                </div>
              </div>

              {/* Quick Payments Queue */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4">Payment Verification Alerts</h3>
                {ordersData.filter(o => o.paymentStatus === "Under Verification").length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium py-2">All deposits are fully processed. No actions required.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Order ID</th>
                          <th className="py-3 px-2">UTR Reference</th>
                          <th className="py-3 px-2">Amount</th>
                          <th className="py-3 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersData.filter(o => o.paymentStatus === "Under Verification").map((o, idx) => (
                          <tr key={idx} className="border-b border-gray-100 font-medium text-gray-700">
                            <td className="py-3 px-2">{o._id}</td>
                            <td className="py-3 px-2 font-mono text-orange-500">{o.paymentUTR}</td>
                            <td className="py-3 px-2">₹{o.totalAmount}</td>
                            <td className="py-3 px-2 flex gap-2">
                              <button
                                onClick={() => handleVerifyPayment(o._id, "approve")}
                                className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition hover:bg-green-600 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(o._id, "reject")}
                                className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition hover:bg-red-600 cursor-pointer"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <form onSubmit={handleUsersSearchSubmit} className="flex gap-2 w-full max-w-md">
                  <div className="relative flex-1">
                    <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                <div className="flex gap-2">
                  <select
                    value={usersRole}
                    onChange={(e) => { setUsersRole(e.target.value); setUsersPage(1); }}
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-600 outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="owner">Owner</option>
                    <option value="deliveryBoy">Delivery Boy</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-250 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-6">Phone</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.map((u, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 font-medium text-gray-700">
                        <td className="py-3.5 px-6 font-bold">{u.fullName}</td>
                        <td className="py-3.5 px-6 font-mono text-gray-500">{u.email}</td>
                        <td className="py-3.5 px-6">{u.mobile}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                            u.role === "superAdmin"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : u.role === "owner"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : u.role === "deliveryBoy"
                              ? "bg-teal-50 text-teal-600 border border-teal-100"
                              : "bg-gray-50 text-gray-500 border border-gray-150"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                            (u.status || "active") === "suspended"
                              ? "bg-red-50 text-red-500"
                              : "bg-green-50 text-green-500"
                          }`}>
                            {u.status || "active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUserClick(u)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSuspendToggle(u)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer ${
                              u.status === "suspended"
                                ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {u.status === "suspended" ? "Activate" : "Suspend"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 border border-gray-250 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page {usersPage} of {usersTotalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={usersPage <= 1}
                      onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={usersPage >= usersTotalPages}
                      onClick={() => setUsersPage(prev => Math.min(usersTotalPages, prev + 1))}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHOP OWNERS */}
          {activeTab === "owners" && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-250 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Shop Name</th>
                    <th className="py-3.5 px-6">Owner Name</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Phone</th>
                    <th className="py-3.5 px-6">City / State</th>
                    <th className="py-3.5 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopsData.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100 font-medium text-gray-700">
                      <td className="py-3.5 px-6 font-bold text-gray-800">{s.name}</td>
                      <td className="py-3.5 px-6">{s.owner?.fullName || "Unregistered"}</td>
                      <td className="py-3.5 px-6 font-mono text-gray-400">{s.owner?.email}</td>
                      <td className="py-3.5 px-6">{s.owner?.mobile}</td>
                      <td className="py-3.5 px-6">{s.city}, {s.state}</td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => setSelectedShop(s)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          View Items ({s.items?.length || 0})
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: DELIVERY BOYS */}
          {activeTab === "delivery" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersData.filter(u => u.role === "deliveryBoy").length === 0 ? (
                <p className="text-xs text-gray-400 col-span-full">No active delivery boys found on the platform.</p>
              ) : (
                usersData.filter(u => u.role === "deliveryBoy").map((d, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-500 text-white font-black rounded-full flex items-center justify-center text-lg">
                        {d.fullName?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-850">{d.fullName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{d.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-gray-400">Mobile</p>
                        <p className="text-gray-800 mt-0.5 font-bold">{d.mobile}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Current Status</p>
                        <p className="text-green-500 mt-0.5 font-bold capitalize">Active</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SHOPS */}
          {activeTab === "shops" && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-250 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Image</th>
                    <th className="py-3.5 px-6">Shop Name</th>
                    <th className="py-3.5 px-6">Address</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopsData.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100 font-medium text-gray-700">
                      <td className="py-3.5 px-6">
                        <img src={s.image} alt={s.name} className="w-10 h-10 object-cover rounded-xl border border-gray-200" />
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-800">{s.name}</td>
                      <td className="py-3.5 px-6">{s.address}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          (s.status || "approved") === "approved"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : (s.status || "approved") === "pending"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {s.status || "approved"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleShopStatusUpdate(s._id, "approved")}
                          className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleShopStatusUpdate(s._id, "rejected")}
                          className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleShopStatusUpdate(s._id, "disabled")}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Disable
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-250 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Payment Method</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map((o, i) => (
                    <tr key={i} className="border-b border-gray-100 font-medium text-gray-700">
                      <td className="py-3.5 px-6 font-mono text-gray-500">{o._id}</td>
                      <td className="py-3.5 px-6">{o.user?.fullName || "Anonymous"}</td>
                      <td className="py-3.5 px-6 font-bold">₹{o.totalAmount}</td>
                      <td className="py-3.5 px-6 uppercase">{o.paymentMethod}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          o.paymentStatus === "Verified"
                            ? "bg-green-50 text-green-600 border border-green-150"
                            : o.paymentStatus === "Under Verification"
                            ? "bg-yellow-50 text-yellow-600 border border-yellow-150"
                            : "bg-red-50 text-red-650"
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-150">
                <h3 className="text-sm font-extrabold text-gray-900">Manual Payment Verification</h3>
                <p className="text-xs text-gray-400 mt-1">Review UPI deposits, screenshots, and matching 12-digit UTR reference codes.</p>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-250 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6 font-mono">UTR Reference</th>
                    <th className="py-3.5 px-6 text-center">Receipt</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.filter(o => o.paymentMethod === "online" && o.paymentUTR).map((o, i) => (
                    <tr key={i} className="border-b border-gray-100 font-medium text-gray-700">
                      <td className="py-3.5 px-6 font-mono text-gray-400">{o._id}</td>
                      <td className="py-3.5 px-6">{o.user?.fullName}</td>
                      <td className="py-3.5 px-6 font-bold">₹{o.totalAmount}</td>
                      <td className="py-3.5 px-6 font-mono text-orange-500">{o.paymentUTR}</td>
                      <td className="py-3.5 px-6 text-center">
                        {o.paymentScreenshot ? (
                          <button
                            onClick={() => setScreenshotZoom(o)}
                            className="bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 cursor-pointer"
                          >
                            View Image
                          </button>
                        ) : (
                          <span className="text-gray-300">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          o.paymentStatus === "Verified"
                            ? "bg-green-50 text-green-600 border border-green-150"
                            : o.paymentStatus === "Under Verification"
                            ? "bg-yellow-50 text-yellow-600 border border-yellow-150"
                            : "bg-red-50 text-red-650"
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center flex items-center justify-center gap-1.5">
                        <button
                          disabled={o.paymentStatus === "Verified"}
                          onClick={() => handleVerifyPayment(o._id, "approve")}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          disabled={o.paymentStatus === "Rejected"}
                          onClick={() => handleVerifyPayment(o._id, "reject")}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && analyticsData && (
            <div className="space-y-8">
              {/* Daily Sales Custom Bar Chart */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-900 mb-6">Daily Sales Volume (Last 30 Days)</h3>
                
                {analyticsData.dailySales?.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium py-4 text-center">No transaction logs recorded in the selected range.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end h-48 border-b border-gray-200 pb-2">
                      {analyticsData.dailySales.map((day, idx) => {
                        const maxVal = Math.max(...analyticsData.dailySales.map(d => d.sales), 100);
                        const pct = (day.sales / maxVal) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[9px] font-extrabold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                              ₹{day.sales}
                            </div>
                            {/* Bar item */}
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-4 bg-orange-500 hover:bg-orange-600 rounded-t-sm transition-all duration-300"
                            />
                            {/* Label */}
                            <span className="text-[9px] text-gray-400 mt-2 font-bold rotate-45 origin-left tracking-wide whitespace-nowrap">{day.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Popular Foods */}
                <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4">Top Ordered Dishes</h3>
                  <div className="space-y-3">
                    {analyticsData.popularFoods?.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-bold text-gray-700 py-1 border-b border-gray-50">
                        <span>{f.name}</span>
                        <span className="text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">{f.quantity} sold</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Roles Share */}
                <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4">Account Categories Breakdown</h3>
                  <div className="space-y-3">
                    {analyticsData.registrationShare?.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-bold text-gray-700 py-1 border-b border-gray-50">
                        <span>{r.name}</span>
                        <span className="text-gray-500 font-mono">{r.value} registrations</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Admin Account Info</h3>
                <p className="text-xs text-gray-400 mt-1">Configure your authentication details.</p>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={userData?.fullName}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email ID</label>
                  <input
                    type="email"
                    readOnly
                    value={userData?.email}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    readOnly
                    value={userData?.mobile}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Platform Settings</h3>
                <p className="text-xs text-gray-400 mt-1">Manage configuration attributes for UPI manual payments.</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSettingsStatus("");
                  // simulate local config save since settings are database dynamic or env
                  setSettingsStatus("Settings saved successfully (in-memory simulation).");
                }}
                className="space-y-4 text-xs font-medium"
              >
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Platform UPI ID</label>
                  <input
                    type="text"
                    required
                    value={upiSettings.upiId}
                    onChange={(e) => setUpiSettings({ upiId: e.target.value })}
                    className="w-full border border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3 text-gray-800 outline-none transition"
                  />
                </div>

                {settingsStatus && (
                  <p className="text-green-600 font-bold">{settingsStatus}</p>
                )}

                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB: LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Search description, email, user..."
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      className="bg-gray-50 border border-gray-250 rounded-2xl pl-10 pr-4 py-2 text-xs w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  <button
                    onClick={() => { setLogsPage(1); fetchActivityLogs(); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-2xl cursor-pointer transition"
                  >
                    Search
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  {/* Type Filter */}
                  <select
                    value={logsType}
                    onChange={(e) => { setLogsType(e.target.value); setLogsPage(1); }}
                    className="bg-white border border-gray-250 rounded-2xl px-3 py-2 text-xs text-gray-600 outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Orders">Orders</option>
                    <option value="Payments">Payments</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Users">Users</option>
                    <option value="Shops">Shops</option>
                    <option value="Food">Food</option>
                    <option value="Admin">Admin</option>
                    <option value="System">System</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={logsStatus}
                    onChange={(e) => { setLogsStatus(e.target.value); setLogsPage(1); }}
                    className="bg-white border border-gray-250 rounded-2xl px-3 py-2 text-xs text-gray-600 outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="neutral">Neutral</option>
                  </select>

                  {/* Date pickers */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-250 rounded-2xl px-3 py-1 text-xs">
                    <span className="text-[10px] text-gray-405 font-bold uppercase">From:</span>
                    <input
                      type="date"
                      value={logsStartDate}
                      onChange={(e) => { setLogsStartDate(e.target.value); setLogsPage(1); }}
                      className="bg-transparent outline-none text-gray-650 text-xs border-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-250 rounded-2xl px-3 py-1 text-xs">
                    <span className="text-[10px] text-gray-405 font-bold uppercase">To:</span>
                    <input
                      type="date"
                      value={logsEndDate}
                      onChange={(e) => { setLogsEndDate(e.target.value); setLogsPage(1); }}
                      className="bg-transparent outline-none text-gray-650 text-xs border-none"
                    />
                  </div>

                  {/* Export */}
                  <button
                    onClick={handleExportCSV}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-2xl cursor-pointer border border-gray-250 transition"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Logs Timeline */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">Platform Audit Trail</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">showing latest actions first</span>
                </div>

                {logsData.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No matching activity logs found.</p>
                ) : (
                  <div className="relative pl-6 border-l border-gray-150 space-y-8 py-2">
                    {logsData.map((log, idx) => {
                      let statusBadge = "bg-gray-50 text-gray-500 border-gray-200";
                      if (log.status === "success") statusBadge = "bg-green-50 text-green-600 border-green-100";
                      else if (log.status === "failed") statusBadge = "bg-red-50 text-red-600 border-red-100";
                      else if (log.status === "warning") statusBadge = "bg-orange-50 text-orange-600 border-orange-100";
                      else if (log.status === "info") statusBadge = "bg-blue-50 text-blue-600 border-blue-100";

                      return (
                        <div key={idx} className="relative">
                          {/* Timeline node */}
                          <div className="absolute -left-[31px] top-1 bg-white border border-gray-200 rounded-full w-4 h-4 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          </div>

                          <div className="flex items-start gap-4 text-xs">
                            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center text-sm font-black shrink-0">
                              {log.userName?.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-extrabold text-gray-800">{log.userName}</span>
                                <span className="text-[10px] text-gray-400 font-mono capitalize">{log.email}</span>
                                <span className="text-[9px] bg-gray-50 text-gray-500 border border-gray-150 px-2 py-0.5 rounded-full font-bold uppercase">{log.userRole}</span>
                                <span className="text-[10px] text-gray-450 ml-auto font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-gray-600 leading-relaxed font-semibold">{log.description}</p>
                              <div className="flex items-center gap-4 text-[10px] text-gray-400">
                                <span>Action: <strong className="text-gray-600 font-bold">{log.action}</strong></span>
                                <span>Type: <strong className="text-gray-600 font-bold">{log.activityType}</strong></span>
                                {log.ipAddress && <span>IP: <strong className="text-gray-650 font-mono">{log.ipAddress}</strong></span>}
                                <span className={`px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase ${statusBadge}`}>{log.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {logsTotalPages > 1 && (
                  <div className="pt-4 border-t border-gray-105 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page {logsPage} of {logsTotalPages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={logsPage <= 1}
                        onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                        className="px-4 py-2 bg-white border border-gray-250 rounded-xl text-xs font-bold transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                      >
                        Prev
                      </button>
                      <button
                        disabled={logsPage >= logsTotalPages}
                        onClick={() => setLogsPage(prev => Math.min(logsTotalPages, prev + 1))}
                        className="px-4 py-2 bg-white border border-gray-250 rounded-xl text-xs font-bold transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL: EDIT USER ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-base font-extrabold text-gray-900 mb-6">Modify User Account</h3>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.fullName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Mobile</label>
                <input
                  type="text"
                  required
                  value={editUserForm.mobile}
                  onChange={(e) => setEditUserForm({ ...editUserForm, mobile: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none"
                >
                  <option value="user">User</option>
                  <option value="owner">Owner</option>
                  <option value="deliveryBoy">Delivery Boy</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Account Status</label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SHOP ITEMS VIEW ================= */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-gray-900">{selectedShop.name} - Products Inventory</h3>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {selectedShop.items?.length === 0 ? (
                <p className="text-xs text-gray-400">This shop has no products registered.</p>
              ) : (
                selectedShop.items?.map((item, idx) => (
                  <AdminItemRow item={item} key={idx} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS VIEW ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-gray-900">Order transaction logs</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Order ID</p>
                  <p className="font-mono text-gray-800 mt-1">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Total Amount</p>
                  <p className="font-black text-orange-500 mt-1">₹{selectedOrder.totalAmount}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold">Delivery Address</p>
                <p className="text-gray-850 mt-1">{selectedOrder.deliveryAddress?.text}</p>
              </div>

              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold mb-2">Shop Divisions</p>
                <div className="space-y-3">
                  {selectedOrder.shopOrders?.map((so, idx) => (
                    <div key={idx} className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50 space-y-2">
                      <div className="flex justify-between items-center text-xs font-extrabold text-gray-800">
                        <span>{so.shop?.name || "Shop Name"}</span>
                        <span className="capitalize text-orange-500">{so.status}</span>
                      </div>
                      <div className="space-y-1.5 pt-1 text-[11px] font-medium text-gray-600">
                        {so.shopOrderItems?.map((item, id) => (
                          <div key={id} className="flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.finalPrice || item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= OVERLAY MODAL: SCREENSHOT ZOOM ================= */}
      {screenshotZoom && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative flex flex-col items-center space-y-4">
            <div className="w-full flex justify-between items-center">
              <h4 className="text-sm font-extrabold text-gray-900">Deposit Screenshot verification</h4>
              <button
                onClick={() => setScreenshotZoom(null)}
                className="text-gray-500 hover:text-gray-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
            <img src={screenshotZoom.paymentScreenshot} alt="Verification Zoom" className="w-full max-h-[60vh] object-contain rounded-2xl border border-gray-200" />
            <div className="w-full flex justify-end gap-2 pt-2">
              <button
                disabled={screenshotZoom.paymentStatus === "Verified"}
                onClick={() => handleVerifyPayment(screenshotZoom._id, "approve")}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Approve Payment
              </button>
              <button
                disabled={screenshotZoom.paymentStatus === "Rejected"}
                onClick={() => handleVerifyPayment(screenshotZoom._id, "reject")}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
