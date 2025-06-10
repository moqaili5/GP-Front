import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavBar";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import CreateEvent from "../components/CreateEvent";
import EventCard from "../components/EventCard";
import Loading from "../components/loading/loading";

const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null);
  const [loadingJoin, setLoadingJoin] = useState(false);

  // Members modal state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  useEffect(() => {
    setLoadingClub(true);
    setLoadingPosts(true);
    setLoadingEvents(true);

    axios
      .get(`${apiUrl}/clubs/${id}`)
      .then((res) => {
        console.log("club details response:", res.data);

        setClub(res.data.data);
        setLoadingClub(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب بيانات النادي.");
        setLoadingClub(false);
      });

    console.log("clubs details id:", id);
    console.log("club:", club);

    axios
      .get(`${apiUrl}/posts/club/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPosts(res.data.data || []);
        setLoadingPosts(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب منشورات النادي.");
        setLoadingPosts(false);
      });

    axios
      .get(`${apiUrl}/events/club/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEvents(res.data.data || []);
        console.log("events response:", res.data);

        setLoadingEvents(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب فعاليات النادي.");
        setLoadingEvents(false);
      });
    console.log("events: ", events);
  }, [id, apiUrl, token]);

  // Fallback: check if user is in club.members if joinStatus is not set
  useEffect(() => {
    if (!token || !club || !userInfo) return;
    if (
      joinStatus === "approved" ||
      joinStatus === "pending" ||
      joinStatus === "rejected"
    )
      return;
    if (Array.isArray(club.members) && club.members.includes(userInfo._id)) {
      setJoinStatus("approved");
    }
  }, [club, token, userInfo, joinStatus]);

  // Use /registrations endpoint for joining
  const handleJoinClub = async () => {
    setLoadingJoin(true);
    try {
      await axios.post(
        `${apiUrl}/registrations`,
        { club: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJoinStatus("pending");
      setShowModal(true);
    } catch {
      setError("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
    }
    setLoadingJoin(false);
  };

  // Use /registrations/<clubid>/leave endpoint for leaving
  const handleLeaveClub = async () => {
    setLoadingJoin(true);
    try {
      await axios.delete(`${apiUrl}/registrations/${id}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoinStatus(null);
      setClub((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members?.filter((m) => m !== userInfo._id),
            }
          : prev
      );
    } catch {
      setError("حدث خطأ أثناء إلغاء الانضمام. حاول مرة أخرى.");
    }
    setLoadingJoin(false);
  };

  // Fetch club members for modal
  const fetchMembers = async () => {
    setLoadingMembers(true);
    setShowMembersModal(true);
    try {
      const res = await axios.get(`${apiUrl}/clubs/${id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.data || []);
    } catch {
      setMembers([]);
      setError("حدث خطأ أثناء جلب أعضاء النادي.");
    }
    setLoadingMembers(false);
  };

  // POSTS HANDLERS
  const handlePostCreated = (newPost) => {
    if (club) newPost.club = club;
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((posts) =>
      posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((posts) => posts.filter((post) => post._id !== deletedId));
  };

  // EVENTS HANDLERS
  const handleEventCreated = (newEvent) => {
    if (club) newEvent.club = club;
    setEvents([newEvent, ...events]);
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents((events) =>
      events.map((event) =>
        event._id === updatedEvent._id ? updatedEvent : event
      )
    );
  };

  const handleEventDeleted = (deletedId) => {
    setEvents((events) => events.filter((event) => event._id !== deletedId));
  };

  const canEditPost =
    userInfo &&
    (userInfo.role === "system_responsible" ||
      (userInfo.role === "club_responsible" &&
        userInfo.managedClub === club?._id));

  // Button label, color, disabled logic, and action
  let buttonLabel = "طلب انضمام";
  let buttonDisabled = false;
  let buttonAction = handleJoinClub;
  let buttonColorClass = "bg-blue-600 text-white hover:bg-blue-700";

  if (joinStatus === "pending") {
    buttonLabel = "بانتظار الموافقة";
    buttonDisabled = true;
  } else if (joinStatus === "approved") {
    buttonLabel = "إلغاء الانضمام";
    buttonDisabled = false;
    buttonAction = handleLeaveClub;
    buttonColorClass = "bg-red-600 text-white hover:bg-red-700";
  } else if (joinStatus === "rejected") {
    buttonLabel = "مرفوض";
    buttonDisabled = true;
  }

  // Always show the button for logged-in users (for debugging, remove role check)
  // To restore original behavior, use: token && userInfo?.role === "student"
  const showJoinButton = token && club && userInfo;

  // Show loading spinner if any main section is loading
  if (loadingClub || loadingPosts || loadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <Navbar />
      <div className="h-6 sm:h-10 md:h-20"></div>
      <div
        className="w-full flex flex-col items-center px-1 sm:px-4 md:px-8 lg:px-16"
        dir="rtl"
      >
        {/* Club Card */}
        {club && (
          <div className="w-full bg-white rounded-3xl shadow-md overflow-hidden mb-10 max-w-2xl sm:max-w-3xl md:max-w-4xl">
            <div className="relative">
              <img
                src={
                  club.coverPicture ||
                  "https://www.ppu.edu.p/sites/default/files/ppu-1714156162-118aabb4-40c7-4373-8f3a-127f4e52a705.jpeg"
                }
                alt="Cover"
                className="w-full h-32 sm:h-56 object-cover"
              />
              <div className="absolute bottom-0 right-4 sm:right-8 translate-y-1/2 z-10">
                <img
                  src={
                    club.coverPicture ||
                    "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg"
                  }
                  alt="Profile"
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg border-4 border-white object-cover shadow-lg"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-8 pt-16 sm:pt-20 pb-6 sm:pb-8 gap-4">
              <div className="flex-1 w-full">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center sm:text-right break-words">
                  {club.name}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-2 text-right break-words">
                  {club.description}
                </p>
                <div className="flex flex-col sm:flex-row justify-between text-gray-500 text-base mt-4 gap-2">
                  <span>الكلية: {club.college}</span>
                  <span>عدد الأعضاء: {club.members?.length || 0}</span>
                  <button
                    className="ml-0 sm:ml-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-200 transition w-full sm:w-auto"
                    onClick={fetchMembers}
                    type="button"
                  >
                    أعضاء النادي
                  </button>
                </div>
              </div>
              {showJoinButton && (
                <button
                  className={`w-full sm:w-auto px-8 py-3 rounded-full text-lg font-semibold transition duration-200 mt-4 sm:mt-0 ${
                    buttonDisabled || loadingJoin
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : buttonColorClass
                  }`}
                  onClick={buttonAction}
                  disabled={buttonDisabled || loadingJoin}
                >
                  {loadingJoin ? "جاري الإرسال..." : buttonLabel}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Club Members Modal */}
        {showMembersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 w-[95vw] max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-blue-700">
                  أعضاء النادي
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => setShowMembersModal(false)}
                >
                  ×
                </button>
              </div>
              {loadingMembers ? (
                <div className="text-center text-gray-600 py-8">
                  جاري تحميل الأعضاء...
                </div>
              ) : (
                <div>
                  <div className="mb-2 text-gray-600 text-sm">
                    {members.length} عضو
                  </div>
                  <div className="flex flex-col gap-3">
                    {members.map((member, idx) => {
                      const bgColors = [
                        "bg-blue-50",
                        "bg-red-50",
                        "bg-pink-50",
                        "bg-green-50",
                        "bg-yellow-50",
                        "bg-purple-50",
                        "bg-teal-50",
                      ];
                      const bgColor = bgColors[idx % bgColors.length];
                      const isArabic = /[\u0600-\u06FF]/.test(member.name);

                      return (
                        <div
                          key={member._id}
                          className={`flex items-center py-4 px-2 sm:px-4 rounded-xl shadow-sm ${bgColor} w-full`}
                          style={{ minWidth: 0 }}
                        >
                          <img
                            src={
                              member.profilePicture &&
                              member.profilePicture !== "default.jpg"
                                ? member.profilePicture
                                : "https://ui-avatars.com/api/?name=" +
                                  encodeURIComponent(member.name)
                            }
                            alt={member.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border ml-2 sm:ml-4"
                          />
                          <div className="flex flex-1 flex-col justify-center">
                            <div
                              className="flex flex-row justify-between items-center w-full"
                              style={{
                                direction: isArabic ? "rtl" : "ltr",
                              }}
                            >
                              <span
                                className="font-semibold text-gray-800 text-sm sm:text-base"
                                style={{
                                  textAlign: isArabic ? "right" : "left",
                                  direction: isArabic ? "rtl" : "ltr",
                                  width: "auto",
                                }}
                              >
                                {member.name}
                              </span>
                              <span
                                className="text-gray-500 text-xs"
                                style={{
                                  direction: "ltr",
                                  textAlign: "left",
                                  minWidth: "80px",
                                  maxWidth: "60%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginRight: isArabic ? "8px" : "0",
                                  marginLeft: isArabic ? "0" : "8px",
                                }}
                              >
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Club Posts & Events */}
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl flex flex-col gap-8 ">
          {/* Only show create and events section for users with permission */}
          {token && club && userInfo && canEditPost && (
            <div className="mb-6">
              {/* Choice between Post or Event */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                <button
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition ${
                    !showEventForm
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShowEventForm(false)}
                >
                  منشور جديد
                </button>
                <button
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition ${
                    showEventForm
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShowEventForm(true)}
                >
                  فعالية جديدة
                </button>
              </div>
              {/* Show form based on choice */}
              {!showEventForm ? (
                <CreatePost
                  clubId={club._id}
                  onPostCreated={handlePostCreated}
                  club={club}
                />
              ) : (
                <CreateEvent
                  clubId={club._id}
                  onEventCreated={handleEventCreated}
                  club={club}
                />
              )}
            </div>
          )}

          {/* Events List - ONLY show when showEventForm is true and user has permission */}
          {canEditPost && showEventForm && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700">
                فعاليات النادي
              </h3>
              {loadingEvents ? (
                <div className="max-w-4xl flex justify-center items-center text-lg text-gray-700">
                  <Loading />
                </div>
              ) : events.length === 0 ? (
                <div className="text-gray-500">
                  لا توجد فعاليات لهذا النادي.
                </div>
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    club={club}
                    token={token}
                    canEdit={canEditPost}
                    onEventUpdated={handleEventUpdated}
                    onEventDeleted={handleEventDeleted}
                  />
                ))
              )}
            </div>
          )}

          {/* Posts List - ONLY show when showEventForm is false */}
          {!showEventForm && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700">
                منشورات النادي
              </h3>
              {loadingPosts ? (
                <div className="max-w-4xl flex justify-center items-center text-lg text-gray-700">
                  <Loading />
                </div>
              ) : posts.length === 0 ? (
                <div className="w-full flex justify-center items-center text-gray-500">
                  لا توجد منشورات لهذا النادي.
                </div>
              ) : (
                posts.map((post) => (
                  <Post
                    key={post._id}
                    post={post}
                    club={club}
                    token={token}
                    canEdit={canEditPost}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-[95vw] text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-700">
              تم إرسال الطلب بنجاح
            </h2>
            <p className="mb-6 text-gray-700">بانتظار موافقة مسؤول النادي</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
              onClick={() => setShowModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {error && !loadingClub && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-[95vw] text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-700">حدث خطأ</h2>
            <p className="mb-6 text-gray-700">{error}</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
              onClick={() => setError("")}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetails;
