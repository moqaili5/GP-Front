import React, { useState, useEffect } from "react";
import axios from "axios";

const initialTop = { name: "", profilePicture: "", email: "", userId: "" };

function UserSearchInput({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  useEffect(() => {
    if (query.length < 3 && !query.includes("@")) {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/users?search=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filtered = (res.data.data || []).filter(user =>
          user.email && user.email.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch {
        setResults([]);
      }
    };
    fetchUsers();
  }, [query]);

  return (
    <div className="relative">
      <input
        type="email"
        className="w-full border border-blue-200 rounded p-1 text-xs"
        value={value.email}
        onChange={e => {
          setQuery(e.target.value);
          onChange({ ...value, email: e.target.value, name: "", profilePicture: "", userId: "" });
          setShowDropdown(true);
        }}
        placeholder="ابحث عن الطالب بالبريد الإلكتروني"
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-10 bg-white border border-gray-200 rounded w-full max-h-32 overflow-y-auto">
          {results.length > 0 ? (
            results.map(user => (
              <div
                key={user._id}
                className="p-2 hover:bg-blue-100 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  onChange({
                    ...value,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    email: user.email,
                    userId: user._id
                  });
                  setQuery(user.email);
                  setShowDropdown(false);
                }}
              >
                <img src={user.profilePicture} alt={user.name} className="w-6 h-6 rounded-full" />
                <span>{user.email}</span>
                <span className="text-xs text-gray-500">{user.name}</span>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400 text-xs">لا يوجد نتائج</div>
          )}
        </div>
      )}
    </div>
  );
}

const CreateLeaderBoard = ({
  open,
  onClose,
  onSubmit,
  leaderboardToEdit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [top1, setTop1] = useState(initialTop);
  const [top2, setTop2] = useState(initialTop);
  const [top3, setTop3] = useState(initialTop);
  const [event, setEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  // Get the event title by event id
  const getEventTitle = (eventId) => {
    const found = events.find(ev => ev._id === eventId);
    return found ? found.title : "";
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "https://graduation-6d1n.onrender.com/api/v1/events",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(res.data.data || []);
      } catch {
        setEvents([]);
      }
    };
    if (open) fetchEvents();
  }, [open, token]);

  // Helper to fetch user info by ID (for after save)
  const fetchUserById = async (userId) => {
    try {
      const res = await axios.get(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data.data;
      return {
        name: user.name,
        profilePicture: user.profilePicture,
        email: user.email,
        userId: user._id
      };
    } catch {
      return initialTop;
    }
  };

  useEffect(() => {
    if (leaderboardToEdit) {
      const fetchUser = async (userObjOrId) => {
        if (!userObjOrId) return initialTop;
        if (userObjOrId.email) {
          return {
            name: userObjOrId.name,
            profilePicture: userObjOrId.profilePicture,
            email: userObjOrId.email,
            userId: userObjOrId._id || userObjOrId.userId,
          };
        }
        const userId = userObjOrId._id || userObjOrId;
        return await fetchUserById(userId);
      };
      (async () => {
        setName(leaderboardToEdit.name || "");
        setDescription(leaderboardToEdit.description || "");
        setEvent(
          typeof leaderboardToEdit.event === "string"
            ? leaderboardToEdit.event
            : leaderboardToEdit.event?._id || ""
        );
        setTop1(await fetchUser(leaderboardToEdit.top1));
        setTop2(await fetchUser(leaderboardToEdit.top2));
        setTop3(await fetchUser(leaderboardToEdit.top3));
      })();
    } else {
      setName("");
      setDescription("");
      setTop1(initialTop);
      setTop2(initialTop);
      setTop3(initialTop);
      setEvent("");
    }
    // eslint-disable-next-line
  }, [leaderboardToEdit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (
      !name.trim() || !description.trim() ||
      !top1.email ||
      !top2.email ||
      !top3.email ||
      !event
    ) {
      setError("يرجى ملء جميع الحقول واختيار الطلاب من البحث بالبريد الإلكتروني واختيار المناسبة.");
      setLoading(false);
      return;
    }

    let payload;
    if (leaderboardToEdit) {
      payload = {
        name,
        description,
        top1: top1.userId,
        top2: top2.userId,
        top3: top3.userId,
        event,
      };
    } else {
      payload = {
        name,
        description,
        top1: top1.email,
        top2: top2.email,
        top3: top3.email,
        event,
      };
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;
      if (leaderboardToEdit) {
        response = await axios.put(`${apiUrl}/leaderboard/${leaderboardToEdit._id}`, payload, config);
      } else {
        response = await axios.post(`${apiUrl}/leaderboard`, payload, config);
      }

      // Always fetch full user info for top1/top2/top3 after save
      let data = response.data.data;
      data = {
        ...data,
        top1: await fetchUserById(data.top1),
        top2: await fetchUserById(data.top2),
        top3: await fetchUserById(data.top3),
      };
      onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء الحفظ.");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-16 sm:mt-0">
      <div className="max-w-md w-[98%] sm:w-[95%] bg-white rounded-xl shadow-xl p-2 sm:p-3 mx-1 sm:mx-2">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Show the event title if an event is selected */}
          {event && (
            <div className="text-center text-blue-700 font-bold text-base sm:text-lg mb-2">
              {getEventTitle(event)}
            </div>
          )}
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-center text-blue-700">
            {leaderboardToEdit ? "تعديل لوحة النتائج" : "إنشاء لوحة النتائج"}
          </h2>
          {error && <div className="text-center text-red-500 mb-2 text-xs sm:text-sm">{error}</div>}
          <div>
            <label className="block mb-1 font-semibold text-blue-800 text-xs sm:text-sm">عنوان المسابقة</label>
            <input type="text" className="w-full border border-blue-200 rounded p-2 text-xs sm:text-sm"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-800 text-xs sm:text-sm">الوصف</label>
            <textarea className="w-full border border-blue-200 rounded p-2 text-xs sm:text-sm"
              value={description} onChange={e => setDescription(e.target.value)} required rows={2} />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-800 text-xs sm:text-sm">المناسبة</label>
            <select
              className="w-full border border-blue-200 rounded p-2 text-xs sm:text-sm"
              value={event}
              onChange={e => setEvent(e.target.value)}
              required
            >
              <option value="">اختر المناسبة</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>
          <div>
            <hr className="my-2 border-blue-100" />
            <label className="block mb-2 font-semibold text-blue-800 text-xs sm:text-base">أفضل 3 طلاب</label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {[{ state: top1, setState: setTop1, place: 1 }, { state: top2, setState: setTop2, place: 2 }, { state: top3, setState: setTop3, place: 3 }].map(({ state, setState, place }, idx) => (
                <div key={idx} className="bg-blue-50 p-2 rounded-lg shadow border border-blue-100">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-blue-700">البريد الإلكتروني</label>
                    <UserSearchInput value={state} onChange={setState} />
                  </div>
                  <div className="flex justify-center mt-1">
                    {state.profilePicture && (
                      <img src={state.profilePicture} alt="student"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow" />
                    )}
                  </div>
                  <div className="text-center text-[10px] text-blue-500 mt-1 font-bold">المركز {place}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded font-bold text-xs sm:text-sm" disabled={loading}>حفظ</button>
            <button type="button" className="w-full bg-gray-400 text-white py-2 rounded font-bold text-xs sm:text-sm" onClick={onClose} disabled={loading}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeaderBoard;