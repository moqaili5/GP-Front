import React, { useEffect, useState } from "react";
import LeaderBoard from "../components/LeaderBoard";
import CreateLeaderBoard from "../components/CreateLeaderBoard";
import axios from "axios";
import Loading from "../components/loading/loading";

const LeaderBoardPage = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeaderboard, setEditingLeaderboard] = useState(null);
  const [events, setEvents] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || "";
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    userInfo = null;
  }
  const token = userInfo?.token;

  // Fetch leaderboards
  const fetchLeaderboards = () => {
    if (!apiUrl || !token) {
      setError("المستخدم غير مسجل الدخول أو هناك مشكلة في الاتصال.");
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${apiUrl}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLeaderboards(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب بيانات لوحة النتائج.");
        setLoading(false);
      });
  };

  // Fetch events
  useEffect(() => {
    if (!apiUrl || !token) return;
    axios
      .get("https://graduation-6d1n.onrender.com/api/v1/events", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvents(res.data.data || []))
      .catch(() => setEvents([]));
  }, [apiUrl, token]);

  useEffect(() => {
    fetchLeaderboards();
    // eslint-disable-next-line
  }, [apiUrl, token]);

  // Robust fetchUserById: always returns full user object
  const fetchUserById = async (user) => {
    if (!user) return null;
    // If it's an object but missing name/email/profilePicture, fetch from backend
    if (typeof user === "object") {
      if (user._id && (!user.name || !user.email || !user.profilePicture)) {
        // Fetch by ID
        try {
          const res = await axios.get(`${apiUrl}/users/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.data.data;
        } catch {
          return null;
        }
      }
      if (user.email && user.name && user.profilePicture) return user;
      if (user.email) {
        // Fetch by email
        try {
          const res = await axios.get(`${apiUrl}/users?search=${user.email}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.data.data && res.data.data.length > 0
            ? res.data.data[0]
            : null;
        } catch {
          return null;
        }
      }
    }
    // If it's an email (contains @), search by email
    if (typeof user === "string" && user.includes("@")) {
      try {
        const res = await axios.get(`${apiUrl}/users?search=${user}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.data && res.data.data.length > 0
          ? res.data.data[0]
          : null;
      } catch {
        return null;
      }
    }
    // Otherwise, treat as user ID
    try {
      const res = await axios.get(`${apiUrl}/users/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch {
      return null;
    }
  };

  const handleCreate = () => {
    setEditingLeaderboard(null);
    setModalOpen(true);
  };
  const handleEdit = (lb) => {
    setEditingLeaderboard(lb);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingLeaderboard(null);
  };

  const handleSubmit = async (lb) => {
    // Always fetch full user objects for top1/top2/top3 (works for both create and edit)
     await Promise.all([
      fetchUserById(lb.top1),
      fetchUserById(lb.top2),
      fetchUserById(lb.top3),
    ]);
    setModalOpen(false);
    setEditingLeaderboard(null);
    fetchLeaderboards();
  };

  const handleDelete = async (id) => {
    // Custom confirm dialog instead of window.confirm
    const confirmed = await new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";
      modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full text-center">
        <div class="mb-4 text-lg font-bold text-red-600">تأكيد الحذف</div>
        <div class="mb-6 text-gray-700">هل أنت متأكد أنك تريد حذف لوحة النتائج؟</div>
        <div class="flex justify-center gap-4">
          <button id="confirmDelete" class="bg-red-500 text-white px-4 py-2 rounded font-bold">حذف</button>
          <button id="cancelDelete" class="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold">إلغاء</button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);
      modal.querySelector("#confirmDelete").onclick = () => {
        resolve(true);
        document.body.removeChild(modal);
      };
      modal.querySelector("#cancelDelete").onclick = () => {
        resolve(false);
        document.body.removeChild(modal);
      };
    });

    if (confirmed) {
      try {
        await axios.delete(`${apiUrl}/leaderboard/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaderboards((prev) => prev.filter((l) => l._id !== id));
      } catch {
        alert("حدث خطأ أثناء الحذف.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="h-10 sm:h-20"></div>
      <div className="flex flex-col items-center justify-center w-[90%] mx-auto mt-10">
        {/* Only show create button if user is logged in */}
        {userInfo &&
          (userInfo.role === "club_responsible" ||
            userInfo.role === "system_responsible") && (
            <button
              className="mb-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-6 rounded-xl font-bold shadow-md hover:from-blue-700 hover:to-blue-500 transition text-lg tracking-wide"
              onClick={handleCreate}
            >
              إنشاء لوحة النتائج
            </button>
        )}
        {modalOpen && (
          <CreateLeaderBoard
            open={modalOpen}
            onClose={handleModalClose}
            onSubmit={handleSubmit}
            leaderboardToEdit={editingLeaderboard}
          />
        )}
        {loading && (
          <div className="w-full flex justify-center items-center min-h-[40vh] text-center text-lg text-gray-700">
            <Loading />
          </div>
        )}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading &&
          !error &&
          Array.isArray(leaderboards) &&
          leaderboards.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              لا توجد بيانات لوحة النتائج.
            </div>
          )}
        {!loading &&
          !error &&
          Array.isArray(leaderboards) &&
          leaderboards.map((lb) => {
            // Allow edit/delete for the creator or system_responsible
            const isCreator =
              lb.author === userInfo?._id ||
              userInfo?.role === "system_responsible";
            return (
              <LeaderBoard
                key={lb._id}
                data={{
                  ...lb,
                  eventTitle:
                    events.find((ev) => ev._id === (lb.event?._id || lb.event))
                      ?.title || "",
                }}
                canEdit={isCreator}
                onEdit={() => handleEdit(lb)}
                onDelete={() => handleDelete(lb._id)}
              />
            );
          })}
      </div>
    </div>
  );
};

export default LeaderBoardPage;