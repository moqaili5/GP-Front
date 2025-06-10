import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="flex flex-col bg-white rounded-xl shadow-lg w-full max-w-md p-6" dir="rtl">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">استعادة كلمة المرور</h2>
        {apiError && <div className="text-red-500 text-sm mb-2 text-center">{apiError}</div>}
        {successMsg && <div className="text-green-600 text-sm mb-2 text-center">{successMsg}</div>}

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <label className="block text-base font-medium mb-1">البريد الإلكتروني الجامعي</label>
            <input
              type="email"
              dir="rtl"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ادخل بريدك الإلكتروني"
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

export default ForgotPassword;