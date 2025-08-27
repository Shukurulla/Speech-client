// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveLayout from "../components/Layout";
import axios from "../service/api";
import { toast } from "react-hot-toast";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiMessageSquare,
  FiTrash2,
  FiExternalLink,
  FiClock,
} from "react-icons/fi";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly, currentPage]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/notifications", {
        params: {
          page: currentPage,
          limit: 10,
          unreadOnly: unreadOnly,
        },
      });

      if (data.status === "success") {
        setNotifications(data.data.notifications);
        setTotalPages(data.data.pagination.pages);
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

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all");

      // Update all notifications in state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true, readAt: new Date() }))
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);

      // Remove from local state
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type and data
    if (notification.type === "ai_feedback" && notification.data?.resultUrl) {
      navigate(notification.data.resultUrl);
    } else if (notification.data?.testId) {
      navigate(`/topic-test-result/${notification.data.testId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ai_feedback":
        return <FiMessageSquare className="text-purple-600" />;
      case "test_complete":
        return <FiCheckCircle className="text-green-600" />;
      case "achievement":
        return <FiAward className="text-yellow-600" />;
      case "system":
        return <FiAlertCircle className="text-blue-600" />;
      default:
        return <FiBell className="text-gray-600" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffTime = Math.abs(now - notifDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return notifDate.toLocaleDateString();
    }
  };

  const PageContent = () => (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FiBell className="mr-3" />
          Notifications
        </h1>
        <p className="text-lg text-gray-600">
          Stay updated with your test results and AI feedback
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setUnreadOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mr-2"
              />
              <span className="text-gray-700">Unread only</span>
            </label>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.read)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <FiCheck className="mr-2" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBell className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notifications
          </h3>
          <p className="text-gray-600">
            {unreadOnly
              ? "You have no unread notifications"
              : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onClick={handleNotificationClick}
              getIcon={getNotificationIcon}
              getScoreColor={getScoreColor}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <ResponsiveLayout activePage={<PageContent />} activeTab="Notifications" />
  );
};

// Notification Card Component
const NotificationCard = ({
  notification,
  onRead,
  onDelete,
  onClick,
  getIcon,
  getScoreColor,
  formatDate,
}) => {
  const { _id, type, title, message, read, readAt, createdAt, data } =
    notification;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        read ? "border-gray-200" : "border-blue-300 bg-blue-50"
      } p-4 hover:shadow-md transition-all cursor-pointer`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">{getIcon(type)}</div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-semibold text-gray-900 mb-1 ${
                    !read ? "font-bold" : ""
                  }`}
                >
                  {title}
                  {!read && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </h3>

                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  {message}
                </p>

                {/* Additional data display */}
                {data?.score !== undefined && (
                  <div className="mb-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        data.score
                      )}`}
                    >
                      Score: {data.score}%
                    </span>
                  </div>
                )}

                {data?.strengths && data.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Strengths:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.strengths.slice(0, 3).map((strength, index) => (
                        <span
                          key={index}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data?.improvements && data.improvements.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">
                      Areas to improve:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {data.improvements
                        .slice(0, 3)
                        .map((improvement, index) => (
                          <span
                            key={index}
                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
                          >
                            {improvement}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <FiClock className="mr-1" />
                  {formatDate(createdAt)}
                  {read && readAt && (
                    <span className="ml-3">• Read {formatDate(readAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {data?.resultUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(notification);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Result"
            >
              <FiExternalLink />
            </button>
          )}

          {!read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(_id);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Mark as read"
            >
              <FiCheckCircle />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(_id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
