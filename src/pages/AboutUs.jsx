import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Loading from "../components/loading/Loading.jsx";

const AboutUs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 1 second (or replace with real data fetching)
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
    <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen pt-24 pb-10">
      <Navbar />
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-3 sm:px-6 py-10 sm:py-14 bg-white/90 rounded-3xl shadow-2xl mb-10 sm:mb-16 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-20 -left-20 w-40 h-40 sm:w-72 sm:h-72 bg-blue-200 opacity-30 rounded-full z-0"></div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 sm:w-96 sm:h-96 bg-blue-300 opacity-20 rounded-full z-0"></div>
        <div className="flex-1 text-center md:text-right z-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-blue-800 mb-4 sm:mb-6 drop-shadow-lg">
            مرحبًا بك في منصة النوادي الجامعية
          </h1>
          <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed font-medium">
            حيث يلتقي الشغف، الإبداع، والعمل الجماعي في مكان واحد{" "}
            <br className="hidden sm:block" />
            منصتنا تجمع كل النوادي الجامعية، وتمنحك فرصة استكشاف، مشاركة، وصناعة
            ذكريات لا تُنسى في حياتك الجامعية
          </p>
          <button
            className="mt-2 sm:mt-4 px-6 sm:px-8 py-2 sm:py-3 bg-blue-700 hover:bg-blue-900 text-white text-base sm:text-lg font-bold rounded-full shadow-xl transition-all duration-200"
            onClick={() => navigate("/clubs")}
          >
            استكشف النوادي الآن
          </button>
        </div>
        <div className="flex-1 flex justify-center z-10 mt-8 md:mt-0">
          <img
            src="https://www.ppu.edu/p/sites/all/themes/ppu2018/logo.png"
            alt="PPU Clubs"
            className="w-40 h-40 sm:w-80 sm:h-80 object-contain rounded-2xl shadow-2xl border-8 border-blue-100 bg-white"
          />
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-6xl mx-auto bg-white/90 rounded-3xl shadow-2xl px-3 sm:px-8 py-10 sm:py-14 mb-10 sm:mb-16 relative overflow-hidden">
        {/* Decorative Waves */}
        <svg
          className="absolute top-0 left-0 w-full h-10 sm:h-20"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#dbeafe"
            fillOpacity="1"
            d="M0,64L1440,160L1440,0L0,0Z"
          ></path>
        </svg>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-8 sm:mb-12 text-center drop-shadow">
          كيف تعمل المنصة؟
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12 relative z-10">
          {/* Card 1 */}
          <div className="flex flex-col items-center mb-8 md:mb-0 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3 shadow-lg border-4 border-blue-100 group-hover:from-blue-500 group-hover:to-blue-700 group-hover:border-blue-300 transition-all duration-300">
              1
            </div>
            <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-700 transition-all duration-300">
              اختر النادي
            </div>
            <div className="text-gray-500 text-sm sm:text-base text-center group-hover:text-blue-500 transition-all duration-300">
              تصفح جميع النوادي الجامعية المتاحة
            </div>
          </div>
          <div className="w-8 h-1 sm:w-12 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full hidden md:block"></div>
          {/* Card 2 */}
          <div className="flex flex-col items-center mb-8 md:mb-0 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-400 to-blue-400 text-white w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3 shadow-lg border-4 border-blue-100 group-hover:from-purple-500 group-hover:to-blue-600 group-hover:border-blue-300 transition-all duration-300">
              2
            </div>
            <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-700 transition-all duration-300">
              سجل وشارك
            </div>
            <div className="text-gray-500 text-sm sm:text-base text-center group-hover:text-blue-500 transition-all duration-300">
              سجل في النادي وشارك في الفعاليات
            </div>
          </div>
          <div className="w-8 h-1 sm:w-12 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full hidden md:block"></div>
          {/* Card 3 */}
          <div className="flex flex-col items-center mb-8 md:mb-0 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-400 to-purple-400 text-white w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3 shadow-lg border-4 border-blue-100 group-hover:from-blue-500 group-hover:to-purple-600 group-hover:border-blue-300 transition-all duration-300">
              3
            </div>
            <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-700 transition-all duration-300">
              تابع إنجازاتك
            </div>
            <div className="text-gray-500 text-sm sm:text-base text-center group-hover:text-blue-500 transition-all duration-300">
              تابع مشاركاتك ونتائجك في لوحة النتائج
            </div>
          </div>
          <div className="w-8 h-1 sm:w-12 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full hidden md:block"></div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-6xl mx-auto bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-3xl shadow-2xl px-3 sm:px-8 py-10 sm:py-14 mb-10 sm:mb-16 flex flex-col md:flex-row items-center gap-8 sm:gap-14 relative overflow-hidden">
        <div className="flex-1 flex justify-center mb-8 md:mb-0">
          <img
            src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=facearea&w=400&h=400&q=80"
            alt="Why Choose Us"
            className="w-40 h-40 sm:w-80 sm:h-80 object-cover rounded-2xl shadow-2xl border-8 border-blue-100 bg-white"
          />
        </div>
        <div className="flex-1 z-10" dir="rtl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-4 sm:mb-6 drop-shadow">
            لماذا نحن؟
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 sm:space-y-4 text-base sm:text-lg font-medium">
            <li>واجهة عصرية وسهلة الاستخدام ستجعلك تعشق تصفح المنصة</li>
            <li>تواصل مباشر مع مسؤولي النوادي واطلع على كل جديد</li>
            <li>تغطية شاملة لجميع الفعاليات الجامعية في مكان واحد</li>
            <li>دعم فني سريع وفعال لأي استفسار أو مشكلة</li>
            <li>مجتمع طلابي نابض بالحياة والإبداع</li>
          </ul>
        </div>
        {/* Decorative Shape */}
        <div className="absolute -bottom-12 -left-12 sm:-bottom-24 sm:-left-24 w-52 h-52 sm:w-96 sm:h-96 bg-purple-200 opacity-20 rounded-full z-0"></div>
      </section>

      {/* Call To Action */}
      <section className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl shadow-2xl px-3 sm:px-8 py-10 sm:py-14 mb-8 sm:mb-10 flex flex-col items-center text-center relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow">
          جاهز لتجربة جامعية لا تُنسى؟
        </h2>
        <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 font-medium">
          انضم الآن إلى مجتمع النوادي الجامعية وابدأ رحلتك مع أصدقاء جدد،
          فعاليات ممتعة، وإنجازات مميزة!
        </p>
        <button
          className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-blue-700 font-bold text-lg sm:text-xl rounded-full shadow-xl hover:bg-blue-50 transition-all duration-200"
          onClick={() => navigate("/clubs")}
        >
          سجل وابدأ الآن
        </button>
        {/* Decorative Circles */}
        <div className="absolute -top-8 -right-8 sm:-top-16 sm:-right-16 w-28 h-28 sm:w-52 sm:h-52 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 sm:-bottom-16 sm:-left-16 w-20 h-20 sm:w-40 sm:h-40 bg-white opacity-10 rounded-full"></div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm sm:text-base mt-8 sm:mt-10 font-semibold tracking-wide">
        &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لجامعة بوليتكنك
        فلسطين
      </footer>
    </div>
  );
};

export default AboutUs;