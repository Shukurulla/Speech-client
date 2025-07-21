import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import { Toaster } from "react-hot-toast";
import ResponsiveLayout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Tests from "./pages/tests";
import Settings from "./pages/Settings";
import UserService from "./service/user.service";
import { useDispatch } from "react-redux";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
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

  // Don't show layout for login/register pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

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
