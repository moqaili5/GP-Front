import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
  const apiUrl = import.meta.env.VITE_API_URL;
const colleges = [
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

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "الاسم مطلوب";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "البريد الالكتروني مطلوب";
      valid = false;
    }

    if (!formData.college) {
      newErrors.college = "الكلية مطلوبة";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setLoading(true);
      try {
        const res = await axios.post(
          apiUrl+"/auth/signup",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            passwordConfirm: formData.confirmPassword,
            role: "student",
            college: formData.college,
          }
        );
        if (res.data && res.data.status === "success") {
          localStorage.setItem("registerEmail", formData.email);
          navigate("/validation");
        } else {
          // fallback error
          setErrors((prev) => ({
            ...prev,
            email: "حدث خطأ أثناء التسجيل",
          }));
        }
      } catch (err) {
        // Map API errors to fields
        if (
          err.response &&
          err.response.data &&
          err.response.data.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          const apiFieldErrors = {};
          err.response.data.errors.forEach((e) => {
            const msg = e.message.toLowerCase();
            if (msg.includes("email")) apiFieldErrors.email = e.message;
            else if (msg.includes("password") && msg.includes("confirm"))
              apiFieldErrors.confirmPassword = e.message;
            else if (msg.includes("password"))
              apiFieldErrors.password = e.message;
            else if (msg.includes("name")) apiFieldErrors.name = e.message;
            else if (msg.includes("college"))
              apiFieldErrors.college = e.message;
          });
          setErrors((prev) => ({
            ...prev,
            ...apiFieldErrors,
          }));
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          setErrors((prev) => ({
            ...prev,
            email: err.response.data.message,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: "حدث خطأ أثناء التسجيل",
          }));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-4xl lg:max-w-6xl backdrop-blur-lg bg-white/30 p-4 sm:p-5 rounded-xl">
        <div dir="rtl" className="w-full md:w-2/3 p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-base sm:text-lg font-medium text-gray-700"
              >
                الاسم
              </label>
              <input
                dir="rtl"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ادخل اسمك الرباعي"
                className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-base sm:text-lg font-medium text-black-700"
              >
                البريد الالكتروني
              </label>
              <input
                dir="rtl"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="قم بادخال الايميل الجامعي"
                className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="college"
                className="block text-base sm:text-lg font-medium text-black-700"
              >
                الكلية
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الكلية</option>
                {colleges.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              {errors.college && (
                <p className="text-red-500 text-sm mt-1">{errors.college}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-base sm:text-lg font-medium text-black-700"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  dir="rtl"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="ادخل كلمة المرور"
                  className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 px-3 text-sm text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base sm:text-lg font-medium text-black-700"
              >
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  dir="rtl"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 px-3 text-sm text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 sm:p-3 rounded hover:bg-blue-700 transition text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "جاري التسجيل..." : "تسجيل حساب"}
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/3 bg-blue-800 flex flex-col p-4 items-center rounded-b-xl md:rounded-b-none md:rounded-r-xl py-4 sm:py-6">
          <div className="flex justify-center w-full mb-4 gap-0 bg-white p-1 mx-4 rounded-lg">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 bg-white text-blue-800 px-4 py-2 rounded-l-lg text-sm sm:text-base"
            >
              تسجيل الدخول
            </button>
            <button className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-r-lg text-sm sm:text-base">
              انشاء حساب
            </button>
          </div>

          <div className="h-full flex flex-col justify-center">
            <div className="flex flex-col items-center">
              <img
                src="https://www.ppu.edu/p/sites/all/themes/ppu2018/logo.png"
                alt="PPU Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
              <p className="text-white text-base sm:text-lg font-medium text-center px-2 mt-4">
                مركز طلاب جامعة بوليتكنك فلسطين
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
