import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiBookOpen,
  FiFileText,
  FiBarChart2,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiMic,
  FiClipboard,
  FiHeadphones,
} from "react-icons/fi";
import { useDispatch } from "react-redux";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: FiHome,
    },
    {
      path: "/admin/students",
      label: "Students",
      icon: FiUsers,
    },
    {
      path: "/admin/grades",
      label: "Grades & Lessons",
      icon: FiBook,
    },
    {
      path: "/admin/speaking-tests",
      label: "Speaking Tests",
      icon: FiMic,
      description: "Manage speaking tests",
    },
    {
      path: "/admin/listening-tests",
      label: "Listening Tests",
      icon: FiHeadphones,
      description: "Manage listening tests",
    },
    {
      path: "/admin/topic-tests",
      label: "Topic Tests",
      icon: FiBookOpen,
      description: "Every 5 lessons",
    },
    {
      path: "/admin/mock-tests",
      label: "Mock Tests",
      icon: FiClipboard,
      description: "20 questions test",
    },
    {
      path: "/admin/results",
      label: "Results",
      icon: FiBarChart2,
    },
  ];

  const logoutUser = () => {
    localStorage.clear();
  };

  const handleLogout = () => {
    localStorage.removeItem("speech-token");
    dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="h-[100vh] overflow-y-scroll bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? (
          <FiX color="#000" size={24} />
        ) : (
          <FiMenu color="#000" size={24} />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full md:w-80 sm:w-full bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-600 mt-1">
            English Learning Platform
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2 h-[60vh] overflow-y-scroll">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
