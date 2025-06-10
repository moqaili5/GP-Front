import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClubsComponent = () => {
  const [clubs, setClubs] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch clubs data
    axios.get(`${apiUrl}/clubs`)
      .then(res => setClubs(res.data.data.slice(0, 3)))
      .catch(() => setClubs([]));
  }, [apiUrl]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">الأندية</h2>
      {clubs.length === 0 && (
        <div className="text-center text-gray-500">لا توجد أندية متاحة حالياً.</div>
      )}
      <div className="flex flex-col gap-4">
        {clubs.map((club) => (
          <div key={club._id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
            <div className="flex items-center">
              <img
                src={club.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile Icon"
                className="w-8 h-8 mr-2"
              />
              <span className="text-lg font-semibold text-gray-800">{club.name}</span>
            </div>
            <button
              onClick={() => navigate(`/clubs/${club._id}`)}
              className="bg-blue-500 text-white rounded-lg py-1 px-4 hover:bg-blue-600 transition duration-200 text-sm"
            >
              تفاصيل
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubsComponent;