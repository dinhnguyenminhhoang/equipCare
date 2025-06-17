import { useState } from "react";
import { Tabs } from "antd";
import {
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "../Common/Button/Button";
import Modal from "../Common/Modal/Modal";

const { TabPane } = Tabs;

const MaintenanceLevelDetailModal = ({ level, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!level) return null;

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  const getPriorityText = (priority) => {
    const priorityText = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      CRITICAL: "Khẩn cấp",
    };
    return priorityText[priority] || priority;
  };

  const getSkillLevelText = (skillLevel) => {
    const skillLevelText = {
      BASIC: "Cơ bản",
      INTERMEDIATE: "Trung bình",
      ADVANCED: "Nâng cao",
      EXPERT: "Chuyên gia",
    };
    return skillLevelText[skillLevel] || skillLevel;
  };

  const getSkillLevelColor = (skillLevel) => {
    const skillLevelColors = {
      BASIC: "bg-green-100 text-green-800",
      INTERMEDIATE: "bg-blue-100 text-blue-800",
      ADVANCED: "bg-orange-100 text-orange-800",
      EXPERT: "bg-red-100 text-red-800",
    };
    return skillLevelColors[skillLevel] || "bg-gray-100 text-gray-800";
  };

  const getEquipmentTypeText = (type) => {
    const typeText = {
      CRANE: "Cẩu",
      FORKLIFT: "Xe nâng",
      TRACTOR: "Đầu kéo",
      TRUCK: "Xe tải",
      EXCAVATOR: "Máy xúc",
      OTHER: "Khác",
    };
    return typeText[type] || type;
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    className = "",
    valueClassName = "",
  }) => (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-sm text-gray-900 break-words ${valueClassName}`}>
          {value || "Chưa có thông tin"}
        </p>
      </div>
    </div>
  );

  const InfoSection = ({ title, children, className = "" }) => (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h4>
      {children}
    </div>
  );

  const OverviewTab = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <InfoSection title="Thông tin cơ bản">
        <InfoItem
          icon={CogIcon}
          label="Mã cấp bảo dưỡng"
          value={level.levelCode}
          valueClassName="font-semibold text-blue-600"
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Tên cấp bảo dưỡng"
          value={level.name}
          valueClassName="font-medium"
        />

        <InfoItem
          icon={ClockIcon}
          label="Chu kỳ bảo dưỡng"
          value={`${level.intervalHours} giờ`}
          valueClassName="font-medium text-orange-600"
        />

        <div className="flex items-start space-x-3">
          <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">Mức ưu tiên</p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  level.priority
                )}`}
              >
                {getPriorityText(level.priority)}
              </span>
            </div>
          </div>
        </div>

        <InfoItem
          icon={ClockIcon}
          label="Thời gian ước tính"
          value={
            level.estimatedDuration
              ? `${level.estimatedDuration} giờ`
              : "Chưa xác định"
          }
          valueClassName="font-medium text-green-600"
        />

        {level.description && (
          <div>
            <h5 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h5>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {level.description}
              </p>
            </div>
          </div>
        )}
      </InfoSection>

      <InfoSection title="Loại thiết bị áp dụng">
        <div className="flex flex-wrap gap-2">
          {level.equipmentTypes?.map((type, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              {getEquipmentTypeText(type)}
            </span>
          ))}
        </div>
        {(!level.equipmentTypes || level.equipmentTypes.length === 0) && (
          <p className="text-sm text-gray-500">
            Chưa có loại thiết bị nào được chỉ định
          </p>
        )}
      </InfoSection>
    </div>
  );

  const TasksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Danh sách công việc ({level.requiredTasks?.length || 0})
        </h4>
      </div>

      {level.requiredTasks && level.requiredTasks.length > 0 ? (
        <div className="space-y-4">
          {level.requiredTasks.map((task, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="font-semibold text-gray-900">
                        {task.taskName}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Mã: {task.taskCode}
                      </p>
                    </div>
                  </div>

                  {task.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        {task.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Thời gian ước tính:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {task.estimatedDuration
                          ? `${task.estimatedDuration} phút`
                          : "Chưa xác định"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Trình độ yêu cầu:
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(
                          task.skillLevel
                        )}`}
                      >
                        {getSkillLevelText(task.skillLevel)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {task.isRequired ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {task.isRequired ? "Bắt buộc" : "Tùy chọn"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Chưa có công việc nào được định nghĩa
          </p>
        </div>
      )}
    </div>
  );

  const MaterialsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Vật tư cần thiết ({level.requiredMaterials?.length || 0})
        </h4>
      </div>

      {level.requiredMaterials && level.requiredMaterials.length > 0 ? (
        <div className="space-y-4">
          {level.requiredMaterials.map((materialItem, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <CubeIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <h5 className="font-semibold text-gray-900">
                        {materialItem.material?.materialCode ||
                          "Mã không xác định"}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {materialItem.material?.name || "Tên không xác định"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Số lượng cần:
                      </span>
                      <span className="ml-2 text-gray-900 font-semibold">
                        {materialItem.quantity}{" "}
                        {materialItem.material?.unit || ""}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Đơn giá:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {materialItem.material?.unitPrice
                          ? formatCurrency(materialItem.material.unitPrice)
                          : "Chưa có giá"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Thành tiền:
                      </span>
                      <span className="ml-2 text-green-600 font-semibold">
                        {materialItem.material?.unitPrice
                          ? formatCurrency(
                              materialItem.material.unitPrice *
                                materialItem.quantity
                            )
                          : "Chưa tính được"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Tồn kho hiện tại:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {materialItem.material?.currentStock !== undefined
                          ? `${materialItem.material.currentStock} ${
                              materialItem.material?.unit || ""
                            }`
                          : "Không rõ"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        materialItem.isOptional
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {materialItem.isOptional ? "Tùy chọn" : "Bắt buộc"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Tổng chi phí vật tư */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
              <span className="text-lg font-medium text-gray-900">
                Tổng chi phí vật tư:
              </span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(level.estimatedCost?.materialCost || 0)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Chưa có vật tư nào được định nghĩa
          </p>
        </div>
      )}
    </div>
  );

  const CostTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Báo cáo chi phí</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chi phí nhân công */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Chi phí nhân công
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(level.estimatedCost?.laborCost || 0)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        {/* Chi phí vật tư */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Chi phí vật tư
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(level.estimatedCost?.materialCost || 0)}
              </p>
            </div>
            <CubeIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {level.requiredMaterials?.length || 0} loại vật tư
          </div>
        </div>

        {/* Tổng chi phí */}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(level.estimatedCost?.totalCost || 0)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 text-xs text-green-600">
            Ước tính {level.estimatedDuration || 0} giờ
          </div>
        </div>
      </div>

      {/* Phân tích chi phí */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="text-lg font-medium text-gray-900 mb-4">
          Phân tích chi phí
        </h5>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Chi phí nhân công mỗi giờ:
            </span>
            <span className="font-medium text-gray-900">
              {level.estimatedDuration > 0
                ? formatCurrency(
                    (level.estimatedCost?.laborCost || 0) /
                      level.estimatedDuration
                  )
                : "Chưa tính được"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Chi phí vật tư trung bình mỗi loại:
            </span>
            <span className="font-medium text-gray-900">
              {level.requiredMaterials?.length > 0
                ? formatCurrency(
                    (level.estimatedCost?.materialCost || 0) /
                      level.requiredMaterials.length
                  )
                : "Chưa có vật tư"}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-900">
              Tỷ lệ chi phí vật tư / tổng chi phí:
            </span>
            <span className="font-bold text-blue-600">
              {level.estimatedCost?.totalCost > 0
                ? `${Math.round(
                    ((level.estimatedCost?.materialCost || 0) /
                      level.estimatedCost.totalCost) *
                      100
                  )}%`
                : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const SafetyTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Yêu cầu an toàn ({level.safetyRequirements?.length || 0})
        </h4>
      </div>

      {level.safetyRequirements && level.safetyRequirements.length > 0 ? (
        <div className="space-y-3">
          {level.safetyRequirements.map((requirement, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <ShieldExclamationIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{requirement}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Chưa có yêu cầu an toàn nào được định nghĩa
          </p>
          <p className="text-xs text-gray-400">
            Khuyến nghị thêm các yêu cầu an toàn cho cấp bảo dưỡng này
          </p>
        </div>
      )}

      {/* Lời khuyên an toàn chung */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-red-800 mb-2">
          Lưu ý an toàn chung:
        </h5>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Đảm bảo thiết bị đã được tắt và nguội trước khi bảo dưỡng</li>
          <li>• Sử dụng đầy đủ thiết bị bảo hộ cá nhân (PPE)</li>
          <li>• Kiểm tra các công cụ và thiết bị trước khi sử dụng</li>
          <li>• Thực hiện theo đúng quy trình và hướng dẫn kỹ thuật</li>
          <li>• Báo cáo ngay lập tức nếu phát hiện bất thường</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <CogIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết cấp bảo dưỡng: {level.levelCode}
            </h3>
            <p className="text-sm text-gray-500">{level.name}</p>
          </div>
        </div>
      }
      size="full"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối:{" "}
            {new Date(level.updatedAt).toLocaleString("vi-VN")}
          </div>
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="secondary">
              Đóng
            </Button>
            <Button variant="primary">Chỉnh sửa</Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[75vh] overflow-y-auto">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="maintenance-level-detail-tabs"
          size="large"
        >
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4" />
                <span>Tổng quan</span>
              </span>
            }
            key="overview"
          >
            <div className="py-4">
              <OverviewTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>Công việc</span>
                {level.requiredTasks?.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {level.requiredTasks.length}
                  </span>
                )}
              </span>
            }
            key="tasks"
          >
            <div className="py-4">
              <TasksTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CubeIcon className="w-4 h-4" />
                <span>Vật tư</span>
                {level.requiredMaterials?.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {level.requiredMaterials.length}
                  </span>
                )}
              </span>
            }
            key="materials"
          >
            <div className="py-4">
              <MaterialsTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Chi phí</span>
              </span>
            }
            key="cost"
          >
            <div className="py-4">
              <CostTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ShieldExclamationIcon className="w-4 h-4" />
                <span>An toàn</span>
                {level.safetyRequirements?.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                    {level.safetyRequirements.length}
                  </span>
                )}
              </span>
            }
            key="safety"
          >
            <div className="py-4">
              <SafetyTab />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default MaintenanceLevelDetailModal;
