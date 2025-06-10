import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import StartPage from "./pages/StartPage";
import ClubsCardsPage from "./pages/ClubsCardsPage";
import Events from "./pages/Events";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import EmailValidation from "./components/EmailValidation";
import PrivateRoute from "./components/PrivateRoute";
import EventDetails from "./pages/EventDetails";
import ClubDetails from "./pages/ClubDetails";
import Navbar from "./components/NavBar";
import AboutUs from "./pages/AboutUs";
// Layout for private pages with Navbar
function PrivateLayout({ children }) {
  return (
    <div className="bg-cover bg-center min-h-screen flex flex-col items-center w-full">
      <Navbar />
      <div className="w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no Navbar) */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/" element={<StartPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/validation" element={<EmailValidation />} />
        {/* Private routes (with Navbar) */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <MainPage />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ClubsCardsPage />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Events />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <LeaderBoard />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Profile />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <EventDetails />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ClubDetails />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;