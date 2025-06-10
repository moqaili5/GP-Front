import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import ClubCard from '../components/ClubCard';
import Loading from '../components/loading/loading';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ClubsCardsPage() {
  // const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/clubs`)
      .then((res) => {
        setClubs(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('حدث خطأ أثناء جلب الأندية.');
        setLoading(false);
      });
  }, [apiUrl]);

  // Split clubs into rows of 2
  const clubRows = [];
  for (let i = 0; i < clubs.length; i += 2) {
    clubRows.push(clubs.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <Navbar />
      <div className="h-10 sm:h-20"></div>
      {/* Main Content */}
      <div className="w-full flex flex-col items-center" dir="rtl">
        {loading && (
          <div className="w-full flex justify-center items-center min-h-[60vh] text-center text-lg text-gray-700">
            <Loading />
          </div>
        )}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && clubs.length === 0 && (
          <div className="text-center text-gray-500">لا توجد أندية متاحة حالياً.</div>
        )}
        {!loading && !error && clubs.length > 0 && (
          <div className="w-full flex flex-col gap-6 px-2 sm:px-8 lg:px-16">
            {clubRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {row.map((club) => (
                  <ClubCard
                    key={club._id}
                    club={club}
                    hideJoinButton={true} // <-- Hide join button here
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubsCardsPage;