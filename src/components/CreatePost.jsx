import React, { useState } from "react";
import axios from "axios";

const CreatePost = ({ clubId, onPostCreated, club }) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // changed from image to images (array)
  const [imagePreviews, setImagePreviews] = useState([]); // array for previews
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  // Handle multiple images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    const newPreviews = [
      ...imagePreviews,
      ...files.map(file => URL.createObjectURL(file)),
    ].slice(0, 5);
    setImagePreviews(newPreviews);
  };

  // Remove image by index
  const handleRemoveImage = (idx) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return;

    const formData = new FormData();
    formData.append("content", description);
    formData.append("club", clubId);
    images.forEach((img) => formData.append("images", img)); // append all images

    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setDescription("");
      setImages([]);
      setImagePreviews([]);
      setLoading(false);
      // Attach full club object to the new post so the name shows instantly
      if (onPostCreated) {
        const newPost = res.data.data;
        if (club) newPost.club = club;
        onPostCreated(newPost);
      }
    } catch {
      setLoading(false);
      alert("حدث خطأ أثناء إنشاء المنشور");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col gap-4"
      dir="rtl"
    >
      <div className="flex items-center gap-3 mb-2">
        <img
          src={userInfo?.profilePicture || "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg"}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-400"
        />
        <input
          type="text"
          className="flex-1 bg-transparent placeholder-gray-400 border-none outline-none text-lg"
          placeholder="اكتب منشورك هنا..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <hr className="border-gray-600 mb-2" />
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
          صورة/فيديو
        </label>
      </div>
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {imagePreviews.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img}
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
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold mt-3"
        disabled={loading}
      >
        {loading ? "جاري النشر..." : "نشر"}
      </button>
    </form>
  );
};

export default CreatePost;