import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EventList = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${apiUrl}/events`)
      .then((res) => {
        setEvents(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب الفعاليات.");
        setLoading(false);
      });
  }, [apiUrl]);

  const handleEventClick = (id) => setSelectedEventId(id);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full">
      <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4 text-right">
        الفعاليات القادمة
      </h2>
      {loading && (
        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}
      {!loading && !error && (
        <div className="space-y-3 sm:space-y-4">
          {events.slice(0, 5).map((event) => (
            <div
              key={event._id}
              onClick={() => handleEventClick(event._id)}
              className={`flex flex-row items-center justify-between p-3 sm:p-4 rounded-lg cursor-pointer transition duration-200 gap-4 ${
                selectedEventId === event._id ? "bg-blue-100" : "bg-gray-50"
              }`}
            >
              {/* Event Image */}
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-20 h-16 object-cover rounded-md"
                />
              )}
              {/* Event Info */}
              <div className="flex-1 text-right">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  {event.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">{event.location}</p>
              </div>
              {/* Details Button */}
              <button
                className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition duration-200 w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event._id}`);
                }}
              >
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;