import { ClockIcon } from "@heroicons/react/24/outline";

const RecentActivities = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "MAINTENANCE":
        return "🔧";
      case "REPAIR":
        return "🔨";
      case "INVENTORY":
        return "📦";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "MAINTENANCE":
        return "bg-blue-100 text-blue-800";
      case "REPAIR":
        return "bg-red-100 text-red-800";
      case "INVENTORY":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.ticketNumber && `${activity.ticketNumber} - `}
                    {activity.equipment
                      ? `${activity.equipment.equipmentCode} (${activity.equipment.name})`
                      : activity.material
                      ? `${activity.material.materialCode} (${activity.material.name})`
                      : "Hoạt động hệ thống"}
                  </p>
                  {activity.status && (
                    <p
                      className={`text-sm font-medium ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default RecentActivities;
