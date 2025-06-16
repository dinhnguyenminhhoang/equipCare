// src/pages/Dashboard/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { getDashboardData } from "../../services/dashboardService";
import AlertBanner from "../../components/AlertBanner/AlertBanner";
import ChartCard from "../../components/ChartCard/ChartCard";
import RecentActivities from "../../components/RecentActivities/RecentActivities";
import StatsCard from "../../components/StatsCard/StatsCard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng thiết bị",
      value: dashboardData?.totalEquipments || 0,
      icon: WrenchScrewdriverIcon,
      color: "blue",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Thiết bị hoạt động",
      value: dashboardData?.activeEquipments || 0,
      icon: CheckCircleIcon,
      color: "green",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Cần bảo dưỡng",
      value: dashboardData?.overdueMaintenances || 0,
      icon: ClockIcon,
      color: "yellow",
      change: "-5%",
      changeType: "decrease",
    },
    {
      title: "Vật tư thiếu hụt",
      value: dashboardData?.lowStockMaterials || 0,
      icon: CubeIcon,
      color: "red",
      change: "+3%",
      changeType: "increase",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Tổng quan hệ thống quản lý thiết bị và bảo dưỡng
        </p>
      </div>

      {(dashboardData?.overdueMaintenances > 0 ||
        dashboardData?.lowStockMaterials > 0) && (
        <div className="space-y-4">
          {dashboardData?.overdueMaintenances > 0 && (
            <AlertBanner
              type="warning"
              icon={ExclamationTriangleIcon}
              title="Cảnh báo bảo dưỡng"
              message={`Có ${dashboardData.overdueMaintenances} thiết bị cần bảo dưỡng khẩn cấp`}
              action={{
                text: "Xem chi tiết",
                href: "/maintenance-tickets?status=overdue",
              }}
            />
          )}
          {dashboardData?.lowStockMaterials > 0 && (
            <AlertBanner
              type="error"
              icon={CubeIcon}
              title="Cảnh báo vật tư"
              message={`Có ${dashboardData.lowStockMaterials} loại vật tư sắp hết hàng`}
              action={{
                text: "Quản lý vật tư",
                href: "/materials?filter=low-stock",
              }}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Trạng thái thiết bị"
          type="doughnut"
          data={{
            labels: ["Hoạt động", "Bảo dưỡng", "Sửa chữa", "Ngừng hoạt động"],
            datasets: [
              {
                data: [65, 15, 12, 8],
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#6b7280"],
                borderWidth: 0,
              },
            ],
          }}
        />
        <ChartCard
          title="Xu hướng 6 tháng"
          type="line"
          data={{
            labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
            datasets: [
              {
                label: "Bảo dưỡng",
                data: [30, 45, 32, 48, 42, 38],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
              },
              {
                label: "Sửa chữa",
                data: [15, 22, 18, 25, 20, 23],
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                tension: 0.4,
              },
            ],
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivities
            activities={dashboardData?.recentActivities || []}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
              Tạo phiếu bảo dưỡng
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Tạo phiếu sửa chữa
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              <CubeIcon className="w-4 h-4 mr-2" />
              Thêm thiết bị mới
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              Xem báo cáo
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Cảnh báo gần đây
            </h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">Thiết bị EQ001 cần bảo dưỡng</p>
                  <p className="text-gray-500">2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">Vật tư VT003 sắp hết hàng</p>
                  <p className="text-gray-500">4 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">Hoàn thành bảo dưỡng EQ012</p>
                  <p className="text-gray-500">6 giờ trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
