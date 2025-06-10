import React, { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import EventCard from "../components/EventCard";
import axios from "axios";
import Loading from "../components/loading/loading";
import CreateEvent from "../components/CreateEvent";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(apiUrl + "/events")
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب الأحداث.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <Navbar />
      <div className="h-10 sm:h-20"></div>
      <div className="w-full flex flex-col items-center">
        {loading && (
          <div className="w-full flex justify-center items-center min-h-[60vh] text-center text-lg text-gray-700">
            <Loading />
          </div>
        )}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && events.length === 0 && (
          <div className="text-center text-gray-500">
            لا توجد أحداث متاحة حالياً.
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 gap-8 w-full max-w-6xl px-2">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;