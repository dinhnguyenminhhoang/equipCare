const ticketStatuses = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "ON_HOLD", label: "Tạm dừng" },
];

const ticketPriorities = [
  { value: "", label: "Tất cả độ ưu tiên" },
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Khẩn cấp" },
];

const ticketTypes = [
  { value: "", label: "Tất cả loại" },
  { value: "PREVENTIVE", label: "Phòng ngừa" },
  { value: "CORRECTIVE", label: "Khắc phục" },
  { value: "EMERGENCY", label: "Khẩn cấp" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
];

const getStatusText = (status) => {
  const statusText = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang thực hiện",
    APPROVED: "Đã duyệt",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    ON_HOLD: "Tạm dừng",
  };
  return statusText[status] || status;
};

const getPriorityColor = (priority) => {
  const priorityColors = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };
  return priorityColors[priority] || "bg-gray-100 text-gray-800";
};
const getStatusColor = (status) => {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    APPROVED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    ON_HOLD: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

const getPriorityText = (priority) => {
  const priorityText = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
    CRITICAL: "Khẩn cấp",
  };
  return priorityText[priority] || priority;
};
const typeOptions = [
  { value: "PREVENTIVE", label: "Bảo dưỡng phòng ngừa" },
  { value: "CORRECTIVE", label: "Bảo dưỡng khắc phục" },
  { value: "EMERGENCY", label: "Bảo dưỡng khẩn cấp" },
  { value: "SCHEDULED", label: "Bảo dưỡng theo lịch" },
];

const priorityOptions = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Khẩn cấp" },
];
const failureTypes = [
  { value: "", label: "Chọn loại hỏng hóc" },
  { value: "MECHANICAL", label: "Cơ khí" },
  { value: "ELECTRICAL", label: "Điện" },
  { value: "HYDRAULIC", label: "Thủy lực" },
  { value: "ENGINE", label: "Động cơ" },
  { value: "TRANSMISSION", label: "Hộp số" },
  { value: "BRAKE_SYSTEM", label: "Hệ thống phanh" },
  { value: "COOLING_SYSTEM", label: "Hệ thống làm mát" },
  { value: "FUEL_SYSTEM", label: "Hệ thống nhiên liệu" },
  { value: "COMPUTER_SYSTEM", label: "Hệ thống máy tính" },
  { value: "OTHER", label: "Khác" },
];
const severities = [
  { value: "MINOR", label: "Nhỏ" },
  { value: "MODERATE", label: "Vừa" },
  { value: "MAJOR", label: "Lớn" },
  { value: "CRITICAL", label: "Nghiêm trọng" },
];
const repairTypes = [
  { value: "BREAKDOWN", label: "Hỏng hóc" },
  { value: "CORRECTIVE", label: "Khắc phục" },
  { value: "EMERGENCY", label: "Khẩn cấp" },
  { value: "WARRANTY", label: "Bảo hành" },
  { value: "OVERHAUL", label: "Đại tu" },
];

const priorities = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Khẩn cấp" },
];
export const statusText = {
  ACTIVE: "Hoạt động",
  MAINTENANCE: "Bảo dưỡng",
  REPAIR: "Sửa chữa",
  INACTIVE: "Ngừng hoạt động",
};
const statusTextOption = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "MAINTENANCE", label: "Bảo dưỡng" },
  { value: "REPAIR", label: "Sửa chữa" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
];
export {
  ticketStatuses,
  ticketPriorities,
  ticketTypes,
  getStatusText,
  getPriorityColor,
  getPriorityText,
  getStatusColor,
  typeOptions,
  priorityOptions,
  failureTypes,
  severities,
  repairTypes,
  priorities,
  statusTextOption,
};
