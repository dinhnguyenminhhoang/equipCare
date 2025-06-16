// src/pages/MaintenanceTickets/MaintenanceTickets.jsx
import { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { Table, Button, Input, Select, Modal } from "../../components/Common";
import StatsCard from "../../components/Dashboard/StatsCard";
import MaintenanceTicketForm from "../../components/MaintenanceTickets/MaintenanceTicketForm";
import MaintenanceTicketDetail from "../../components/MaintenanceTickets/MaintenanceTicketDetail";
import {
  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceTicket,
  deleteMaintenanceTicket,
  startMaintenance,
  completeMaintenance,
  approveMaintenanceTicket,
} from "../../services/maintenanceTicketService";
import { toast } from "react-toastify";

const MaintenanceTickets = () => {
  const { isAdmin, isManager, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    type: "",
    assignedTo: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTickets();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceTickets({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        type: filters.type,
        assignedTo: filters.assignedTo,
      });
      setTickets(response.data);
      setPagination((prev) => ({ ...prev, total: response.meta.total }));
    } catch (error) {
      toast.error("Lỗi khi tải danh sách phiếu bảo dưỡng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createMaintenanceTicket(data);
      toast.success("Tạo phiếu bảo dưỡng thành công");
      setIsCreateModalOpen(false);
      fetchTickets();
    } catch (error) {
      toast.error("Lỗi khi tạo phiếu bảo dưỡng");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMaintenanceTicket(selectedTicket._id, data);
      toast.success("Cập nhật phiếu bảo dưỡng thành công");
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error("Lỗi khi cập nhật phiếu bảo dưỡng");
    }
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu bảo dưỡng này?")) {
      try {
        await deleteMaintenanceTicket(ticketId);
        toast.success("Xóa phiếu bảo dưỡng thành công");
        fetchTickets();
      } catch (error) {
        toast.error("Lỗi khi xóa phiếu bảo dưỡng");
      }
    }
  };

  const handleApprove = async (ticketId) => {
    try {
      await approveMaintenanceTicket(ticketId);
      toast.success("Phê duyệt phiếu bảo dưỡng thành công");
      fetchTickets();
    } catch (error) {
      toast.error("Lỗi khi phê duyệt phiếu bảo dưỡng");
    }
  };

  const handleStart = async (ticketId, data) => {
    try {
      await startMaintenance(ticketId, data);
      toast.success("Bắt đầu bảo dưỡng thành công");
      fetchTickets();
    } catch (error) {
      toast.error("Lỗi khi bắt đầu bảo dưỡng");
    }
  };

  const handleComplete = async (ticketId, data) => {
    try {
      await completeMaintenance(ticketId, data);
      toast.success("Hoàn thành bảo dưỡng thành công");
      fetchTickets();
    } catch (error) {
      toast.error("Lỗi khi hoàn thành bảo dưỡng");
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

  const getPriorityText = (priority) => {
    const priorityText = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      CRITICAL: "Khẩn cấp",
    };
    return priorityText[priority] || priority;
  };

  const canEditTicket = (ticket) => {
    return (
      isAdmin() ||
      isManager() ||
      ticket.requestedBy._id === user._id ||
      ticket.assignedTo?._id === user._id
    );
  };

  const canDeleteTicket = (ticket) => {
    return (
      (isAdmin() || isManager() || ticket.requestedBy._id === user._id) &&
      ticket.status === "PENDING"
    );
  };

  const columns = [
    {
      key: "ticketNumber",
      title: "Mã phiếu",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.ticketNumber}</div>
      ),
    },
    {
      key: "equipment",
      title: "Thiết bị",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.equipment?.equipmentCode}
          </div>
          <div className="text-sm text-gray-500">{item.equipment?.name}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Loại bảo dưỡng",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {item.type}
        </span>
      ),
    },
    {
      key: "priority",
      title: "Độ ưu tiên",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
            item.priority
          )}`}
        >
          {getPriorityText(item.priority)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            item.status
          )}`}
        >
          {getStatusText(item.status)}
        </span>
      ),
    },
    {
      key: "assignedTo",
      title: "Người thực hiện",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.assignedTo?.username || "Chưa phân công"}
        </div>
      ),
    },
    {
      key: "scheduledDate",
      title: "Ngày dự kiến",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.scheduledDate
            ? new Date(item.scheduledDate).toLocaleDateString("vi-VN")
            : "-"}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTicket(item);
              setIsDetailModalOpen(true);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          {item.status === "PENDING" && isManager() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(item._id)}
              className="text-green-600 hover:text-green-900"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </Button>
          )}

          {item.status === "PENDING" && item.assignedTo?._id === user._id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStart(item._id, {})}
              className="text-blue-600 hover:text-blue-900"
            >
              <PlayIcon className="w-4 h-4" />
            </Button>
          )}

          {canEditTicket(item) && item.status !== "COMPLETED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTicket(item);
                setIsEditModalOpen(true);
              }}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}

          {canDeleteTicket(item) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item._id)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phiếu bảo dưỡng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý phiếu bảo dưỡng thiết bị và theo dõi tiến độ thực hiện
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Tạo phiếu bảo dưỡng
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng phiếu"
          value={pagination.total}
          icon={ClockIcon}
          color="blue"
        />
        <StatsCard
          title="Chờ xử lý"
          value={tickets.filter((t) => t.status === "PENDING").length}
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title="Đang thực hiện"
          value={tickets.filter((t) => t.status === "IN_PROGRESS").length}
          icon={PlayIcon}
          color="blue"
        />
        <StatsCard
          title="Hoàn thành"
          value={tickets.filter((t) => t.status === "COMPLETED").length}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <Input
              placeholder="Tìm theo mã phiếu, thiết bị..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              options={ticketStatuses}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Độ ưu tiên
            </label>
            <Select
              options={ticketPriorities}
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại bảo dưỡng
            </label>
            <Select
              options={ticketTypes}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  priority: "",
                  type: "",
                  assignedTo: "",
                })
              }
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={tickets}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, page }),
          }}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo phiếu bảo dưỡng mới"
        size="xl"
      >
        <MaintenanceTicketForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTicket(null);
        }}
        title="Chỉnh sửa phiếu bảo dưỡng"
        size="xl"
      >
        <MaintenanceTicketForm
          initialData={selectedTicket}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTicket(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        title="Chi tiết phiếu bảo dưỡng"
        size="full"
      >
        <MaintenanceTicketDetail
          ticket={selectedTicket}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTicket(null);
          }}
          onUpdate={fetchTickets}
        />
      </Modal>
    </div>
  );
};

export default MaintenanceTickets;
