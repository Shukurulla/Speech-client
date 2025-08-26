import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiX,
  FiMessageCircle,
  FiAward,
  FiInfo,
  FiChevronRight,
  FiTrash2,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import axios from "../service/api";
import { toast } from "react-hot-toast";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, ai_feedback
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      let endpoint = "/notifications";
      if (filter === "unread") {
        endpoint += "?unreadOnly=true";
      }

      const { data } = await axios.get(endpoint);

      if (data.status === "success") {
        let filteredNotifications = data.data.notifications;

        if (filter === "ai_feedback") {
          filteredNotifications = filteredNotifications.filter(
            (n) => n.type === "ai_feedback"
          );
        }

        setNotifications(filteredNotifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

      const notification = notifications.find((n) => n._id === notificationId);
      if (!notification?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Handle navigation based on notification type
    if (notification.type === "ai_feedback" && notification.data?.testId) {
      navigate(`/topic-test/result/${notification.data.testId}`);
    } else if (notification.type === "mock_test" && notification.data?.testId) {
      navigate(`/mock-test/result/${notification.data.testId}`);
    } else if (
      notification.type === "test_complete" &&
      notification.data?.resultId
    ) {
      navigate(`/results/${notification.data.resultId}`);
    } else {
      setSelectedNotification(notification);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ai_feedback":
        return <FiMessageCircle className="text-purple-600" size={20} />;
      case "test_complete":
        return <FiCheck className="text-green-600" size={20} />;
      case "achievement":
        return <FiAward className="text-yellow-600" size={20} />;
      case "mock_test":
        return <FiTrendingUp className="text-blue-600" size={20} />;
      default:
        return <FiInfo className="text-blue-600" size={20} />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return notifDate.toLocaleDateString();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              Stay updated with your learning progress
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "unread", "ai_feedback"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterType
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterType === "ai_feedback"
                ? "AI Feedback"
                : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FiBell size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notifications
          </h3>
          <p className="text-gray-500">
            {filter === "unread"
              ? "You're all caught up!"
              : filter === "ai_feedback"
              ? "No AI feedback yet"
              : "When you receive notifications, they'll appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl border ${
                !notification.read
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200"
              } p-6 hover:shadow-md transition-all cursor-pointer`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>

                    {/* Additional Info for AI Feedback */}
                    {notification.type === "ai_feedback" &&
                      notification.data?.score && (
                        <div className="flex items-center gap-4 mt-3">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              notification.data.score
                            )}`}
                          >
                            {notification.data.score}%
                          </span>
                          <span className="text-sm text-gray-500">
                            Overall Score
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-400 flex items-center">
                        <FiClock className="mr-1" size={12} />
                        {formatTime(notification.createdAt)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <FiChevronRight className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Notification Details
                </h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                {getNotificationIcon(selectedNotification.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedNotification.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedNotification.message}
              </p>

              {selectedNotification.data && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}

              <p className="text-sm text-gray-400">
                Received:{" "}
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
