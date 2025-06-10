import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const EventCard = ({
  event,
  token,
  canEdit,
  onEventUpdated,
  onEventDeleted,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [likes, setLikes] = useState(event?.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(event?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(event);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(event?.image || "");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentMenuId, setShowCommentMenuId] = useState(null);
  const commentMenuRefs = useRef({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  useEffect(() => {
    if (userInfo._id && Array.isArray(event?.likes)) {
      setIsLiked(event.likes.some((like) => like?.user?._id === userInfo._id));
    }
  }, [event?.likes, userInfo._id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showCommentMenuId &&
        commentMenuRefs.current[showCommentMenuId] &&
        !commentMenuRefs.current[showCommentMenuId].contains(e.target)
      ) {
        setShowCommentMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCommentMenuId]);

  const handleLikeToggle = async () => {
    if (!userInfo._id) {
      alert("يرجى تسجيل الدخول لتتمكن من الإعجاب بالفعالية.");
      return;
    }
    try {
      setLoading(true);
      const authToken = token || userInfo.token;
      if (!authToken) throw new Error("Authentication token missing");

      const res = await axios.post(
        `${apiUrl}/likes`,
        {
          targetType: "event",
          targetId: event._id,
          user: userInfo._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setLikes(res.data.data.likes?.length || 0);
      setIsLiked(
        res.data.data.likes.some((like) => like?.user?._id === userInfo._id)
      );
    } catch (err) {
      console.error("خطأ أثناء الإعجاب:", err);
      alert("فشل في تحديث الإعجاب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!userInfo._id) {
      alert("يرجى تسجيل الدخول لتتمكن من إضافة تعليق.");
      return;
    }
    try {
      setLoading(true);
      const authToken = token || userInfo.token;
      if (!authToken) throw new Error("Authentication token missing");

      const res = await axios.post(
        `${apiUrl}/events/${event._id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const commentObj = res.data.data.comment;
      setComments([
        ...comments,
        {
          ...commentObj,
          author: {
            _id: userInfo._id,
            name: userInfo.name || "مستخدم",
            profilePicture: userInfo.profilePicture,
            email: userInfo.email,
          },
        },
      ]);
      setNewComment("");
    } catch (err) {
      console.error("خطأ أثناء إضافة تعليق:", err);
      alert("فشل في إضافة التعليق. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      setLoading(true);
      const authToken = token || userInfo.token;
      if (!authToken) throw new Error("Authentication token missing");

      await axios.delete(`${apiUrl}/comments/${commentToDelete._id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setComments(comments.filter((c) => c._id !== commentToDelete._id));
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error("خطأ أثناء حذف التعليق:", err);
      alert("فشل في حذف التعليق. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    try {
      setLoading(true);
      const authToken = token || userInfo.token;
      if (!authToken) throw new Error("Authentication token missing");

      const res = await axios.put(
        `${apiUrl}/comments/${commentId}`,
        { content: editingCommentContent },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, content: res.data.data.content } : c
        )
      );
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch (err) {
      console.error("خطأ أثناء تعديل التعليق:", err);
      alert("فشل في تعديل التعليق. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", editData.title || "");
      formData.append("description", editData.description || "");
      formData.append("date", editData.date || "");
      formData.append("startTime", editData.startTime || "");
      formData.append("endTime", editData.endTime || "");
      formData.append("location", editData.location || "");
      if (image) formData.append("image", image);

      const res = await axios.put(`${apiUrl}/events/${event._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setEditing(false);
      setEditData(res.data.data);
      setImagePreview(res.data.data.image || "");
      setImage(null);
      if (onEventUpdated) onEventUpdated(res.data.data);
    } catch (err) {
      console.error("خطأ أثناء تعديل الفعالية:", err);
      alert("فشل في تعديل الفعالية. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/events/${event._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModal(false);
      if (onEventDeleted) onEventDeleted(event._id);
    } catch (err) {
      console.error("خطأ أثناء حذف الفعالية:", err);
      alert("فشل في حذف الفعالية. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const visibleComments = showAllComments
    ? [...comments].reverse()
    : [...comments].reverse().slice(0, 3);

  console.log("Visible Comments:", visibleComments);

  return (
    <div
      className="bg-white rounded-3xl shadow-md overflow-hidden w-[90%] max-w-[4xl] mx-auto my-8"
      dir="rtl"
    >
      <div className="relative">
        <img
          src={
            imagePreview ||
            "https://www.ppu.edu.p/sites/default/files/ppu-1714156162-118aabb4-40c7-4373-8f3a-127f4e52a705.jpeg"
          }
          alt="Cover Photo"
          className="w-full h-[260px] sm:h-[320px] object-cover"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex-1 text-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            <Link to={`/events/${event._id}`} className="hover:underline">
              {event.title || "غير متوفر"}
            </Link>
            <span className="text-lg text-gray-700 font-medium">
              {" "}
              (
              {event.date
                ? new Date(event.date).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "غير متوفر"}
              )
            </span>
          </h2>
          <div className="text-base text-gray-600 mb-1">
            <span className="mr-2">
              🕒 {event.startTime || "غير متوفر"} -{" "}
              {event.endTime || "غير متوفر"}
            </span>
            <span className="mr-2">|</span>
            <span>📍 {event.location || "غير متوفر"}</span>
          </div>
          <div className="text-base text-gray-700">
            بواسطة{" "}
            <span className="text-green-600 font-semibold">
              {event.club?.name || "نادي غير معروف"}
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              className="text-blue-600 hover:bg-blue-100 rounded-full p-2 transition"
              title="تعديل"
              onClick={() => setEditing(true)}
              type="button"
              disabled={loading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 1 1 2.828 2.828L11.828 15.828a2 2 0 0 1-2.828 0L5 12.828a2 2 0 0 1 0-2.828L9 13z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="text-red-600 hover:bg-red-100 rounded-full p-2 transition"
              title="حذف"
              onClick={() => setDeleteModal(true)}
              type="button"
              disabled={loading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
        <div className="flex-1 text-right">
          <div className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
            {showMore
              ? event.description || "غير متوفر"
              : (event.description || "غير متوفر")
                  .split("\n")
                  .slice(0, 2)
                  .join("\n")}
            {!showMore && (event.description || "").split("\n").length > 2 && (
              <span>
                ...{" "}
                <button
                  onClick={() => setShowMore(true)}
                  className="text-blue-600 underline hover:text-blue-800"
                  type="button"
                >
                  عرض المزيد
                </button>
              </span>
            )}
            {showMore && (
              <button
                onClick={() => setShowMore(false)}
                className="text-blue-600 underline hover:text-blue-800 ml-2"
                type="button"
              >
                عرض أقل
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center px-6 pb-2">
        <button
          onClick={handleLikeToggle}
          className={`flex items-center text-blue-600 p-1 rounded-full transition duration-200 ${
            isLiked ? "bg-red-100" : "hover:bg-gray-100"
          }`}
          disabled={loading}
        >
          <svg
            className={`w-5 h-5 mr-1 ${isLiked ? "fill-red-500" : "fill-none"}`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          <span className="text-sm">{likes}</span>
        </button>
        <span className="flex items-center text-blue-600 text-sm">
          <svg
            className="w-6 h-6 ml-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          {comments.length}
        </span>
      </div>
      <div className="border-t pt-2 px-6 pb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="أضف تعليقاً..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            dir="rtl"
            disabled={loading}
          />
          <button
            onClick={handleCommentSubmit}
            className="mr-4 bg-blue-600 text-white px-3 py-1 rounded-lg h-10"
            disabled={loading}
          >
            إرسال
          </button>
        </div>
        {comments.length > 3 && (
          <button
            className="text-blue-600 text-xs mb-2"
            onClick={() => setShowAllComments((prev) => !prev)}
            type="button"
            disabled={loading}
          >
            {showAllComments
              ? "إخفاء التعليقات"
              : `عرض جميع التعليقات (${comments.length})`}
          </button>
        )}
        {visibleComments.map((comment, index) => (
          <div key={comment._id || index} className="flex items-start mb-2">
            <div className="bg-gray-100 p-2 rounded-lg flex items-start w-full gap-2 relative">
              <img
                src={
                  comment.author?.profilePicture ||
                  "https://ui-avatars.com/api/?name=User&background=random"
                }
                alt={`${comment.author?.name || "User"}'s profile`}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-sm">
                  {comment.author?.name || "مستخدم"}
                </span>
                {editingCommentId === comment._id ? (
                  <div className="flex flex-col sm:flex-row items-start w-full gap-2 mt-1">
                    <input
                      className="border-2 border-yellow-400 focus:border-blue-500 rounded px-2 py-1 text-sm flex-1 transition"
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-green-600 font-bold px-3 py-1 rounded hover:bg-green-50 transition border border-green-200"
                        onClick={() => handleEditComment(comment._id)}
                        disabled={loading}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        حفظ
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-gray-500 px-3 py-1 rounded hover:bg-gray-100 transition border border-gray-200"
                        onClick={() => setEditingCommentId(null)}
                        disabled={loading}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 break-words whitespace-pre-line max-w-full max-h-40 overflow-auto mt-1">
                    {comment.content || "غير متوفر"}
                  </p>
                )}
              </div>
              {comment.author?._id === userInfo._id &&
                editingCommentId !== comment._id && (
                  <div
                    className="absolute left-2 top-2 z-10"
                    ref={(el) => (commentMenuRefs.current[comment._id] = el)}
                  >
                    <button
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={() =>
                        setShowCommentMenuId(
                          showCommentMenuId === comment._id ? null : comment._id
                        )
                      }
                      type="button"
                      aria-label="خيارات التعليق"
                      disabled={loading}
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="4" cy="10" r="2" />
                        <circle cx="10" cy="10" r="2" />
                        <circle cx="16" cy="10" r="2" />
                      </svg>
                    </button>
                    {showCommentMenuId === comment._id && (
                      <div className="absolute left-0 mt-2 w-28 bg-gray-900 text-white border rounded-xl shadow-lg z-20 py-2">
                        <button
                          className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingCommentContent(comment.content || "");
                            setShowCommentMenuId(null);
                          }}
                          type="button"
                          disabled={loading}
                        >
                          تعديل
                        </button>
                        <button
                          className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                          onClick={() => {
                            setCommentToDelete(comment);
                            setShowDeleteCommentModal(true);
                            setShowCommentMenuId(null);
                          }}
                          type="button"
                          disabled={loading}
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
        {showDeleteCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-red-700">
                تأكيد حذف التعليق
              </h2>
              <p className="mb-6 text-gray-700">
                هل أنت متأكد أنك تريد حذف هذا التعليق؟
              </p>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold mx-2"
                onClick={handleDeleteComment}
                disabled={loading}
              >
                حذف
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold mx-2"
                onClick={() => setShowDeleteCommentModal(false)}
                disabled={loading}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">
              تأكيد حذف الفعالية
            </h2>
            <p className="mb-6 text-gray-700">
              هل أنت متأكد أنك تريد حذف هذه الفعالية؟
            </p>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold mx-2"
              onClick={handleDelete}
              disabled={loading}
            >
              حذف
            </button>
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold mx-2"
              onClick={() => setDeleteModal(false)}
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
      {editing && (
        <div
          className="bg-white rounded-3xl shadow-md overflow-hidden w-[90%] max-w-[4xl] mx-auto my-8 p-6"
          dir="rtl"
        >
          <input
            type="text"
            className="bg-gray-100 rounded-lg p-2 text-lg mb-2 w-full"
            placeholder="عنوان الفعالية"
            value={editData.title || ""}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            required
            disabled={loading}
          />
          <textarea
            className="bg-gray-100 rounded-lg p-2 text-lg mb-2 w-full"
            placeholder="وصف الفعالية"
            value={editData.description || ""}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            rows={3}
            required
            disabled={loading}
          />
          <input
            type="date"
            className="bg-gray-100 rounded-lg p-2 text-lg mb-2 w-full"
            value={editData.date || ""}
            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
            required
            disabled={loading}
          />
          <div className="flex gap-2 mb-2">
            <input
              type="time"
              className="bg-gray-100 rounded-lg p-2 text-lg flex-1"
              value={editData.startTime || ""}
              onChange={(e) =>
                setEditData({ ...editData, startTime: e.target.value })
              }
              required
              placeholder="وقت البداية"
              disabled={loading}
            />
            <input
              type="time"
              className="bg-gray-100 rounded-lg p-2 text-lg flex-1"
              value={editData.endTime || ""}
              onChange={(e) =>
                setEditData({ ...editData, endTime: e.target.value })
              }
              required
              placeholder="وقت النهاية"
              disabled={loading}
            />
          </div>
          <input
            type="text"
            className="bg-gray-100 rounded-lg p-2 text-lg mb-2 w-full"
            placeholder="مكان الفعالية"
            value={editData.location || ""}
            onChange={(e) =>
              setEditData({ ...editData, location: e.target.value })
            }
            required
            disabled={loading}
          />
          {imagePreview && (
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-32 rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={handleRemoveImage}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <label className="flex items-center cursor-pointer text-green-400 font-semibold gap-1 mt-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading || !!imagePreview}
            />
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" />
              <path
                d="M8 17l2-2a2 2 0 0 1 2.83 0l2.17 2.17M8 13h.01M16 13h.01"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
            اضف
          </label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-1 rounded"
              onClick={handleEditSubmit}
              disabled={loading}
            >
              حفظ
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-1 rounded"
              onClick={() => setEditing(false)}
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
