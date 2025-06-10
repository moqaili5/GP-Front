import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [memberRequests, setMemberRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState("notifications");
  const profileMenuRef = useRef();
  const notifRef = useRef();
  const mobileMenuRef = useRef();

  const tabs = [
    { name: "حول المنصة", path: "/about" },
    { name: "لوحة النتائج", path: "/leaderboard" },
    { name: "المناسبات", path: "/events" },
    { name: "الأندية", path: "/clubs" },
    { name: "الرئيسية", path: "/home" }
  ];

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isClubResponsible = userInfo?.role === "club_responsible";
  const managedClubId = userInfo?.managedClub;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showProfileMenu || showMobileMenu || showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu, showMobileMenu, showNotifications]);

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
    setShowMobileMenu(false);
  };

  const handleMobileMenuClick = () => {
    setShowMobileMenu((prev) => !prev);
    setShowProfileMenu(false);
  };

  const handleMenuSelect = (action) => {
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    if (action === "profile") {
      navigate("/profile");
    } else if (action === "logout") {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Notifications logic
  const handleNotificationsClick = async () => {
    setShowNotifications((prev) => !prev);
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    if (!showNotifications) {
      setActiveNotifTab("notifications");
      setLoadingNotifications(true);
      try {
        const token = userInfo?.token;
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${apiUrl}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.notifications || []);
      } catch {
        setNotifications([]);
      }
      setLoadingNotifications(false);

      // Fetch member requests if club responsible
      if (isClubResponsible && managedClubId) {
        setLoadingRequests(true);
        try {
          const token = userInfo?.token;
          const apiUrl = import.meta.env.VITE_API_URL;
          const res = await axios.get(
            `${apiUrl}/clubs/${managedClubId}/registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const requests = Array.isArray(res.data.data) ? res.data.data : [];
          setMemberRequests(requests);
        } catch {
          setMemberRequests([]);
        }
        setLoadingRequests(false);
      } else {
        setMemberRequests([]);
      }
    }
  };

  // Mark notification as read
  const handleNotificationClick = async (notifId) => {
    try {
      const token = userInfo?.token;
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(
        `${apiUrl}/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
    } catch {
      // Optionally handle error
    }
  };

  // Accept/Decline member request (update status in UI, don't remove)
  const handleMemberAction = async (requestId, action) => {
    try {
      const token = userInfo?.token;
      const apiUrl = import.meta.env.VITE_API_URL;
      if (action === "accept") {
        await axios.put(
          `${apiUrl}/registrations/${requestId}`,
          { status: "approved" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "rejected" || action === "decline") {
        await axios.patch(
          `${apiUrl}/registrations/${requestId}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMemberRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? { ...r, status: action === "accept" ? "approved" : "rejected" }
            : r
        )
      );
    } catch {
      // Optionally show error
    }
  };

  const filteredRequests = Array.isArray(memberRequests) ? memberRequests : [];

  return (
    <nav
      className="fixed top-0 left-0 right-0 bg-white rounded-2xl shadow-md py-2 px-4"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center">
        {/* Left Section: Notifications and Profile (hidden on mobile) */}
        <div className="hidden sm:flex space-x-2 items-end">
          
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={handleProfileClick}
              className="rounded-full hover:bg-gray-200 transition duration-200 focus:outline-none"
              style={{ width: 32, height: 32, padding: 0 }}
            >
              {userInfo?.profilePicture &&
              userInfo.profilePicture !== "default.jpg" ? (
                <img
                  src={
                    userInfo.profilePicture.startsWith("http")
                      ? userInfo.profilePicture
                      : `${import.meta.env.VITE_API_URL}/uploads/${
                          userInfo.profilePicture
                        }`
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              )}
            </button>
            {showProfileMenu && (
              <div
                className="absolute left-0 mt-2 menu-bg shadow-lg p-4 flex flex-col items-center min-w-[200px] z-50 animate-fade-in"
                style={{ marginRight: 12 }}
              >
                <button
                  onClick={() => handleMenuSelect("profile")}
                  className="text-black font-semibold text-base mb-3 focus:outline-none"
                  style={{ marginRight: 8 }}
                >
                  عرض الملف الشخصي
                </button>
                <button
                  onClick={() => handleMenuSelect("logout")}
                  className="bg-[#F82C5B] text-white font-semibold text-base rounded-full px-6 py-2 focus:outline-none"
                  style={{ marginRight: 8 }}
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotificationsClick}
              className="p-2 rounded-full hover:bg-gray-200 transition duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
            </button>
            {showNotifications && (
              <div
                className="absolute left-0 mt-2 menu-bg shadow-lg p-4 flex flex-col items-center min-w-[340px] max-h-[450px] overflow-y-auto z-50 animate-fade-in"
                style={{ marginRight: 12 }}
              >
                {/* Tabs */}
                <div className="flex w-full mb-3 border-b border-blue-100">
                  <button
                    className={`flex-1 py-2 font-bold text-base rounded-t-lg transition ${
                      activeNotifTab === "notifications"
                        ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveNotifTab("notifications")}
                  >
                    الإشعارات
                  </button>
                  <button
                    className={`flex-1 py-2 font-bold text-base rounded-t-lg transition ${
                      activeNotifTab === "unread"
                        ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveNotifTab("unread")}
                  >
                    غير مقروءة
                  </button>
                  {isClubResponsible && (
                    <button
                      className={`flex-1 py-2 font-bold text-base rounded-t-lg transition ${
                        activeNotifTab === "members"
                          ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                          : "text-gray-600"
                      }`}
                      onClick={() => setActiveNotifTab("members")}
                    >
                      طلبات الأعضاء
                    </button>
                  )}
                </div>
                {/* Tab Content */}
                {activeNotifTab === "notifications" && (
                  <>
                    {loadingNotifications ? (
                      <div className="text-gray-500">جاري التحميل...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-gray-500">لا توجد إشعارات</div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div
                          key={notif._id || idx}
                          className={`w-full text-right mb-2 border-b pb-2 last:border-b-0 last:pb-0 rounded-lg transition ${
                            notif.isRead ? "bg-white" : "bg-gray-100"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleNotificationClick(notif._id)}
                        >
                          <div className="text-sm text-gray-800">
                            {notif.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString(
                                  "ar-EG"
                                )
                              : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
                {activeNotifTab === "unread" && (
                  <>
                    {loadingNotifications ? (
                      <div className="text-gray-500">جاري التحميل...</div>
                    ) : notifications.filter(n => !n.isRead).length === 0 ? (
                      <div className="text-gray-500">لا توجد إشعارات غير مقروءة</div>
                    ) : (
                      notifications
                        .filter(n => !n.isRead)
                        .map((notif, idx) => (
                          <div
                            key={notif._id || idx}
                            className="w-full text-right mb-2 border-b pb-2 last:border-b-0 last:pb-0 rounded-lg bg-gray-100 transition"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleNotificationClick(notif._id)}
                          >
                            <div className="text-sm text-gray-800">{notif.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {notif.createdAt
                                ? new Date(notif.createdAt).toLocaleString("ar-EG")
                                : ""}
                            </div>
                          </div>
                        ))
                    )}
                  </>
                )}
                {activeNotifTab === "members" && isClubResponsible && (
                  <>
                    {loadingRequests ? (
                      <div className="text-gray-500">جاري التحميل...</div>
                    ) : filteredRequests.length === 0 ? (
                      <div className="text-gray-500">لا توجد طلبات جديدة</div>
                    ) : (
                      filteredRequests.map((req) => (
                        <div
                          key={req._id}
                          className="w-full text-right mb-4 p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2"
                        >
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-gray-800">{req.student?.name}</span>
                            <span className="text-sm text-blue-700 mt-1">
                              النادي: {req.club?.name}
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            {req.status === "pending" && (
                              <>
                                <button
                                  className="bg-green-500 text-white px-4 py-1 rounded font-semibold text-sm hover:bg-green-600 transition"
                                  onClick={() => handleMemberAction(req._id, "accept")}
                                >
                                  قبول
                                </button>
                                <button
                                  className="bg-red-500 text-white px-4 py-1 rounded font-semibold text-sm hover:bg-red-600 transition"
                                  onClick={() => handleMemberAction(req._id, "decline")}
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            {req.status === "approved" && (
                              <span className="text-green-700 font-bold text-base">مقبول</span>
                            )}
                            {req.status === "rejected" && (
                              <span className="text-red-700 font-bold text-base">مرفوض</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex justify-between w-full">
                            <span>
                              {req.status === "pending"
                                ? "قيد الانتظار"
                                : req.status === "approved"
                                ? "مقبول"
                                : "مرفوض"}
                            </span>
                            <span>
                              {new Date(req.createdAt).toLocaleString("ar-EG")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hamburger menu button for mobile */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={handleMobileMenuClick}
            className="p-2 rounded-md focus:outline-none border border-gray-200 bg-gray-100"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
            
        {/* Right Section: Tabs (hidden on mobile) */}
        <div className="hidden sm:flex space-x-2 sm:space-x-4">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition duration-200
                  ${
                    isActive
                      ? "bg-[rgb(59,130,246)] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }
                `}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <img
            src="https://www.ppu.edu/p/sites/all/themes/ppu2018/logo.png"
            alt="Logo"
            className="h-10 w-10 object-contain"
            style={{ borderRadius: "8px" }}
          />
        </div>
      </div>
          
      {/* Mobile menu dropdown */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden absolute top-16 left-0 right-0 menu-bg shadow-lg p-4 flex flex-col items-center z-50 animate-fade-in"
        >
          {/* Navigation links */}
          <div className="flex flex-col w-full mb-4">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate(tab.path);
                  }}
                  className={`w-full text-right px-4 py-2 rounded-lg text-base font-medium mb-1 transition duration-200
                    ${
                      isActive
                        ? "bg-[rgb(59,130,246)] text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }
                  `}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
          {/* Profile and logout buttons */}
          <button
            onClick={() => {
              setShowMobileMenu(false);
              navigate("/profile");
            }}
            className="w-full text-black font-semibold text-base mb-3 focus:outline-none text-right px-4"
          >
            عرض الملف الشخصي
          </button>
          <button
            onClick={() => {
              setShowMobileMenu(false);
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-[#F82C5B] text-white font-semibold text-base rounded-full px-6 py-2 focus:outline-none text-right"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;