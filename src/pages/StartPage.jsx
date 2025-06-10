import React, { useState, useEffect } from "react";
import Start from "../components/Start";
import { useNavigate } from "react-router-dom";
import Loading from "../components/loading/loading";

function StartPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 1 second (or replace with real logic)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
        <Loading />
      </div>
    );
  }

  return (
    <div className="start-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="overlay"></div>
      <div
        className="z-100 backdrop-blur-md bg-white/30 p-4 rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center w-[68%] min-h-[400px]"
        dir="rtl"
      >
        <img
          src="https://www.ppu.edu/p/sites/all/themes/ppu2018/logo.png"
          alt="Univ Logo"
          className="w-40 h-40 mb-8"
        />

        <h1 className="text-blue-700 text-2xl font-bold text-center mb-3">
          مراتبنا بالعلم نرفعها جنباً
        </h1>
        <p className="text-blue-700 text-xl text-center mb-10">
          مرحبا بك في مركز طلاب جامعة بوليتكنك فلسطين
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300"
        >
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default StartPage;