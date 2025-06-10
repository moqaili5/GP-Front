import React, { useEffect, useState } from "react";
import axios from "axios";

const COLLEGES = [
  "كلية الدراسات العليا",
  "كلية الطب وعلوم الصحة",
  "كلية طب الأسنان",
  "كلية الهندسة والتكنولوجيا",
  "كلية تكنولوجيا المعلومات وهندسة الحاسوب",
  "كلية العلوم الإدارية ونظم المعلومات",
  "كلية التمريض",
  "كلية العلوم التطبيقية",
  "كلية العلوم الإنسانية والتربوية",
  "كلية الدراسات الثنائية",
  "كلية المهن التطبيقية",
  "مركز التميز والتعليم المستمر",
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [saving, setSaving] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  useEffect(() => {
    axios
      .get(`${apiUrl}/auth/me`)
      .then((res) => {
        setUser(res.data.data.user);
        setEditName(res.data.data.user.name);
        setEditCollege(res.data.data.user.college);
        setPreviewImage(res.data.data.user.profilePicture || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = () => setEditMode(true);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditName(user.name);
    setEditCollege(user.college);
    setEditImage(null);
    setPreviewImage(user.profilePicture || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("college", editCollege);
      if (editImage) {
        formData.append("profilePicture", editImage);
      }
      const res = await axios.put(`${apiUrl}/auth/updateMe`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = res.data?.data?.user || res.data?.user || user;

      setUser(updatedUser);
      const prevUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...prevUserInfo, ...updatedUser })
      );
      setEditMode(false);
      setEditImage(null);
      const newProfilePic = updatedUser?.profilePicture
        ? `${updatedUser.profilePicture}?t=${Date.now()}`
        : "";
      setPreviewImage(newProfilePic);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="text-2xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="text-2xl text-red-600">تعذر تحميل البيانات</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 md:py-12 w-full">
      <div
        className="flex flex-col-reverse md:flex-row w-full max-w-6xl bg-blue-50 rounded-xl shadow-lg overflow-hidden"
        style={{ minHeight: "600px" }}
      >
        {/* القسم الأيسر */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-between px-4 sm:px-8 md:px-16 py-8 md:py-20 bg-blue-50"
          dir="rtl"
        >
          <div>
            <div>
              <div className="text-base md:text-lg font-serif font-semibold text-gray-800 mb-2">
                أهلا
              </div>
              <div className="text-base md:text-lg font-serif font-semibold text-gray-800 mb-6 md:mb-10">
                {user.name}
              </div>
            </div>
            <div className="bg-blue-100 rounded-lg px-4 sm:px-6 md:px-10 py-6 md:py-8 mb-8 md:mb-10">
              <div className="flex mb-4 md:mb-6">
                <div className="w-28 md:w-32 text-gray-500 font-medium text-base md:text-lg">
                  البريد الإلكتروني
                </div>
                <div
                  className="text-gray-800 text-base md:text-lg break-all"
                  dir="ltr"
                >
                  {user.email}
                </div>
              </div>
              <div className="flex mb-4 md:mb-6">
                <div className="w-28 md:w-32 text-gray-500 font-medium text-base md:text-lg">
                  الكلية
                </div>
                {editMode ? (
                  <select
                    className="text-gray-800 text-base md:text-lg border rounded px-2 py-1"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                  >
                    <option value="">اختر الكلية</option>
                    {COLLEGES.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-800 text-base md:text-lg">
                    {user.college}
                  </div>
                )}
              </div>
              <div className="flex mb-4 md:mb-6">
                <div className="w-28 md:w-32 text-gray-500 font-medium text-base md:text-lg">
                  الاسم
                </div>
                {editMode ? (
                  <input
                    className="text-gray-800 text-base md:text-lg border rounded px-2 py-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <div className="text-gray-800 text-base md:text-lg">
                    {user.name}
                  </div>
                )}
              </div>
              <div className="flex">
                <div className="w-28 md:w-32 text-gray-500 font-medium text-base md:text-lg">
                  الحساب مفعل
                </div>
                <div className="text-gray-800 text-base md:text-lg">
                  {user.active ? "نعم" : "لا"}
                </div>
              </div>
            </div>
          </div>
          {editMode ? (
            <div className="flex gap-4 self-end mt-6 md:mt-8">
              <button
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-medium"
                onClick={handleCancel}
                disabled={saving}
              >
                إلغاء
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-medium"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          ) : (
            <button
              className="self-end text-[#e57373] font-medium hover:underline transition text-lg mt-6 md:mt-8"
              onClick={handleEdit}
            >
              تعديل الملف الشخصي <span className="ml-1">&#8592;</span>
            </button>
          )}
        </div>
        {/* القسم الأيمن */}
        <div className="w-full md:w-1/2 bg-blue-200 flex flex-col items-center justify-center py-10 md:py-20 px-4 sm:px-8 md:px-12 relative">
          <div className="w-40 h-40 md:w-64 md:h-64 rounded-lg overflow-hidden mb-6 md:mb-8 border-4 border-[#eaeaea] bg-gray-200 shadow relative">
            <img
              src={previewImage || "https://ui-avatars.com/api/?name=User"}
              alt="صورة الملف الشخصي"
              className="object-cover w-full h-full"
            />
            {editMode && (
              <label className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-3 py-1 rounded cursor-pointer text-sm font-medium shadow">
                تغيير الصورة
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <div className="text-base md:text-lg font-serif font-semibold text-gray-900 mb-1 md:mb-2">
            {user.name}
          </div>
          <div className="text-gray-700 text-base md:text-lg">
            {user.college}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;