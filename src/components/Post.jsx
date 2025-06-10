import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper function to convert URLs in text to clickable links
function linkify(text) {
  const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

const Post = ({ post, token, canEdit, onPostUpdated, onPostDeleted }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [description, setDescription] = useState(post.content);
  const [images, setImages] = useState([]); // For new uploads
  const [imagePreviews, setImagePreviews] = useState(post.images || []); // For previewing existing and new images
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [likes, setLikes] = useState(Array.isArray(post.likes) ? post.likes.length : post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);

  // New for editing comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  // For menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // For comment menu
  const [showCommentMenuId, setShowCommentMenuId] = useState(null);
  const commentMenuRefs = useRef({});

  const navigate = useNavigate();

  // For API usage
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Initialize isLiked based on whether the user's ID is in the likes array
  useEffect(() => {
    if (userInfo?._id && Array.isArray(post.likes)) {
      const userHasLiked = post.likes.some(like => like.user?._id === userInfo._id);
      setIsLiked(userHasLiked);
    }
  }, [post.likes, userInfo?._id]);

  // Handle click outside menu to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      // For comment menus
      Object.entries(commentMenuRefs.current).forEach(([ref]) => {
        if (ref && !ref.contains(event.target)) {
          setShowCommentMenuId(null);
        }
      });
    }
    if (showMenu || showCommentMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showCommentMenuId]);

  // Handle image change for edit (multiple images, accumulate up to 5)
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

  // Remove a specific image preview (for new uploads or previews)
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Save edit
  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", description);

      // Append each image with the same key "images"
      images.forEach((img) => formData.append("images", img));

      // If user removed all images
      if (images.length === 0 && imagePreviews.length === 0) {
        formData.append("images", "");
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/${post._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setEditing(false);
      setLoading(false);
      setImages([]);
      setImagePreviews(res.data.data.images || []);
      setSuccessMsg("تم تعديل المنشور بنجاح");
      setTimeout(() => setSuccessMsg(""), 2000);
      if (onPostUpdated) onPostUpdated(res.data.data);
    } catch {
      setLoading(false);
      alert("حدث خطأ أثناء تعديل المنشور");
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${post._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      setShowDeleteModal(false);
      setSuccessMsg("تم حذف المنشور بنجاح");
      setTimeout(() => setSuccessMsg(""), 2000);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch {
      setLoading(false);
      alert("حدث خطأ أثناء حذف المنشور");
    }
  };

  // Like toggle (API)
  const handleLikeToggle = async () => {
    try {
      let authToken = token;
      if (!authToken) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        authToken = userInfo?.token;
      }
      if (!authToken) {
        alert("حدث خطأ في التحقق من المستخدم. يرجى إعادة تسجيل الدخول.");
        return;
      }

      const res = await axios.post(
        apiUrl + `/likes`,
        {
          targetType: "post",
          targetId: post._id,
          user: userInfo?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const updatedLikes = res.data.data.likes;
      setLikes(updatedLikes.length);
      const newIsLiked = updatedLikes.some(
        (like) => like.user && like.user._id === userInfo._id
      );
      setIsLiked(newIsLiked);
    } catch (err) {
      console.error('خطأ أثناء الإعجاب:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      let authToken = token;
      if (!authToken) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        authToken = userInfo?.token;
      }
      if (!authToken) {
        alert("حدث خطأ في التحقق من المستخدم. يرجى إعادة تسجيل الدخول.");
        return;
      }

      const res = await axios.post(
        `${apiUrl}/posts/${post._id}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const commentObj = res.data.data.comment;
      setComments([
        ...comments,
        {
          ...commentObj,
          author: {
            _id: userInfo._id,
            name: userInfo.name,
            profilePicture: userInfo.profilePicture,
            email: userInfo.email,
          },
        },
      ]);
      setNewComment('');
    } catch (err) {
      console.error('خطأ أثناء إضافة تعليق:', err);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const authToken = token || userInfo?.token;
      await axios.delete(
        `${apiUrl}/comments/${commentToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setComments(comments.filter(c => c._id !== commentToDelete._id));
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    } catch  {
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  // Edit comment logic
  const handleEditComment = async (commentId) => {
    try {
      const authToken = token || userInfo?.token;
      await axios.put(
        `${apiUrl}/comments/${commentId}`,
        { content: editingCommentContent },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setComments(comments.map(c =>
        c._id === commentId
          ? { ...c, content: editingCommentContent }
          : c
      ));
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch {
      // Optionally show a toast or error message here
    }
  };

  // Image scroll logic
  const handlePrevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? (post.images.length - 1) : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImage((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  // Comments logic: newest first, show/hide all
  const reversedComments = [...comments].reverse();
  const visibleComments =
    showAllComments || reversedComments.length <= 3
      ? reversedComments
      : reversedComments.slice(0, 3);

  // Helper: is content long?
  const isContentLong = post.content && post.content.length > 150;

  return (
    <div dir="rtl" className="bg-white rounded-xl shadow-lg p-4 mb-4 w-full mx-auto relative">
      {/* Three Dots Menu */}
      {canEdit && !editing && (
        <div className="absolute top-3 left-3 z-10" ref={menuRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowMenu((prev) => !prev)}
            type="button"
            aria-label="خيارات"
          >
            {/* Three dots icon */}
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="16" cy="10" r="2" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute left-0 mt-2 w-32 bg-gray-900 text-white border rounded-xl shadow-lg z-20 py-2">
              <button
                className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                onClick={() => {
                  setEditing(true);
                  setShowMenu(false);
                }}
                type="button"
              >
                تعديل
              </button>
              <button
                className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                onClick={() => {
                  setShowDeleteModal(true);
                  setShowMenu(false);
                }}
                type="button"
              >
                حذف
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-4 py-1 rounded shadow text-sm z-20">
          {successMsg}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">تأكيد حذف المنشور</h2>
            <p className="mb-6 text-gray-700">هل أنت متأكد أنك تريد حذف هذا المنشور؟</p>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold mx-2"
              onClick={handleDeletePost}
              disabled={loading}
            >
              حذف
            </button>
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold mx-2"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {editing ? (
        <form onSubmit={handleEdit} className="flex flex-col gap-2">
          <textarea
            className="border rounded-lg p-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
          {/* Image previews and controls */}
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
          <label className="flex items-center cursor-pointer text-green-400 font-semibold gap-1 mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={images.length + imagePreviews.length >= 5}
            />
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" />
              <path d="M8 17l2-2a2 2 0 0 1 2.83 0l2.17 2.17M8 13h.01M16 13h.01" stroke="#fff" strokeWidth="2" />
            </svg>
            أضف صور (حتى 5)
          </label>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded"
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
        </form>
      ) : (
        <>
          {/* Club Info */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img
                alt="Club Profile"
                className="w-10 h-10 rounded-full mr-2"
                src={post.club?.profilePicture || "https://u...content-available-to-author-only...s.com/api/?name=Club&background=random"}
              />
              <div className='pr-4'>
                <h3
                  className="text-base font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => navigate(`/clubs/${post.club?._id}`)}
                >
                  {post.club?.name || "نادي عام"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(post.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="mb-3">
            <p className={`text-sm text-gray-700 ${!isExpanded && isContentLong ? 'line-clamp-2' : ''}`}>
              {linkify(post.content)}
            </p>
            {isContentLong && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-sm font-medium mt-1">
                {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>
          {/* Images with scroll/slider */}
          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="mb-3 relative flex flex-col items-center">
              <div className="w-full flex justify-center items-center relative">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-blue-100 z-10"
                  style={{ display: post.images.length > 1 ? "block" : "none" }}
                  aria-label="الصورة السابقة"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <img
                  src={post.images[currentImage]}
                  alt={`صورة البوست ${currentImage + 1}`}
                  className="rounded-lg cursor-zoom-in"
                  style={{
                    width: "500px",
                    height: "350px",
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto"
                  }}
                  onClick={() => setShowImagePreview(true)}
                />
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-blue-100 z-10"
                  style={{ display: post.images.length > 1 ? "block" : "none" }}
                  aria-label="الصورة التالية"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              {/* Dots indicator */}
              {post.images.length > 1 && (
                <div className="flex gap-1 mt-2">
                  {post.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`inline-block w-2 h-2 rounded-full ${currentImage === idx ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
              {/* Fullscreen Image Preview */}
              {showImagePreview && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                  onClick={() => setShowImagePreview(false)}
                  style={{ cursor: "zoom-out" }}
                >
                  <img
                    src={post.images[currentImage]}
                    alt={`صورة البوست ${currentImage + 1}`}
                    className="rounded-lg shadow-lg"
                    style={{
                      maxWidth: "90vw",
                      maxHeight: "90vh",
                      objectFit: "contain",
                      background: "#fff"
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          )}
          {/* Like + Comment Count */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center text-blue-600 p-1 rounded-full transition duration-200 ${
                isLiked ? 'bg-red-100' : 'hover:bg-gray-100'
              }`}
            >
              <svg
                className={`w-5 h-5 mr-1 ${isLiked ? 'fill-red-500' : 'fill-none'} ml-1`}
                viewBox="0 0 24 24"
                xmlns="http://w...content-available-to-author-only...3.org/2000/svg"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09
                  3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0
                  3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              <span className="text-lg">{likes}</span>
            </button>

            <span className="text-blue-600 flex items-center text-lg">
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
    </svg> {comments.length}
            </span>
          </div>

          {/* Comment Section */}
          <div className="border-t pt-2">
            <form onSubmit={handleCommentSubmit} className="flex items-center mb-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                dir="rtl"
              />
              <button
                type="submit"
                className="mr-4 bg-blue-600 text-white px-3 py-1 rounded-lg h-10"
              >
                إرسال
              </button>
            </form>
            {/* Show/hide comments button */}
            {reversedComments.length > 3 && (
              <button
                className="text-blue-600 text-xs mb-2"
                onClick={() => setShowAllComments((prev) => !prev)}
                type="button"
              >
                {showAllComments ? "إخفاء التعليقات" : `عرض جميع التعليقات (${reversedComments.length})`}
              </button>
            )}
            {visibleComments.map((comment, index) => (
              <div key={comment._id || index} className="flex items-start mb-2">
                <div className="bg-gray-100 p-2 rounded-lg flex items-start w-full gap-2 relative">
                  <img
                    src={comment.author?.profilePicture || "https://u...content-available-to-author-only...s.com/api/?name=User&background=random"}
                    alt="User"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm">{comment.author?.name || "مستخدم"}</span>
                    {/* Edit mode for comment */}
                    {editingCommentId === comment._id ? (
                      <form
                        className="flex flex-col sm:flex-row items-center w-full gap-2 mt-1"
                        onSubmit={e => {
                          e.preventDefault();
                          handleEditComment(comment._id);
                        }}
                        style={{ alignItems: "flex-start" }}
                      >
                        <input
                          className="border-2 border-yellow-400 focus:border-blue-500 rounded px-2 py-1 text-sm flex-1 transition"
                          value={editingCommentContent}
                          onChange={e => setEditingCommentContent(e.target.value)}
                          autoFocus
                          style={{ minWidth: 0 }}
                        />
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button
                            type="submit"
                            className="flex items-center gap-1 text-green-600 font-bold px-3 py-1 rounded hover:bg-green-50 transition border border-green-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            حفظ
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-gray-500 px-3 py-1 rounded hover:bg-gray-100 transition border border-gray-200"
                            onClick={() => setEditingCommentId(null)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            إلغاء
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-700 break-words whitespace-pre-line max-w-full max-h-40 overflow-auto mt-1">
                        {comment.content}
                      </p>
                    )}
                  </div>
                  {/* Three Dots Menu for comment actions */}
                  {comment.author?._id === userInfo?._id && editingCommentId !== comment._id && (
                    <div
                      className="absolute left-2 top-2 z-10"
                      ref={el => (commentMenuRefs.current[comment._id] = el)}
                    >
                      <button
                        className="p-1 rounded-full hover:bg-gray-200"
                        onClick={() =>
                          setShowCommentMenuId(showCommentMenuId === comment._id ? null : comment._id)
                        }
                        type="button"
                        aria-label="خيارات التعليق"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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
                              setEditingCommentContent(comment.content);
                              setShowCommentMenuId(null);
                            }}
                            type="button"
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
            {/* Delete Comment Modal */}
            {showDeleteCommentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                  <h2 className="text-xl font-bold mb-4 text-red-700">تأكيد حذف التعليق</h2>
                  <p className="mb-6 text-gray-700">هل أنت متأكد أنك تريد حذف هذا التعليق؟</p>
                  <button
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold mx-2"
                    onClick={handleDeleteComment}
                  >
                    حذف
                  </button>
                  <button
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold mx-2"
                    onClick={() => setShowDeleteCommentModal(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Post;