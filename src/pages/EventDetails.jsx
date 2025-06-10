import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const getEventStatus = (eventDate) => {
  const now = new Date();
  const eventDay = new Date(eventDate);
  if (eventDay < now) return { label: "منتهي", color: "bg-red-100 text-red-700" };
  if (eventDay.toDateString() === now.toDateString())
    return { label: "اليوم", color: "bg-yellow-100 text-yellow-700" };
  return { label: "قادِم", color: "bg-green-100 text-green-700" };
};

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${apiUrl}/events/${id}`);
        setEvent(res.data.data);
      } catch (err) {
        console.error("حدث خطأ أثناء جلب بيانات الحدث:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, apiUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span>جاري التحميل...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center h-64">
        <span>لم يتم العثور على الحدث</span>
      </div>
    );
  }

  const status = getEventStatus(event.date);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-12 px-0 flex justify-center items-start" dir="rtl">
      <div className="w-full max-w-5xl mx-auto my-8">
        {/* Show all event images */}
        <div className="mb-8">
          {Array.isArray(event.images) && event.images.length > 0 ? (
            event.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`صورة الحدث ${idx + 1}`}
                className="w-full h-[400px] object-cover rounded-2xl shadow"
              />
            ))
          ) : (
            <img
              src="https://www.ppu.edu.p/sites/default/files/ppu-1714156162-118aabb4-40c7-4373-8f3a-127f4e52a705.jpeg"
              alt="صورة الحدث"
              className="w-full h-[400px] object-cover rounded-2xl shadow"
            />
          )}
        </div>
        <div className="flex flex-col gap-4 bg-white rounded-2xl shadow p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-green-700">
            <span className="font-semibold">النادي المنظم:</span>
            <span>{event.club?.name || "نادي"}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-gray-600 text-base mb-2">
            <span>
              <span className="font-semibold">التاريخ:</span>{" "}
              {new Date(event.date).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>
              <span className="font-semibold">الوقت:</span> 🕒 {event.startTime} - {event.endTime}
            </span>
            <span>
              <span className="font-semibold">المكان:</span> 📍 {event.location}
            </span>
          </div>
          <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-4">
            {event.description}
          </div>
          <div className="flex flex-wrap gap-4 items-center">
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;