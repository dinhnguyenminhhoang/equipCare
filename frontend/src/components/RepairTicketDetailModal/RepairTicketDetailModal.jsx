import { useState, useEffect } from "react";
import { Tabs, message, Tooltip, Modal as AntModal } from "antd";
import {
  CalendarIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "../Common/Button/Button";
import Modal from "../Common/Modal/Modal";
import AddMaterialModal from "../AddMaterialModal/AddMaterialModal";
import AddExternalServiceModal from "../AddExternalServiceModal/AddExternalServiceModal";
import {
  addMaterialToRepair,
  addExternalService,
} from "../../services/repairTicketService";
import { useAuth } from "../../context/AuthContext";

const { TabPane } = Tabs;
const { confirm } = AntModal;

const RepairTicketDetailModal = ({ ticket, isOpen, onClose, onRefresh }) => {
  const { isAdmin, isManager, user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Chờ xử lý",
        icon: ClockIcon,
      },
      DIAGNOSED: {
        color: "bg-purple-100 text-purple-800",
        text: "Đã chẩn đoán",
        icon: CheckCircleIcon,
      },
      IN_PROGRESS: {
        color: "bg-blue-100 text-blue-800",
        text: "Đang sửa chữa",
        icon: WrenchScrewdriverIcon,
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        text: "Hoàn thành",
        icon: CheckCircleIcon,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        text: "Đã hủy",
        icon: XMarkIcon,
      },
      ON_HOLD: {
        color: "bg-gray-100 text-gray-800",
        text: "Tạm dừng",
        icon: PauseIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: { color: "bg-gray-100 text-gray-800", text: "Thấp" },
      MEDIUM: { color: "bg-blue-100 text-blue-800", text: "Trung bình" },
      HIGH: { color: "bg-orange-100 text-orange-800", text: "Cao" },
      CRITICAL: { color: "bg-red-100 text-red-800", text: "Khẩn cấp" },
    };

    const config = priorityConfig[priority] || priorityConfig.MEDIUM;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      MINOR: { color: "bg-green-100 text-green-800", text: "Nhỏ" },
      MODERATE: { color: "bg-yellow-100 text-yellow-800", text: "Vừa" },
      MAJOR: { color: "bg-orange-100 text-orange-800", text: "Lớn" },
      CRITICAL: { color: "bg-red-100 text-red-800", text: "Nghiêm trọng" },
    };

    const config = severityConfig[severity] || severityConfig.MODERATE;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      BREAKDOWN: { color: "bg-red-100 text-red-800", text: "Hỏng hóc" },
      CORRECTIVE: { color: "bg-orange-100 text-orange-800", text: "Khắc phục" },
      EMERGENCY: { color: "bg-red-100 text-red-800", text: "Khẩn cấp" },
      WARRANTY: { color: "bg-green-100 text-green-800", text: "Bảo hành" },
      OVERHAUL: { color: "bg-purple-100 text-purple-800", text: "Đại tu" },
    };

    const config = typeConfig[type] || typeConfig.CORRECTIVE;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0 VNĐ";
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

  const handleAddMaterial = async (materialData) => {
    try {
      await addMaterialToRepair(ticket._id, materialData);
      message.success("Thêm vật tư thành công");
      setIsAddMaterialModalOpen(false);
      onRefresh && onRefresh();
    } catch (error) {
      message.error("Lỗi khi thêm vật tư");
      throw error;
    }
  };

  const handleAddExternalService = async (serviceData) => {
    try {
      await addExternalService(ticket._id, serviceData);
      message.success("Thêm dịch vụ bên ngoài thành công");
      setIsAddServiceModalOpen(false);
      onRefresh && onRefresh();
    } catch (error) {
      message.error("Lỗi khi thêm dịch vụ bên ngoài");
      throw error;
    }
  };

  const handleRemoveMaterial = (materialIndex, materialName) => {
    confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa vật tư "${materialName}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        // TODO: Implement remove material API
        message.info(
          "Tính năng xóa vật tư sẽ được cập nhật trong phiên bản tiếp theo"
        );
      },
    });
  };

  const handleRemoveService = (serviceIndex, serviceName) => {
    confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa dịch vụ "${serviceName}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        message.info(
          "Tính năng xóa dịch vụ sẽ được cập nhật trong phiên bản tiếp theo"
        );
      },
    });
  };

  const canAddMaterials = () => {
    return (
      ticket?.status === "IN_PROGRESS" &&
      (ticket?.assignedTo?._id === user?.userId || isAdmin() || isManager())
    );
  };

  const canAddServices = () => {
    return (
      ticket?.status === "IN_PROGRESS" &&
      (ticket?.assignedTo?._id === user?.userId || isAdmin() || isManager())
    );
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
          icon={DocumentTextIcon}
          label="Số phiếu"
          value={ticket?.ticketNumber}
          valueClassName="font-semibold text-blue-600"
        />

        <InfoItem
          icon={CogIcon}
          label="Thiết bị"
          value={`${ticket?.equipment?.equipmentCode} - ${ticket?.equipment?.name}`}
          valueClassName="font-medium"
        />

        <div className="flex items-start space-x-3">
          <ExclamationCircleIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
            <div className="mt-1">{getStatusBadge(ticket?.status)}</div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">Mức độ ưu tiên</p>
            <div className="mt-1">{getPriorityBadge(ticket?.priority)}</div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <ExclamationCircleIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">
              Mức độ nghiêm trọng
            </p>
            <div className="mt-1">{getSeverityBadge(ticket?.severity)}</div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">Loại sửa chữa</p>
            <div className="mt-1">{getTypeBadge(ticket?.type)}</div>
          </div>
        </div>

        <InfoItem
          icon={DocumentTextIcon}
          label="Loại hỏng hóc"
          value={ticket?.failureType}
        />
      </InfoSection>

      <InfoSection title="Thông tin nhân sự và thời gian">
        <InfoItem
          icon={UserIcon}
          label="Người báo cáo"
          value={ticket?.requestedBy?.username}
        />

        <InfoItem
          icon={UserIcon}
          label="Người được giao"
          value={ticket?.assignedTo?.username}
        />

        <InfoItem
          icon={UserIcon}
          label="Người phê duyệt"
          value={ticket?.approvedBy?.username}
        />

        <InfoItem
          icon={CalendarIcon}
          label="Ngày báo cáo"
          value={formatDateTime(ticket?.reportedDate)}
        />

        <InfoItem
          icon={CalendarIcon}
          label="Ngày lên lịch"
          value={formatDateTime(ticket?.scheduledDate)}
        />

        <InfoItem
          icon={CalendarIcon}
          label="Ngày bắt đầu thực tế"
          value={formatDateTime(ticket?.actualStartDate)}
        />

        <InfoItem
          icon={CalendarIcon}
          label="Ngày hoàn thành thực tế"
          value={formatDateTime(ticket?.actualEndDate)}
        />
      </InfoSection>
    </div>
  );

  const ProblemTab = () => (
    <div className="space-y-8">
      <InfoSection title="Mô tả vấn đề">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {ticket?.problemDescription}
          </p>
        </div>
      </InfoSection>

      {ticket?.symptomDetails && (
        <InfoSection title="Chi tiết triệu chứng">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket?.symptomDetails}
            </p>
          </div>
        </InfoSection>
      )}

      {ticket?.rootCause && (
        <InfoSection title="Nguyên nhân gốc">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket?.rootCause}
            </p>
          </div>
        </InfoSection>
      )}

      {ticket?.diagnosisDetails && (
        <InfoSection title="Chi tiết chẩn đoán">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket?.diagnosisDetails}
            </p>
          </div>
        </InfoSection>
      )}

      {ticket?.solutionDescription && (
        <InfoSection title="Mô tả giải pháp">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket?.solutionDescription}
            </p>
          </div>
        </InfoSection>
      )}

      {ticket?.workPerformed && (
        <InfoSection title="Công việc đã thực hiện">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket?.workPerformed}
            </p>
          </div>
        </InfoSection>
      )}
    </div>
  );

  const MaterialsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Vật tư đã sử dụng</h4>
        {canAddMaterials() && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddMaterialModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Thêm vật tư
          </Button>
        )}
      </div>

      {ticket?.materialsUsed?.length > 0 ? (
        <div className="space-y-4">
          {ticket.materialsUsed.map((material, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {material.material?.materialCode}
                    </h5>
                    {material.isWarrantyItem && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        Bảo hành
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {material.material?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Số lượng:</span>{" "}
                      {material.quantityUsed} {material.material?.unit}
                    </div>
                    <div>
                      <span className="font-medium">Đơn giá:</span>{" "}
                      {formatCurrency(material.unitPrice)}
                    </div>
                    <div>
                      <span className="font-medium">Thành tiền:</span>{" "}
                      {formatCurrency(material.totalCost)}
                    </div>
                    <div>
                      <span className="font-medium">Người cấp:</span>{" "}
                      {material.issuedBy?.username}
                    </div>
                  </div>
                </div>
                {canAddMaterials() && (
                  <Tooltip title="Xóa vật tư">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMaterial(index, material.material?.name)
                      }
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Chưa sử dụng vật tư nào</p>
          {canAddMaterials() && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setIsAddMaterialModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm vật tư đầu tiên
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const CostTab = () => (
    <div className="space-y-8">
      <InfoSection title="Chi phí sửa chữa">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoItem
              icon={CurrencyDollarIcon}
              label="Chi phí vật tư"
              value={formatCurrency(ticket?.costs?.materialCost)}
              valueClassName="font-medium text-green-600"
            />

            <InfoItem
              icon={CurrencyDollarIcon}
              label="Chi phí nhân công"
              value={formatCurrency(ticket?.costs?.laborCost)}
              valueClassName="font-medium text-blue-600"
            />

            <InfoItem
              icon={CurrencyDollarIcon}
              label="Chi phí dịch vụ bên ngoài"
              value={formatCurrency(ticket?.costs?.externalServiceCost)}
              valueClassName="font-medium text-purple-600"
            />

            <InfoItem
              icon={CurrencyDollarIcon}
              label="Chi phí khác"
              value={formatCurrency(ticket?.costs?.overheadCost)}
              valueClassName="font-medium text-orange-600"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">
                  Tổng chi phí:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(ticket?.costs?.totalCost)}
                </span>
              </div>
            </div>

            <InfoItem
              icon={ClockIcon}
              label="Tổng thời gian dừng máy"
              value={
                ticket?.downtime?.totalDowntime
                  ? `${ticket.downtime.totalDowntime} giờ`
                  : "0 giờ"
              }
              valueClassName="font-medium text-red-600"
            />

            <InfoItem
              icon={CurrencyDollarIcon}
              label="Tổn thất sản xuất"
              value={formatCurrency(ticket?.downtime?.productionLoss)}
              valueClassName="font-medium text-red-600"
            />
          </div>
        </div>
      </InfoSection>

      {ticket?.externalServices?.length > 0 && (
        <InfoSection title="Dịch vụ bên ngoài">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium text-gray-900">
              Danh sách dịch vụ
            </span>
            {canAddServices() && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddServiceModalOpen(true)}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Thêm dịch vụ
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {ticket.externalServices.map((service, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">
                      {service.serviceName}
                    </h5>
                    <p className="text-sm text-gray-600">{service.provider}</p>
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(service.cost)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(service.serviceDate)}
                    </p>
                  </div>
                  {canAddServices() && (
                    <Tooltip title="Xóa dịch vụ">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveService(index, service.serviceName)
                        }
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoSection>
      )}

      {!ticket?.externalServices?.length && canAddServices() && (
        <InfoSection title="Dịch vụ bên ngoài">
          <div className="text-center py-8">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Chưa có dịch vụ bên ngoài nào
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setIsAddServiceModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm dịch vụ đầu tiên
            </Button>
          </div>
        </InfoSection>
      )}
    </div>
  );

  if (!ticket) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Chi tiết phiếu sửa chữa: {ticket.ticketNumber}
              </h3>
              <p className="text-sm text-gray-500">
                {ticket.equipment?.equipmentCode} - {ticket.equipment?.name}
              </p>
            </div>
          </div>
        }
        size="full"
        footer={
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Cập nhật lần cuối: {formatDateTime(ticket.updatedAt)}
            </div>
            <div className="flex space-x-2">
              <Button onClick={onClose} variant="secondary">
                Đóng
              </Button>
            </div>
          </div>
        }
      >
        <div className="max-h-[75vh] overflow-y-auto">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="repair-ticket-detail-tabs"
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
                  <ExclamationCircleIcon className="w-4 h-4" />
                  <span>Vấn đề & Giải pháp</span>
                </span>
              }
              key="problem"
            >
              <div className="py-4">
                <ProblemTab />
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <CogIcon className="w-4 h-4" />
                  <span>Vật tư sử dụng</span>
                  {ticket.materialsUsed?.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {ticket.materialsUsed.length}
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
          </Tabs>
        </div>
      </Modal>

      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        onSubmit={handleAddMaterial}
        ticketId={ticket._id}
      />

      <AddExternalServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSubmit={handleAddExternalService}
        ticketId={ticket._id}
      />
    </>
  );
};

export default RepairTicketDetailModal;
