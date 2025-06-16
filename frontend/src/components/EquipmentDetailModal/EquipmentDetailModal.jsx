import { useState, useEffect } from "react";
import { Tabs } from "antd";
import {
  CalendarIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import {
  getMaintenanceHistory,
  getRepairHistory,
} from "../../services/equipmentService";
import Button from "../Common/Button/Button";
import Modal from "../Common/Modal/Modal";

const { TabPane } = Tabs;

const EquipmentDetailModal = ({ equipment, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [repairHistory, setRepairHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && equipment) {
      fetchHistories();
    }
  }, [isOpen, equipment]);

  const fetchHistories = async () => {
    if (!equipment?._id) return;

    setLoading(true);
    try {
      const [maintenanceRes, repairRes] = await Promise.all([
        getMaintenanceHistory(equipment._id, { limit: 10 }),
        getRepairHistory(equipment._id, { limit: 10 }),
      ]);

      setMaintenanceHistory(maintenanceRes.data || []);
      setRepairHistory(repairRes.data || []);
    } catch (error) {
      console.error("Error fetching histories:", error);
      setMaintenanceHistory([]);
      setRepairHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-100 text-green-800",
        text: "Hoạt động",
        icon: CheckCircleIcon,
      },
      MAINTENANCE: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Bảo dưỡng",
        icon: WrenchScrewdriverIcon,
      },
      REPAIR: {
        color: "bg-red-100 text-red-800",
        text: "Sửa chữa",
        icon: ExclamationCircleIcon,
      },
      INACTIVE: {
        color: "bg-gray-100 text-gray-800",
        text: "Ngừng hoạt động",
        icon: PauseIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const getTicketStatusBadge = (status, type = "maintenance") => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
      IN_PROGRESS: {
        color: "bg-blue-100 text-blue-800",
        text: type === "repair" ? "Đang sửa chữa" : "Đang thực hiện",
      },
      COMPLETED: { color: "bg-green-100 text-green-800", text: "Hoàn thành" },
      CANCELLED: { color: "bg-red-100 text-red-800", text: "Đã hủy" },
      ON_HOLD: { color: "bg-gray-100 text-gray-800", text: "Tạm dừng" },
      DIAGNOSED: {
        color: "bg-purple-100 text-purple-800",
        text: "Đã chẩn đoán",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "Chưa có thông tin";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const BasicInfoTab = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <InfoSection title="Thông tin cơ bản">
        <InfoItem
          icon={TruckIcon}
          label="Mã thiết bị"
          value={equipment?.equipmentCode}
          valueClassName="font-semibold text-blue-600"
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Tên thiết bị"
          value={equipment?.name}
          valueClassName="font-medium"
        />

        <InfoItem
          icon={CogIcon}
          label="Loại thiết bị"
          value={equipment?.type}
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Model"
          value={equipment?.model}
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Thương hiệu"
          value={equipment?.brand}
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Số serial"
          value={equipment?.serialNumber}
        />

        <div className="flex items-start space-x-3">
          <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
            <div className="mt-1">{getStatusBadge(equipment?.status)}</div>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Thông tin vận hành">
        <InfoItem
          icon={ClockIcon}
          label="Số giờ hoạt động"
          value={
            equipment?.operatingHours
              ? `${equipment.operatingHours.toLocaleString()} giờ`
              : "0 giờ"
          }
          valueClassName="font-medium text-orange-600"
        />

        <InfoItem
          icon={MapPinIcon}
          label="Vị trí"
          value={equipment?.location}
        />

        <InfoItem
          icon={UserIcon}
          label="Người được giao"
          value={equipment?.assignedTo?.username}
        />

        <InfoItem
          icon={CalendarIcon}
          label="Ngày cung cấp"
          value={formatDate(equipment?.suppliedDate)}
        />

        <InfoItem
          icon={CurrencyDollarIcon}
          label="Giá mua"
          value={formatCurrency(equipment?.purchasePrice)}
          valueClassName="font-medium text-green-600"
        />

        <InfoItem
          icon={CurrencyDollarIcon}
          label="Giá trị hiện tại"
          value={formatCurrency(equipment?.currentValue)}
          valueClassName="font-medium text-green-600"
        />
      </InfoSection>
    </div>
  );

  const SpecificationsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <InfoSection title="Thông số kỹ thuật">
          <InfoItem
            icon={CogIcon}
            label="Sức chứa"
            value={
              equipment?.specifications?.capacity
                ? `${equipment.specifications.capacity.toLocaleString()} kg`
                : null
            }
          />

          <InfoItem
            icon={DocumentTextIcon}
            label="Loại nhiên liệu"
            value={equipment?.specifications?.fuelType}
          />

          <InfoItem
            icon={CogIcon}
            label="Công suất động cơ"
            value={
              equipment?.specifications?.enginePower
                ? `${equipment.specifications.enginePower} HP`
                : null
            }
          />

          <InfoItem
            icon={CogIcon}
            label="Chiều cao nâng tối đa"
            value={
              equipment?.specifications?.maxLiftHeight
                ? `${equipment.specifications.maxLiftHeight} m`
                : null
            }
          />
        </InfoSection>

        <InfoSection title="Thông tin bảo hành">
          <InfoItem
            icon={CalendarIcon}
            label="Ngày bắt đầu bảo hành"
            value={formatDate(equipment?.warrantyInfo?.warrantyStartDate)}
          />

          <InfoItem
            icon={CalendarIcon}
            label="Ngày kết thúc bảo hành"
            value={formatDate(equipment?.warrantyInfo?.warrantyEndDate)}
          />

          <InfoItem
            icon={DocumentTextIcon}
            label="Nhà cung cấp bảo hành"
            value={equipment?.warrantyInfo?.warrantyProvider}
          />

          {equipment?.warrantyInfo?.warrantyEndDate && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700">
                Tình trạng bảo hành:{" "}
                <span
                  className={
                    new Date(equipment.warrantyInfo.warrantyEndDate) >
                    new Date()
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {new Date(equipment.warrantyInfo.warrantyEndDate) > new Date()
                    ? "Còn hiệu lực"
                    : "Đã hết hạn"}
                </span>
              </p>
            </div>
          )}
        </InfoSection>
      </div>

      {equipment?.notes && (
        <InfoSection title="Ghi chú">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {equipment.notes}
            </p>
          </div>
        </InfoSection>
      )}
    </div>
  );

  const MaintenanceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Lịch sử bảo dưỡng</h4>
        <Button size="sm" variant="outline">
          Xem tất cả
        </Button>
      </div>

      {equipment?.maintenance && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-blue-50 rounded-lg">
          <InfoItem
            icon={CalendarIcon}
            label="Bảo dưỡng lần cuối"
            value={formatDate(equipment.maintenance.lastMaintenanceDate)}
          />

          <InfoItem
            icon={CalendarIcon}
            label="Bảo dưỡng tiếp theo"
            value={formatDate(equipment.maintenance.nextMaintenanceDate)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            Đang tải lịch sử bảo dưỡng...
          </p>
        </div>
      ) : maintenanceHistory.length > 0 ? (
        <div className="space-y-4">
          {maintenanceHistory.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {item.ticketNumber}
                    </h5>
                    {getTicketStatusBadge(item.status, "maintenance")}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {formatDate(item.createdAt)}
                    </div>
                    {item.scheduledDate && (
                      <div>
                        <span className="font-medium">Ngày lên lịch:</span>{" "}
                        {formatDate(item.scheduledDate)}
                      </div>
                    )}
                    {item.assignedTo && (
                      <div>
                        <span className="font-medium">Người thực hiện:</span>{" "}
                        {item.assignedTo.username}
                      </div>
                    )}
                    {item.costs?.totalCost > 0 && (
                      <div>
                        <span className="font-medium">Chi phí:</span>{" "}
                        {formatCurrency(item.costs.totalCost)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {item.type && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {item.type === "PREVENTIVE"
                      ? "Phòng ngừa"
                      : item.type === "CORRECTIVE"
                      ? "Khắc phục"
                      : item.type === "EMERGENCY"
                      ? "Khẩn cấp"
                      : "Đã lên lịch"}
                  </span>
                  {item.priority && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        item.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : item.priority === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : item.priority === "MEDIUM"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.priority === "CRITICAL"
                        ? "Khẩn cấp"
                        : item.priority === "HIGH"
                        ? "Cao"
                        : item.priority === "MEDIUM"
                        ? "Trung bình"
                        : "Thấp"}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Chưa có lịch sử bảo dưỡng
          </p>
          <p className="text-xs text-gray-400">
            Thiết bị này chưa được bảo dưỡng lần nào
          </p>
        </div>
      )}
    </div>
  );

  const RepairTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Lịch sử sửa chữa</h4>
        <Button size="sm" variant="outline">
          Xem tất cả
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            Đang tải lịch sử sửa chữa...
          </p>
        </div>
      ) : repairHistory.length > 0 ? (
        <div className="space-y-4">
          {repairHistory.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {item.ticketNumber}
                    </h5>
                    {getTicketStatusBadge(item.status, "repair")}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Vấn đề:</span>{" "}
                    {item.problemDescription}
                  </p>
                  {item.rootCause && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Nguyên nhân:</span>{" "}
                      {item.rootCause}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Ngày báo cáo:</span>{" "}
                      {formatDate(item.reportedDate)}
                    </div>
                    {item.actualStartDate && (
                      <div>
                        <span className="font-medium">Ngày bắt đầu:</span>{" "}
                        {formatDate(item.actualStartDate)}
                      </div>
                    )}
                    {item.actualEndDate && (
                      <div>
                        <span className="font-medium">Ngày hoàn thành:</span>{" "}
                        {formatDate(item.actualEndDate)}
                      </div>
                    )}
                    {item.assignedTo && (
                      <div>
                        <span className="font-medium">Người thực hiện:</span>{" "}
                        {item.assignedTo.username}
                      </div>
                    )}
                    {item.costs?.totalCost > 0 && (
                      <div>
                        <span className="font-medium">Chi phí:</span>{" "}
                        {formatCurrency(item.costs.totalCost)}
                      </div>
                    )}
                    {item.downtime?.totalDowntime > 0 && (
                      <div>
                        <span className="font-medium">Thời gian dừng:</span>{" "}
                        {item.downtime.totalDowntime} giờ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                {item.type && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    {item.type === "BREAKDOWN"
                      ? "Hỏng hóc"
                      : item.type === "CORRECTIVE"
                      ? "Khắc phục"
                      : item.type === "EMERGENCY"
                      ? "Khẩn cấp"
                      : item.type === "WARRANTY"
                      ? "Bảo hành"
                      : "Đại tu"}
                  </span>
                )}
                {item.severity && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      item.severity === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : item.severity === "MAJOR"
                        ? "bg-orange-100 text-orange-800"
                        : item.severity === "MODERATE"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.severity === "CRITICAL"
                      ? "Nghiêm trọng"
                      : item.severity === "MAJOR"
                      ? "Lớn"
                      : item.severity === "MODERATE"
                      ? "Vừa"
                      : "Nhỏ"}
                  </span>
                )}
                {item.failureType && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {item.failureType}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Chưa có lịch sử sửa chữa</p>
          <p className="text-xs text-gray-400">
            Thiết bị này chưa được sửa chữa lần nào
          </p>
        </div>
      )}
    </div>
  );

  if (!equipment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <TruckIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết thiết bị: {equipment.equipmentCode}
            </h3>
            <p className="text-sm text-gray-500">{equipment.name}</p>
          </div>
        </div>
      }
      size="full"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {formatDateTime(equipment.updatedAt)}
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
          className="equipment-detail-tabs"
          size="large"
        >
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4" />
                <span>Thông tin cơ bản</span>
              </span>
            }
            key="info"
          >
            <div className="py-4">
              <BasicInfoTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CogIcon className="w-4 h-4" />
                <span>Thông số kỹ thuật</span>
              </span>
            }
            key="specifications"
          >
            <div className="py-4">
              <SpecificationsTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="w-4 h-4" />
                <span>Lịch sử bảo dưỡng</span>
                {maintenanceHistory.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {maintenanceHistory.length}
                  </span>
                )}
              </span>
            }
            key="maintenance"
          >
            <div className="py-4">
              <MaintenanceTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ExclamationCircleIcon className="w-4 h-4" />
                <span>Lịch sử sửa chữa</span>
                {repairHistory.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {repairHistory.length}
                  </span>
                )}
              </span>
            }
            key="repair"
          >
            <div className="py-4">
              <RepairTab />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default EquipmentDetailModal;
