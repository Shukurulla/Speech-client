import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiActivity,
  FiUsers,
  FiBookOpen,
  FiBook,
  FiDatabase,
  FiUser,
  FiPaperclip,
  FiLogOut,
} from "react-icons/fi";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <FiActivity />,
      path: "/admin",
    },
    {
      label: "Students",
      icon: <FiUsers />,
      path: "/admin/students",
    },
    {
      label: "Grades",
      icon: <FiBook />,
      path: "/admin/grades",
    },
    {
      label: "Lessons",
      icon: <FiBookOpen />,
      path: "/admin/lessons",
    },
    {
      label: "Tests",
      icon: <FiPaperclip />,
      path: "/admin/tests",
    },
    {
      label: "Results",
      icon: <FiDatabase />,
      path: "/admin/results",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("speech-token");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:translate-x-0 w-72 bg-white border-r border-gray-200 h-full z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between py-6 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                <FiUser />
              </span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-semibold">
                {user?.user?.firstname?.[0] || user?.firstname?.[0] || "A"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.user?.firstname || user?.firstname}{" "}
                {user?.user?.lastname || user?.lastname}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <span className="text-xl mr-3">
              <FiLogOut />
            </span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8 min-h-screen pt-16 lg:pt-8">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
