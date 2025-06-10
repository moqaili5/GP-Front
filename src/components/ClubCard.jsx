import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ClubCard = ({ club, hideJoinButton }) => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [joinStatus, setJoinStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchMyRequests = async () => {
      try {
        const res = await axios.get(`${apiUrl}/clubs/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requests = res.data.data || res.data.requests || [];
        const req = requests.find(
          (r) =>
            ((r.club?._id || r.club) === club._id) &&
            ((r.student?._id || r.student) === userInfo._id)
        );
        if (req) {
          setJoinStatus(req.status);
        } else {
          setJoinStatus(null);
        }
      } catch {
        setJoinStatus(null);
      }
    };
    fetchMyRequests();
  }, [club._id, token, apiUrl, userInfo?._id]);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${apiUrl}/registrations`,
        { club: club._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinStatus("pending");
    } catch {
      // handle error
    }
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/registrations/${club._id}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoinStatus(null);
    } catch {
      // handle error
    }
    setLoading(false);
  };

  let buttonLabel = "طلب انضمام";
  let buttonDisabled = false;
  let buttonAction = handleJoin;
  let buttonColorClass = "bg-blue-600 text-white hover:bg-blue-700";

  if (joinStatus === "pending") {
    buttonLabel = "بانتظار الموافقة";
    buttonDisabled = true;
  } else if (joinStatus === "approved") {
    buttonLabel = "إلغاء الانضمام";
    buttonDisabled = false;
    buttonAction = handleLeave;
    buttonColorClass = "bg-red-600 text-white hover:bg-red-700";
  } else if (joinStatus === "rejected") {
    buttonLabel = "مرفوض";
    buttonDisabled = true;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <img
        src={
          club.coverPicture ||
          "https://www.ppu.edu.p/sites/default/files/ppu-1714156162-118aabb4-40c7-4373-8f3a-127f4e52a705.jpeg"
        }
        alt="صورة النادي"
        className="w-full h-40 object-cover rounded-xl mb-2"
      />
      <div className="flex items-center gap-3">
        <img
          src={
            club.profilePicture ||
            "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg"
          }
          alt="شعار النادي"
          className="w-14 h-14 rounded-lg border-2 border-white object-cover shadow"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-800">{club.name}</h3>
          <div className="text-gray-500 text-sm">{club.college}</div>
        </div>
      </div>
      <div className="text-gray-700 text-base line-clamp-3">{club.description}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-500 text-sm">عدد الأعضاء: {club.members?.length || 0}</span>
        <button
          className="text-blue-600 hover:underline font-semibold"
          onClick={() => navigate(`/clubs/${club._id}`)}
        >
          تفاصيل النادي
        </button>
      </div>
      {/* Only show join button if not hidden */}
      {!hideJoinButton && token && userInfo && (
        <button
          className={`mt-2 px-4 py-2 rounded-lg font-semibold transition ${buttonColorClass} ${buttonDisabled || loading ? "cursor-not-allowed opacity-60" : ""}`}
          onClick={buttonAction}
          disabled={buttonDisabled || loading}
        >
          {loading ? "جاري الإرسال..." : buttonLabel}
        </button>
      )}
    </div>
  );
};

export default ClubCard;