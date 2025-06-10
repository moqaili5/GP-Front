import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateEvent = ({
  clubId,
  onEventCreated,
  onEventUpdated,
  club,
  eventToEdit,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  // Prefill fields if editing
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDescription(eventToEdit.description || "");
      setDate(eventToEdit.date ? eventToEdit.date.slice(0, 10) : "");
      setStartTime(eventToEdit.startTime || "");
      setEndTime(eventToEdit.endTime || "");
      setLocation(eventToEdit.location || "");
      setImagePreviews(eventToEdit.images || []);
      setImages([]);
    } else {
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setImagePreviews([]);
      setImages([]);
    }
  }, [eventToEdit]);

  // Handle multiple images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    const newPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ].slice(0, 5);
    setImagePreviews(newPreviews);
  };

  // Remove image by index
  const handleRemoveImage = (idx) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    // Remove from previews
    newPreviews.splice(idx, 1);
    // Remove from images only if it's a new file (not a string URL)
    if (idx >= imagePreviews.length - images.length) {
      newImages.splice(idx - (imagePreviews.length - images.length), 1);
    }
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !startTime || !endTime || !location) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("location", location);
    formData.append("club", clubId);

    images.forEach((img) => formData.append("images", img));
    // If editing, send existing images as URLs
    if (eventToEdit && imagePreviews.length > 0) {
      imagePreviews
        .filter((img) => typeof img === "string")
        .forEach((url) => formData.append("existingImages", url));
    }

    setLoading(true);
    try {
      let res;
      if (eventToEdit) {
        res = await axios.put(
          `${apiUrl}/events/${eventToEdit._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (onEventUpdated) onEventUpdated(res.data.data);
      } else {
        res = await axios.post(
          `${apiUrl}/events`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (onEventCreated) {
          const newEvent = res.data.data;
          if (club) newEvent.club = club;
          onEventCreated(newEvent);
        }
      }
      setTitle("");
      setDescription("");
      setImages([]);
      setImagePreviews([]);
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setLoading(false);
      if (onCancelEdit) onCancelEdit();
    } catch {
      setLoading(false);
      alert("حدث خطأ أثناء حفظ الفعالية");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col gap-4"
      dir="rtl"
    >
      <div className="flex flex-col gap-3 mb-2">
        <input
          type="text"
          className="bg-gray-100 rounded-lg p-2 text-lg"
          placeholder="عنوان الفعالية"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="bg-gray-100 rounded-lg p-2 text-lg"
          placeholder="وصف الفعالية"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
        <input
          type="date"
          className="bg-gray-100 rounded-lg p-2 text-lg"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <input
            type="time"
            className="bg-gray-100 rounded-lg p-2 text-lg flex-1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            placeholder="وقت البداية"
          />
          <input
            type="time"
            className="bg-gray-100 rounded-lg p-2 text-lg flex-1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            placeholder="وقت النهاية"
          />
        </div>
        <input
          type="text"
          className="bg-gray-100 rounded-lg p-2 text-lg"
          placeholder="مكان الفعالية"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between items-center px-2">
        <label className="flex items-center cursor-pointer text-green-400 font-semibold gap-1">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" />
            <path d="M8 17l2-2a2 2 0 0 1 2.83 0l2.17 2.17M8 13h.01M16 13h.01" stroke="#fff" strokeWidth="2" />
          </svg>
          صورة
        </label>
      </div>
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {imagePreviews.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                className="max-h-32 rounded-lg border border-gray-300"
              />
              <button
                type="button"
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => handleRemoveImage(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "جاري الحفظ..." : eventToEdit ? "حفظ التعديلات" : "إنشاء الفعالية"}
        </button>
        {eventToEdit && (
          <button
            type="button"
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={onCancelEdit}
            disabled={loading}
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateEvent;