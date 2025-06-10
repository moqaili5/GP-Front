import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Loading from "../components/loading/Loading";
import axios from "axios";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = userInfo?.token;
        const res = await axios.get(`${apiUrl}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "success") {
          setUser(res.data.data);
        } else {
          setError("لم يتم العثور على المستخدم");
        }
      } catch (error) {
        setError("حدث خطأ أثناء جلب بيانات المستخدم");
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId, apiUrl]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 p-8 text-lg">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-slate-100 rounded-3xl mt-20 shadow-lg p-8 sm:p-12 mt-10 text-center flex flex-col items-center gap-8">
      <div className="relative">
        <img
          src={
            user.profilePicture ||
            "https://ui-avatars.com/api/?name=User&background=random"
          }
          alt={user.name}
          className="w-36 h-36 sm:w-48 sm:h-48 rounded-full mx-auto border-4 border-blue-200 shadow-lg object-cover"
        />
        <span
          className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-2 border-white ${
            user.active ? "bg-green-400" : "bg-gray-400"
          }`}
          title={user.active ? "نشط" : "غير نشط"}
        ></span>
      </div>
      <div className="w-full flex flex-col items-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          {user.name}
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          <span className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-semibold">
            {user.role === "club_responsible" ? "مسؤول نادي" : user.role}
          </span>
          <span className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-base font-semibold">
            {user.college || "غير محدد"}
          </span>
        </div>
        <p className="text-gray-600 text-lg mb-2 break-all">{user.email}</p>
        <div className="flex flex-wrap justify-center gap-4 text-base text-gray-500 mb-2">
          <span>
            تاريخ الإنشاء:{" "}
            {new Date(user.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {user.role === "club_responsible" && user.managedClub && (
          <Link
            to={`/clubs/${user.managedClub}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg mt-2 hover:bg-blue-700 transition text-lg font-semibold"
          >
            عرض النادي المسؤول عنه
          </Link>
        )}
      </div>
      <div className="w-full gap-6 mt-4">
        <div className="bg-gray-50 rounded-xl p-6 shadow flex flex-col items-center">
          <span className="text-gray-500 text-base mb-2">الحالة</span>
          <span
            className={`font-bold text-xl ${
              user.active ? "text-green-600" : "text-gray-400"
            }`}
          >
            {user.active ? "نشط" : "غير نشط"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
