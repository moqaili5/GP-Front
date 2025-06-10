import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Forgot Password Modal Component
const ForgotPasswordModal = ({ show, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setStep(1);
      setEmail("");
      setResetCode("");
      setNewPassword("");
      setLoading(false);
      setApiError("");
      setSuccessMsg("");
    }
  }, [show]);

  // Step 1: Send reset code to email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/forgotPassword`, { email });
      setSuccessMsg("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
      setStep(2);
    } catch (err) {
      setApiError(
        err.response?.data?.message === "User not found"
          ? "البريد الإلكتروني غير مسجل."
          : "حدث خطأ أثناء إرسال الرمز. حاول مرة أخرى."
      );
    }
    setLoading(false);
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/verifyResetPassword`, { resetCode });
      setSuccessMsg("تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.");
      setStep(3);
    } catch (err) {
      setApiError(
        err.response?.data?.message === "Invalid or expired reset code"
          ? "رمز التحقق غير صحيح أو منتهي الصلاحية."
          : "حدث خطأ أثناء التحقق من الرمز."
      );
    }
    setLoading(false);
  };

  // Step 3: Set new password
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/auth/resetPassword`, {
        email,
        newPassword,
      });
      setSuccessMsg("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
      setStep(4);
    } catch {
      setApiError("حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى.");
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative" dir="rtl">
        <button
          className="absolute left-4 top-4 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
          aria-label="إغلاق"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">استعادة كلمة المرور</h2>
        {apiError && <div className="text-red-500 text-sm mb-2 text-center">{apiError}</div>}
        {successMsg && <div className="text-green-600 text-sm mb-2 text-center">{successMsg}</div>}

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <label className="block text-base font-medium mb-1">البريد الإلكتروني الجامعي</label>
            <input
              type="email"
              dir="ltr"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: 211057@ppu.edu.ps"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <label className="block text-base font-medium mb-1">رمز التحقق</label>
            <input
              type="text"
              dir="rtl"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ادخل رمز التحقق المرسل إلى بريدك"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "جاري التحقق..." : "تحقق من الرمز"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <label className="block text-base font-medium mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              dir="rtl"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ادخل كلمة مرور جديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center text-green-700 font-bold mt-4">
            تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.
          </div>
        )}
      </div>
    </div>
  );
};

const LoginForm = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Redirect if userInfo exists in localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      navigate("/home");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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
    setApiError(""); // Clear API error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "البريد الالكتروني مطلوب";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setLoading(true);
      try {
        const res = await axios.post(
          apiUrl + "/auth/login",
          {
            email: formData.email,
            password: formData.password,
          }
        );
        if (res.data && res.data.token && res.data.data && res.data.data.user) {
          // Save all user info and token in localStorage
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              ...res.data.data.user,
              token: res.data.token,
            })
          );
          localStorage.setItem("token", res.data.token);
          navigate("/home");
        } else {
          setApiError("بيانات الدخول غير صحيحة");
        }
      } catch (err) {
        // Handle API error message
        if (
          err.response &&
          err.response.data &&
          err.response.data.message === "Incorrect email or password"
        ) {
          setApiError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.message === "Your account is inactive. Please contact the admin."
        ) {
          setApiError("حسابك غير مفعل. يرجى التواصل مع الإدارة.");
        } else {
          setApiError("حدث خطأ أثناء تسجيل الدخول");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-4xl lg:max-w-6xl backdrop-blur-lg bg-white/30 p-4 sm:p-5 rounded-xl">
        {/* Form Section */}
        <div
          dir="rtl"
          className="flex flex-col justify-center items-center w-full md:w-2/3 p-4 sm:p-6 md:p-8 min-h-[70vh]"
        >
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Show API error above the fields */}
            {apiError && (
              <div className="text-red-500 text-sm mb-2 text-center">
                {apiError}
              </div>
            )}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-base sm:text-lg font-medium text-black-700"
              >
                البريد الالكتروني
              </label>
              <input
                dir="ltr"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="مثال: 211057@ppu.edu.ps"
                className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 sm:p-3 rounded hover:bg-blue-700 transition text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
            <div className="w-full text-center mt-2">
              <button
                type="button"
                className="text-black-700 hover:underline text-md"
                onClick={() => setShowForgotModal(true)}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </form>
        </div>

        {/* Logo Section */}
        <div className="w-full md:w-1/3 bg-blue-800 flex flex-col p-4 items-center rounded-b-xl md:rounded-b-none md:rounded-r-xl py-4 sm:py-6">
          <div className="flex justify-center w-full mb-4 gap-0 bg-white p-1 mx-4 rounded-lg">
            <button className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-l-lg text-sm sm:text-base">
              تسجيل الدخول
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex-1 bg-white text-blue-800 px-4 py-2 rounded-l-lg text-sm sm:text-base"
            >
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

export default LoginForm;