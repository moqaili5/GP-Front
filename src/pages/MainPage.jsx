import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import Post from '../components/Post';
import EventList from '../components/Eventscom';
import SocialComponent from '../components/Clubs';
 import CreatePost from '../components/CreatePost';
import Loading from '../components/loading/loading';
const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true); // Start loading before request
    const fetchPosts = async () => {
      try {
        const response = await fetch(apiUrl+ '/posts'); 
        const result = await response.json();
        if (result.status === 'success') {
          setPosts(result.data);
          setError(null);
        } else {
          setError('Failed to fetch posts');
          setLoading(false); // Stop loading on error
          return;
        }
      } catch  {
        setError('Error fetching posts');
        setLoading(false); // Stop loading on error
        return;
      }
      setLoading(false); // Stop loading on success
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="h-10 sm:h-20"></div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 sm:gap-8 px-2 sm:px-6 lg:px-10" dir="rtl">
        {/* Left Column (Posts) */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Posts List */}
          <div className="rounded-3xl shadow-md flex flex-col gap-4 sm:gap-6">
            {loading && <Loading />}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && posts.map(post => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        </div>
<div className="hidden lg:flex flex-col gap-4 sm:gap-6 sticky top-16 self-start overflow-y-auto max-h-[calc(100vh-4rem)]">
  <div className="shadow-md ">
    <SocialComponent />
  </div>
  <div className="rounded-3xl shadow-md ">
    <EventList />
  </div>
</div>
      </div>
    </div>
  );
};

export default MainPage;