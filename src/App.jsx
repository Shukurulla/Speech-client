import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import { Toaster } from "react-hot-toast";
import ResponsiveLayout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Tests from "./pages/tests";
import Settings from "./pages/Settings";
import Practice from "./pages/Practice";
import UserService from "./service/user.service";
import { useDispatch, useSelector } from "react-redux";

// Admin Components
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminGrades from "./pages/admin/Grades";
import AdminLessons from "./pages/admin/Lessons";
import AdminTests from "./pages/admin/Tests";
import AdminResults from "./pages/admin/Results";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("speech-token");

  useEffect(() => {
    if (
      !token &&
      !location.pathname.includes("/login") &&
      !location.pathname.includes("/register")
    ) {
      navigate("/login");
    } else if (token) {
      UserService.profile(dispatch);
    }
  }, [token, navigate, dispatch, location.pathname]);

  // Check if user is admin
  const isAdmin = user?.user?.role === "admin" || user?.role === "admin";

  // Don't show layout for login/register pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Check if current path is admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAuthPage) {
    return (
      <>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </>
    );
  }

  // Redirect regular users trying to access admin routes
  if (isAdminRoute && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Admin Routes
  if (isAdminRoute && isAdmin) {
    return (
      <>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/grades" element={<AdminGrades />} />
          <Route path="/admin/lessons" element={<AdminLessons />} />
          <Route path="/admin/tests" element={<AdminTests />} />
          <Route path="/admin/results" element={<AdminResults />} />
        </Routes>
      </>
    );
  }

  // Regular User Routes
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            <ResponsiveLayout
              activePage={<Dashboard />}
              activeTab={"Dashboard"}
            />
          }
        />
        <Route
          path="/tests"
          element={
            <ResponsiveLayout activePage={<Tests />} activeTab={"My Tests"} />
          }
        />
        <Route
          path="/practice"
          element={
            <ResponsiveLayout
              activePage={<Practice />}
              activeTab={"Practice"}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ResponsiveLayout
              activePage={<Settings />}
              activeTab={"Settings"}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
