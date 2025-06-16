import { useState, useEffect } from "react";
import { XMarkIcon, BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useNotification } from "../contexts/NotificationContext";
import { markAllAsRead } from "../services/notificationService";

const NotificationPanel = ({ onClose }) => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markNotificationAsRead,
    fetchUnreadCount,
  } = useNotification();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === "UNREAD") {
      await markNotificationAsRead(notification._id);
    }

    // Navigate to related page if actionUrl exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "MAINTENANCE_DUE":
      case "MAINTENANCE_OVERDUE":
        return "🔧";
      case "REPAIR_REQUEST":
        return "🔨";
      case "STOCK_LOW":
      case "STOCK_OUT":
        return "📦";
      case "MATERIAL_EXPIRED":
        return "⚠️";
      case "TASK_ASSIGNED":
        return "📋";
      case "APPROVAL_REQUIRED":
        return "✋";
      default:
        return "📬";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "border-l-red-500 bg-red-50";
      case "HIGH":
        return "border-l-orange-500 bg-orange-50";
      case "MEDIUM":
        return "border-l-blue-500 bg-blue-50";
      case "LOW":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-500 bg-white";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return notification.status === "UNREAD";
    if (filter === "read") return notification.status === "READ";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông báo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-1">
            {[
              { key: "all", label: "Tất cả" },
              { key: "unread", label: "Chưa đọc" },
              { key: "read", label: "Đã đọc" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {notifications.some((n) => n.status === "UNREAD") && (
            <button
              onClick={handleMarkAllAsRead}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Không có thông báo"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${getPriorityColor(
                    notification.priority
                  )} ${notification.status === "UNREAD" ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {notification.status === "UNREAD" && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>

                        {notification.actionRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Cần thao tác
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
