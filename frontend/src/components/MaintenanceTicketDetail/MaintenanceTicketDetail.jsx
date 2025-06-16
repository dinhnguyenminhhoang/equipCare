import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  TruckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Tabs, message } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addMaterialToMaintenance,
  completeMaintenance,
  getMaintenanceTicketById,
  startMaintenance,
  updateMaintenanceTask,
} from "../../services/maintenanceTicketService";
import { getMaterials } from "../../services/materialService";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Modal from "../Common/Modal/Modal";
import Select from "../Common/Select/Select";

const { TabPane } = Tabs;

const MaintenanceTicketDetail = ({ ticket, onClose, onUpdate }) => {
  const { user, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [ticketDetail, setTicketDetail] = useState(ticket);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Form states
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    status: "",
    notes: "",
    assignedTo: "",
  });
  const [materialForm, setMaterialForm] = useState({
    materialId: "",
    quantityUsed: "",
  });
  const [completeForm, setCompleteForm] = useState({
    equipmentHoursAtEnd: "",
    completionNotes: "",
    nextMaintenanceDue: "",
  });

  useEffect(() => {
    if (ticket?._id) {
      fetchTicketDetail();
      fetchMaterials();
    }
  }, [ticket?._id]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceTicketById(ticket._id);
      setTicketDetail(response.data);
    } catch (error) {
      console.error("Error fetching ticket detail:", error);
      message.error("Lỗi khi tải chi tiết phiếu bảo dưỡng");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials({ limit: 100 });
      setMaterials(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleTaskUpdate = async () => {
    try {
      await updateMaintenanceTask(
        ticketDetail._id,
        selectedTask._id,
        taskForm,
        user
      );
      message.success("Cập nhật công việc thành công");
      setIsTaskModalOpen(false);
      fetchTicketDetail();
      onUpdate?.();
    } catch (error) {
      message.error("Lỗi khi cập nhật công việc");
    }
  };

  const handleAddMaterial = async () => {
    try {
      await addMaterialToMaintenance(
        ticketDetail._id,
        {
          materialId: materialForm.materialId,
          quantityUsed: parseInt(materialForm.quantityUsed),
        },
        user
      );
      message.success("Thêm vật tư thành công");
      setIsMaterialModalOpen(false);
      setMaterialForm({ materialId: "", quantityUsed: "" });
      fetchTicketDetail();
      onUpdate?.();
    } catch (error) {
      message.error("Lỗi khi thêm vật tư");
    }
  };

  const handleStartMaintenance = async () => {
    try {
      await startMaintenance(ticketDetail._id, {}, user);
      message.success("Bắt đầu bảo dưỡng thành công");
      setIsStartModalOpen(false);
      fetchTicketDetail();
      onUpdate?.();
    } catch (error) {
      message.error("Lỗi khi bắt đầu bảo dưỡng");
    }
  };

  const handleCompleteMaintenance = async () => {
    try {
      await completeMaintenance(
        ticketDetail._id,
        {
          equipmentHoursAtEnd: parseInt(completeForm.equipmentHoursAtEnd),
          completionNotes: completeForm.completionNotes,
          nextMaintenanceDue: completeForm.nextMaintenanceDue,
        },
        user
      );
      message.success("Hoàn thành bảo dưỡng thành công");
      setIsCompleteModalOpen(false);
      fetchTicketDetail();
      onUpdate?.();
    } catch (error) {
      message.error("Lỗi khi hoàn thành bảo dưỡng");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusText = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang thực hiện",
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditTicket = () => {
    return (
      isAdmin() ||
      isManager() ||
      ticketDetail?.requestedBy?._id === user.userId ||
      ticketDetail?.assignedTo?._id === user.userId
    );
  };

  const canStartTicket = () => {
    return (
      (ticketDetail?.status === "PENDING" ||
        ticketDetail?.status === "APPROVED") &&
      (isManager() || ticketDetail?.assignedTo?._id === user.userId)
    );
  };

  const canCompleteTicket = () => {
    return (
      ticketDetail?.status === "IN_PROGRESS" &&
      (isManager() || ticketDetail?.assignedTo?._id === user.userId)
    );
  };

  if (!ticketDetail) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Không tìm thấy thông tin phiếu bảo dưỡng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[85vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {ticketDetail.ticketNumber}
              </h2>
              <p className="text-gray-600">
                {ticketDetail.equipment?.equipmentCode} -{" "}
                {ticketDetail.equipment?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                ticketDetail.status
              )}`}
            >
              {getStatusText(ticketDetail.status)}
            </span>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                ticketDetail.priority
              )}`}
            >
              {ticketDetail.priority === "LOW" && "Thấp"}
              {ticketDetail.priority === "MEDIUM" && "Trung bình"}
              {ticketDetail.priority === "HIGH" && "Cao"}
              {ticketDetail.priority === "CRITICAL" && "Khẩn cấp"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          {canStartTicket() && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsStartModalOpen(true)}
              className="flex items-center"
            >
              <PlayIcon className="w-4 h-4 mr-1" />
              Bắt đầu
            </Button>
          )}

          {canCompleteTicket() && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCompleteModalOpen(true)}
              className="flex items-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Hoàn thành
            </Button>
          )}

          {canEditTicket() && ticketDetail.status !== "COMPLETED" && (
            <Button variant="outline" size="sm" className="flex items-center">
              <PencilIcon className="w-4 h-4 mr-1" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="h-full flex flex-col"
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
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <TruckIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Thiết bị
                          </p>
                          <p className="text-sm text-gray-900">
                            {ticketDetail.equipment?.equipmentCode} -{" "}
                            {ticketDetail.equipment?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <CogIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Cấp bảo dưỡng
                          </p>
                          <p className="text-sm text-gray-900">
                            {ticketDetail.maintenanceLevel?.name} (
                            {ticketDetail.maintenanceLevel?.intervalHours}h)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Loại bảo dưỡng
                          </p>
                          <p className="text-sm text-gray-900">
                            {ticketDetail.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Người yêu cầu
                          </p>
                          <p className="text-sm text-gray-900">
                            {ticketDetail.requestedBy?.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Người thực hiện
                          </p>
                          <p className="text-sm text-gray-900">
                            {ticketDetail.assignedTo?.username ||
                              "Chưa phân công"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Thời gian
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Ngày tạo
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(ticketDetail.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Ngày dự kiến
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(ticketDetail.scheduledDate)}
                          </p>
                        </div>
                      </div>

                      {ticketDetail.actualStartDate && (
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Ngày bắt đầu
                            </p>
                            <p className="text-sm text-gray-900">
                              {formatDate(ticketDetail.actualStartDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {ticketDetail.actualEndDate && (
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Ngày hoàn thành
                            </p>
                            <p className="text-sm text-gray-900">
                              {formatDate(ticketDetail.actualEndDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description and Notes */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Mô tả công việc
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {ticketDetail.description}
                      </p>
                    </div>
                  </div>

                  {ticketDetail.workDescription && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Hướng dẫn thực hiện
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {ticketDetail.workDescription}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticketDetail.completionNotes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Ghi chú hoàn thành
                      </h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {ticketDetail.completionNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Equipment Hours */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Giờ hoạt động thiết bị
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Giờ bắt đầu</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ticketDetail.equipmentHoursAtStart || 0}h
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Giờ kết thúc</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ticketDetail.equipmentHoursAtEnd || "-"}h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>Công việc</span>
                {ticketDetail.tasks?.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {ticketDetail.tasks.length}
                  </span>
                )}
              </span>
            }
            key="tasks"
          >
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Danh sách công việc
                </h3>
                {ticketDetail.status === "IN_PROGRESS" && canEditTicket() && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Thêm công việc
                  </Button>
                )}
              </div>

              {ticketDetail.tasks?.length > 0 ? (
                <div className="space-y-4">
                  {ticketDetail.tasks.map((task, index) => (
                    <div
                      key={task._id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {index + 1}
                            </span>
                            <h4 className="font-medium text-gray-900">
                              {task.taskName}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task.status === "COMPLETED" && "Hoàn thành"}
                              {task.status === "IN_PROGRESS" &&
                                "Đang thực hiện"}
                              {task.status === "PENDING" && "Chờ thực hiện"}
                              {task.status === "SKIPPED" && "Bỏ qua"}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {task.assignedTo && (
                              <span>Phụ trách: {task.assignedTo.username}</span>
                            )}
                            {task.startTime && (
                              <span>Bắt đầu: {formatDate(task.startTime)}</span>
                            )}
                            {task.endTime && (
                              <span>Kết thúc: {formatDate(task.endTime)}</span>
                            )}
                          </div>

                          {task.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>Ghi chú:</strong> {task.notes}
                            </div>
                          )}
                        </div>

                        {ticketDetail.status === "IN_PROGRESS" &&
                          canEditTicket() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                setTaskForm({
                                  status: task.status,
                                  notes: task.notes || "",
                                  assignedTo: task.assignedTo?._id || "",
                                });
                                setIsTaskModalOpen(true);
                              }}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          )}
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
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CubeIcon className="w-4 h-4" />
                <span>Vật tư</span>
                {ticketDetail.materialsUsed?.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {ticketDetail.materialsUsed.length}
                  </span>
                )}
              </span>
            }
            key="materials"
          >
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Vật tư đã sử dụng
                </h3>
                {ticketDetail.status === "IN_PROGRESS" && canEditTicket() && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsMaterialModalOpen(true)}
                    className="flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Thêm vật tư
                  </Button>
                )}
              </div>

              {ticketDetail.materialsUsed?.length > 0 ? (
                <div className="space-y-4">
                  {ticketDetail.materialsUsed.map((materialUsed, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {materialUsed.material?.materialCode} -{" "}
                            {materialUsed.material?.name}
                          </h4>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Số lượng:</span>{" "}
                              {materialUsed.quantityUsed}{" "}
                              {materialUsed.material?.unit}
                            </div>
                            <div>
                              <span className="font-medium">Đơn giá:</span>{" "}
                              {formatCurrency(materialUsed.unitPrice)}
                            </div>
                            <div>
                              <span className="font-medium">Thành tiền:</span>{" "}
                              {formatCurrency(materialUsed.totalCost)}
                            </div>
                            <div>
                              <span className="font-medium">Người cấp:</span>{" "}
                              {materialUsed.issuedBy?.username}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Thời gian: {formatDate(materialUsed.issuedDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total Cost */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        Tổng chi phí vật tư:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(ticketDetail.costs?.materialCost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Chưa sử dụng vật tư nào
                  </p>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Chi phí</span>
              </span>
            }
            key="costs"
          >
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Báo cáo chi phí
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Chi phí vật tư
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ticketDetail.costs?.materialCost || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Chi phí nhân công
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ticketDetail.costs?.laborCost || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Chi phí khác
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ticketDetail.costs?.overheadCost || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-blue-900">
                        Tổng chi phí
                      </span>
                      <span className="text-xl font-bold text-blue-900">
                        {formatCurrency(ticketDetail.costs?.totalCost || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Downtime Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Thông tin downtime
                  </h4>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Tổng thời gian dừng
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {ticketDetail.downtime?.totalDowntime || 0} giờ
                      </span>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Tổn thất sản xuất
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          ticketDetail.downtime?.productionLoss || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Modals */}

      {/* Task Update Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Cập nhật công việc"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              value={taskForm.status}
              onChange={(value) => setTaskForm({ ...taskForm, status: value })}
              options={[
                { value: "PENDING", label: "Chờ thực hiện" },
                { value: "IN_PROGRESS", label: "Đang thực hiện" },
                { value: "COMPLETED", label: "Hoàn thành" },
                { value: "SKIPPED", label: "Bỏ qua" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={taskForm.notes}
              onChange={(e) =>
                setTaskForm({ ...taskForm, notes: e.target.value })
              }
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập ghi chú..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleTaskUpdate}>
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Thêm vật tư"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vật tư
            </label>
            <Select
              value={materialForm.materialId}
              onChange={(value) =>
                setMaterialForm({ ...materialForm, materialId: value })
              }
              options={[
                { value: "", label: "Chọn vật tư..." },
                ...materials.map((material) => ({
                  value: material._id,
                  label: `${material.materialCode} - ${material.name} (Tồn: ${material.currentStock} ${material.unit})`,
                })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng sử dụng
            </label>
            <Input
              type="number"
              value={materialForm.quantityUsed}
              onChange={(e) =>
                setMaterialForm({
                  ...materialForm,
                  quantityUsed: e.target.value,
                })
              }
              placeholder="Nhập số lượng..."
              min="1"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsMaterialModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAddMaterial}>
              Thêm vật tư
            </Button>
          </div>
        </div>
      </Modal>

      {/* Start Maintenance Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Bắt đầu bảo dưỡng"
        size="sm"
      >
        <div className="text-center">
          <PlayIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Bắt đầu bảo dưỡng?
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn có chắc chắn muốn bắt đầu thực hiện bảo dưỡng thiết bị này
            không?
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsStartModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleStartMaintenance}>
              Bắt đầu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete Maintenance Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Hoàn thành bảo dưỡng"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ hoạt động khi kết thúc
            </label>
            <Input
              type="number"
              value={completeForm.equipmentHoursAtEnd}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  equipmentHoursAtEnd: e.target.value,
                })
              }
              placeholder="Nhập giờ hoạt động hiện tại..."
              min={ticketDetail.equipmentHoursAtStart || 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú hoàn thành
            </label>
            <textarea
              value={completeForm.completionNotes}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  completionNotes: e.target.value,
                })
              }
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập ghi chú về quá trình bảo dưỡng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bảo dưỡng tiếp theo
            </label>
            <Input
              type="date"
              value={completeForm.nextMaintenanceDue}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  nextMaintenanceDue: e.target.value,
                })
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsCompleteModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCompleteMaintenance}>
              Hoàn thành
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MaintenanceTicketDetail;
