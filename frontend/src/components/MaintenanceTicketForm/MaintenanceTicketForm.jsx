import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEquipments } from "../../services/equipmentService";
import { getMaintenanceLevels } from "../../services/maintenanceLevelService";
import { getUsers } from "../../services/userService";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";

const MaintenanceTicketForm = ({ initialData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    equipment: "",
    maintenanceLevel: "",
    type: "PREVENTIVE",
    priority: "MEDIUM",
    scheduledDate: "",
    assignedTo: "",
    description: "",
    workDescription: "",
  });

  const [equipments, setEquipments] = useState([]);
  const [maintenanceLevels, setMaintenanceLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedMaintenanceLevel, setSelectedMaintenanceLevel] =
    useState(null);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipment: initialData.equipment?._id || "",
        maintenanceLevel: initialData.maintenanceLevel?._id || "",
        type: initialData.type || "PREVENTIVE",
        priority: initialData.priority || "MEDIUM",
        scheduledDate: initialData.scheduledDate
          ? new Date(initialData.scheduledDate).toISOString().split("T")[0]
          : "",
        assignedTo: initialData.assignedTo?._id || "",
        description: initialData.description || "",
        workDescription: initialData.workDescription || "",
      });

      if (initialData.equipment) {
        setSelectedEquipment(initialData.equipment);
      }
      if (initialData.maintenanceLevel) {
        setSelectedMaintenanceLevel(initialData.maintenanceLevel);
      }
    }
  }, [initialData]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [equipmentRes, levelRes, userRes] = await Promise.all([
        getEquipments({ limit: 100, status: "ACTIVE" }),
        getMaintenanceLevels({ limit: 100 }),
        getUsers({ limit: 100, roles: "TECHNICIAN,MANAGER" }),
      ]);
      console.log("Equipment data:", equipmentRes);
      setEquipments(equipmentRes.data?.data || []);
      setMaintenanceLevels(levelRes.data?.data || []);
      setUsers(userRes.data?.data || []);
    } catch (error) {
      console.error("Error loading form data:", error);
      message.error("Lỗi khi tải dữ liệu form");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Handle equipment selection
    if (name === "equipment") {
      const equipment = equipments.find((eq) => eq._id === value);
      setSelectedEquipment(equipment);
    }

    // Handle maintenance level selection
    if (name === "maintenanceLevel") {
      const level = maintenanceLevels.find((lv) => lv._id === value);
      setSelectedMaintenanceLevel(level);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.equipment) {
      newErrors.equipment = "Vui lòng chọn thiết bị";
    }

    if (!formData.maintenanceLevel) {
      newErrors.maintenanceLevel = "Vui lòng chọn cấp bảo dưỡng";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả công việc";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Vui lòng chọn ngày dự kiến thực hiện";
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.scheduledDate = "Ngày thực hiện không được trong quá khứ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      message.success(
        initialData
          ? "Cập nhật phiếu bảo dưỡng thành công"
          : "Tạo phiếu bảo dưỡng thành công"
      );
    } catch (error) {
      console.error("Submit error:", error);
      message.error(
        initialData
          ? "Lỗi khi cập nhật phiếu bảo dưỡng"
          : "Lỗi khi tạo phiếu bảo dưỡng"
      );
    } finally {
      setLoading(false);
    }
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

  const getEstimatedDuration = () => {
    if (selectedMaintenanceLevel?.estimatedDuration) {
      return `${selectedMaintenanceLevel.estimatedDuration} giờ`;
    }
    return "Chưa xác định";
  };

  const getEstimatedCost = () => {
    if (selectedMaintenanceLevel?.estimatedCost?.totalCost) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(selectedMaintenanceLevel.estimatedCost.totalCost);
    }
    return "Chưa xác định";
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment and Maintenance Level Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thiết bị <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.equipment}
              onChange={(value) => handleChange("equipment", value)}
              options={[
                { value: "", label: "Chọn thiết bị..." },
                ...equipments.map((eq) => ({
                  value: eq._id,
                  label: `${eq.equipmentCode} - ${eq.name}`,
                })),
              ]}
              error={errors.equipment}
            />
            {selectedEquipment && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    {selectedEquipment.equipmentCode} - {selectedEquipment.name}
                  </div>
                  <div className="text-blue-700 mt-1">
                    Loại: {selectedEquipment.type} • Trạng thái:{" "}
                    {selectedEquipment.status} • Giờ hoạt động:{" "}
                    {selectedEquipment.operatingHours || 0}h
                  </div>
                  {selectedEquipment.location && (
                    <div className="text-blue-600">
                      Vị trí: {selectedEquipment.location}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp bảo dưỡng <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.maintenanceLevel}
              onChange={(value) => handleChange("maintenanceLevel", value)}
              options={[
                { value: "", label: "Chọn cấp bảo dưỡng..." },
                ...maintenanceLevels.map((level) => ({
                  value: level._id,
                  label: `${level.name} (${level.intervalHours}h)`,
                })),
              ]}
              error={errors.maintenanceLevel}
            />
            {selectedMaintenanceLevel && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm">
                  <div className="font-medium text-green-900">
                    {selectedMaintenanceLevel.name}
                  </div>
                  <div className="text-green-700 mt-1">
                    Chu kỳ: {selectedMaintenanceLevel.intervalHours}h
                  </div>
                  <div className="text-green-600 text-xs mt-1">
                    Ước tính: {getEstimatedDuration()} • Chi phí:{" "}
                    {getEstimatedCost()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại bảo dưỡng
            </label>
            <Select
              value={formData.type}
              onChange={(value) => handleChange("type", value)}
              options={typeOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ ưu tiên
            </label>
            <Select
              value={formData.priority}
              onChange={(value) => handleChange("priority", value)}
              options={priorityOptions}
            />
          </div>
        </div>

        {/* Scheduled Date and Assigned To */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày dự kiến thực hiện <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => handleChange("scheduledDate", e.target.value)}
              error={errors.scheduledDate}
              min={new Date().toISOString().split("T")[0]}
              icon={CalendarIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người thực hiện
            </label>
            <Select
              value={formData.assignedTo}
              onChange={(value) => handleChange("assignedTo", value)}
              options={[
                { value: "", label: "Chọn người thực hiện..." },
                ...users.map((u) => ({
                  value: u._id,
                  label: `${u.username} (${u.roles?.join(", ") || "User"})`,
                })),
              ]}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả công việc <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.description
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Nhập mô tả chi tiết về công việc bảo dưỡng cần thực hiện..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Work Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hướng dẫn thực hiện
          </label>
          <textarea
            value={formData.workDescription}
            onChange={(e) => handleChange("workDescription", e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Nhập hướng dẫn chi tiết cách thực hiện công việc (tùy chọn)..."
          />
        </div>

        {/* Critical Priority Warning */}
        {formData.priority === "CRITICAL" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div className="text-sm text-red-800">
                <strong>Cảnh báo:</strong> Bảo dưỡng khẩn cấp sẽ được ưu tiên
                cao nhất và có thể ảnh hưởng đến lịch trình các công việc khác.
              </div>
            </div>
          </div>
        )}

        {/* Required Tasks Preview */}
        {selectedMaintenanceLevel?.requiredTasks?.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Các công việc cần thực hiện:
            </h4>
            <div className="space-y-2">
              {selectedMaintenanceLevel.requiredTasks.map((task, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {task.taskName}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600">
                        {task.description}
                      </p>
                    )}
                    {task.estimatedDuration && (
                      <p className="text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        Ước tính: {task.estimatedDuration} phút
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex items-center"
          >
            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
            {initialData ? "Cập nhật phiếu" : "Tạo phiếu bảo dưỡng"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceTicketForm;
