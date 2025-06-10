import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  // Optionally: check token validity with backend here
  if (!userInfo || !userInfo.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;