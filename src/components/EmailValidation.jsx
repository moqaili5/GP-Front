import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EmailValidation = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get email from localStorage
  const email = localStorage.getItem("registerEmail");

  const handleChange = (e) => {
    setCode(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      setError("يرجى إدخال رمز التحقق");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
       apiUrl+ "/auth/verifyEmail",
        {
          email,
          verificationCode: code, // <-- this is the correct key!
        }
      );

      if (res.data && res.data.status === "success") {
        localStorage.removeItem("registerEmail");
        localStorage.setItem("validatedEmail", email);
        navigate("/login");
      } else {
        setError("رمز التحقق غير صحيح أو منتهي الصلاحية");
      }
    } catch{
      setError("رمز التحقق غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl backdrop-blur-lg bg-white/30 p-4 sm:p-5">
        <div dir="rtl" className="w-full p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
              تفعيل البريد الإلكتروني
            </h2>
            <div>
              <label
                htmlFor="code"
                className="block text-base sm:text-lg font-medium text-gray-700"
              >
                رمز التحقق
              </label>
              <input
                dir="rtl"
                type="text"
                name="code"
                value={code}
                onChange={handleChange}
                placeholder="ادخل رمز التحقق المرسل إلى بريدك"
                className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 sm:p-3 rounded hover:bg-blue-700 transition text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "جاري التحقق..." : "تفعيل"}
            </button>
          </form>
        </div>
        <div className="hidden md:flex w-full md:w-1/3 bg-blue-800 flex-col p-4 items-center rounded-b-xl md:rounded-b-none md:rounded-r-xl py-4 sm:py-6">
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

export default EmailValidation;
