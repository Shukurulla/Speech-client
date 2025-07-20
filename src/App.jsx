import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Tests from "./pages/tests";
import UserService from "./service/user.service";
import { useDispatch } from "react-redux";

function App() {
  const navigate = useNavigate();

  const token = localStorage.getItem("speech-token");

  const dispatch = useDispatch();
  if (!token) {
    navigate("/login");
  } else {
    UserService.profile(dispatch);
  }
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Layout activePage={<Dashboard />} activeTab={"Dashboard"} />
          }
        />
        <Route
          path="/tests"
          element={<Layout activePage={<Tests />} activeTab={"My Tests"} />}
        />
      </Routes>
    </>
  );
}

export default App;
