import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import { Toaster } from "react-hot-toast";
import ResponsiveLayout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/Settings";
import GradeLessons from "./pages/GradeLessons";
import LessonTests from "./pages/LessonTests";
import TestQuestions from "./pages/TestQuestions.jsx";
import UserService from "./service/user.service";
import { useDispatch, useSelector } from "react-redux";

// Admin Components
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminGrades from "./pages/admin/Grades";
import AdminLessons from "./pages/admin/Lessons";
import AdminSpeakingTests from "./pages/admin/SpeakingTests";
import AdminListeningTests from "./pages/admin/ListeningTests.jsx";
import AdminResults from "./pages/admin/Results";
import AdminTopicTests from "./pages/admin/TopicTests";
import AdminMockTests from "./pages/admin/MockTests";

// User Components
import Grades from "./pages/Grades.jsx";
import StudentResults from "./pages/StudentResult.jsx";
import TopicSpeaking from "./pages/TopicSpeaking";
import TopicTestResult from "./pages/TopicTestResult";
import MockTest from "./pages/MockTest";
import MockTestResult from "./pages/MockTestResult";
import NotificationCenter from "./pages/NotificationCenter";

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
      UserService.profile(dispatch).then(() => {
        // Auto-redirect admin to admin dashboard
        const userData = user?.user || user;
        console.log(userData);
        if (
          userData?.role === "admin" &&
          !location.pathname.startsWith("/admin")
        ) {
          navigate("/admin");
        }
      });
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
          <Route
            path="/admin/speaking-tests"
            element={<AdminSpeakingTests />}
          />
          <Route
            path="/admin/listening-tests"
            element={<AdminListeningTests />}
          />
          <Route path="/admin/topic-tests" element={<AdminTopicTests />} />
          <Route path="/admin/mock-tests" element={<AdminMockTests />} />
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
        {/* Dashboard - Main page with grades */}
        <Route
          path="/"
          element={
            <ResponsiveLayout
              activePage={<Dashboard />}
              activeTab={"Dashboard"}
            />
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ResponsiveLayout
              activePage={<NotificationCenter />}
              activeTab={"Notifications"}
            />
          }
        />

        {/* Grade Lessons - Shows lessons for selected grade */}
        <Route path="/grade/:gradeId" element={<GradeLessons />} />

        {/* Lesson Tests - Shows tests for selected lesson */}
        <Route path="/lesson/:lessonId/tests" element={<LessonTests />} />

        {/* Test Questions - Shows questions for selected test */}
        <Route path="/test/:testId" element={<TestQuestions />} />

        {/* Grades Page */}
        <Route path="/grades/" element={<Grades />} />

        {/* Results Page */}
        <Route path="/results" element={<StudentResults />} />
        <Route path="/results/:resultId" element={<StudentResults />} />

        {/* Topic Speaking Test Routes */}
        <Route
          path="/topic-speaking/:gradeId/:lessonNumber"
          element={<TopicSpeaking />}
        />
        <Route
          path="/topic-test/result/:resultId"
          element={<TopicTestResult />}
        />

        {/* Mock Test Routes */}
        <Route path="/mock-test/:gradeId" element={<MockTest />} />
        <Route
          path="/mock-test/result/:resultId"
          element={<MockTestResult />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ResponsiveLayout
              activePage={<Settings />}
              activeTab={"Settings"}
            />
          }
        />

        {/* 404 - Page Not Found */}
        <Route
          path="*"
          element={
            <ResponsiveLayout
              activePage={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">404</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Page Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                      The page you're looking for doesn't exist.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              }
              activeTab={"Dashboard"}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
