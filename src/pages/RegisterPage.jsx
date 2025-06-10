import React, { useState, useEffect } from "react";
import Register from "../components/Register";
import Loading from "../components/loading/loading";

function RegisterPage() {
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
    <div className="start-page ">
      <div className="overlay">
        <Register />
      </div>
    </div>
  );
}

export default RegisterPage;