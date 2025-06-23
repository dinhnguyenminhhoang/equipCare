// src/layouts/DefaultLayout/DefaultLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Layout/Sidebar/Sidebar";
import Header from "../../components/Layout/Header/Header";
import { useAuth } from "../../context/AuthContext";

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: "📊",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      key: "/equipment",
      icon: "🔧",
      label: "Quản lý thiết bị",
      path: "/equipment",
    },
    {
      key: "maintenance",
      icon: "⚙️",
      label: "Bảo dưỡng",
      children: [
        {
          key: "/maintenance-tickets",
          label: "Phiếu bảo dưỡng",
          path: "/maintenance-tickets",
        },
        {
          key: "/maintenance-levels",
          label: "Cấp bảo dưỡng",
          path: "/maintenance-levels",
          adminOnly: true,
        },
      ],
    },
    {
      key: "repair",
      icon: "🔨",
      label: "Sửa chữa",
      children: [
        {
          key: "/repair-tickets",
          label: "Phiếu sửa chữa",
          path: "/repair-tickets",
        },
      ],
    },
    {
      key: "/materials",
      icon: "📦",
      label: "Quản lý vật tư",
      path: "/materials",
    },
    ...(isAdmin()
      ? [
          {
            key: "/users",
            icon: "👥",
            label: "Quản lý người dùng",
            path: "/users",
          },
        ]
      : []),
  ];

  const filterMenuItems = (items) => {
    return items.filter((item) => {
      if (item.adminOnly && !isAdmin()) return false;
      if (item.managerOnly && !isManager()) return false;
      if (item.children) {
        item.children = filterMenuItems(item.children);
        return item.children.length > 0;
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-1/6 hidden lg:block">
        <Sidebar
          menuItems={filterMenuItems(menuItems)}
          currentPath={location.pathname}
          isOpen={true}
          onClose={() => setSidebarOpen(false)}
          onNavigate={navigate}
        />
      </div>

      <div className="lg:hidden">
        <Sidebar
          menuItems={filterMenuItems(menuItems)}
          currentPath={location.pathname}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={navigate}
        />
      </div>

      <div className="flex-1 lg:w-4/6 flex flex-col">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationOpen(true)}
        />

        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
