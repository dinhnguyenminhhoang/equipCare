import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { message, Tooltip, Modal as AntModal } from "antd"; // Import thêm Tooltip và Modal từ Ant Design
import Button from "../../components/Common/Button/Button";
import Input from "../../components/Common/Input/Input";
import Modal from "../../components/Common/Modal/Modal";
import Select from "../../components/Common/Select/Select";
import Table from "../../components/Common/Table/Table";
import StatsCard from "../../components/StatsCard/StatsCard";
import { useAuth } from "../../context/AuthContext";
import {
  approveMaintenanceTicket,
  completeMaintenance,
  createMaintenanceTicket,
  deleteMaintenanceTicket,
  getMaintenanceTickets,
  startMaintenance,
  updateMaintenanceTicket,
} from "../../services/maintenanceTicketService";
import MaintenanceTicketDetail from "../../components/MaintenanceTicketDetail/MaintenanceTicketDetail";
import MaintenanceTicketForm from "../../components/MaintenanceTicketForm/MaintenanceTicketForm";
import {
  getPriorityColor,
  getPriorityText,
  getStatusColor,
  getStatusText,
  ticketPriorities,
  ticketStatuses,
  ticketTypes,
} from "../../utils/const";

const { confirm } = AntModal;

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
      setTickets(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.meta.total }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu bảo dưỡng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createMaintenanceTicket(data);
      message.success("Tạo phiếu bảo dưỡng thành công");
      setIsCreateModalOpen(false);
      fetchTickets();
    } catch (error) {
      message.error("Lỗi khi tạo phiếu bảo dưỡng");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMaintenanceTicket(selectedTicket._id, data);
      message.success("Cập nhật phiếu bảo dưỡng thành công");
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      message.error("Lỗi khi cập nhật phiếu bảo dưỡng");
    }
  };

  // ✅ Enhanced delete với Ant Design confirm
  const handleDelete = async (ticket) => {
    confirm({
      title: "Xác nhận xóa phiếu bảo dưỡng",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa phiếu bảo dưỡng này không?</p>
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p>
              <strong>Mã phiếu:</strong> {ticket.ticketNumber}
            </p>
            <p>
              <strong>Thiết bị:</strong> {ticket.equipment?.name}
            </p>
            <p>
              <strong>Loại:</strong> {ticket.type}
            </p>
          </div>
          <p className="mt-2 text-red-600 text-sm">
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      icon: <TrashIcon className="w-6 h-6 text-red-500" />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteMaintenanceTicket(ticket._id);
          message.success("Xóa phiếu bảo dưỡng thành công");
          fetchTickets();
        } catch (error) {
          message.error("Lỗi khi xóa phiếu bảo dưỡng");
        }
      },
    });
  };

  // ✅ Enhanced approve với confirm
  const handleApprove = async (ticket) => {
    confirm({
      title: "Phê duyệt phiếu bảo dưỡng",
      content: (
        <div>
          <p>Bạn có muốn phê duyệt phiếu bảo dưỡng này không?</p>
          <div className="mt-2 p-3 bg-blue-50 rounded">
            <p>
              <strong>Mã phiếu:</strong> {ticket.ticketNumber}
            </p>
            <p>
              <strong>Thiết bị:</strong> {ticket.equipment?.name}
            </p>
            <p>
              <strong>Người yêu cầu:</strong> {ticket.requestedBy?.username}
            </p>
            <p>
              <strong>Độ ưu tiên:</strong> {getPriorityText(ticket.priority)}
            </p>
          </div>
        </div>
      ),
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      okText: "Phê duyệt",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await approveMaintenanceTicket(ticket._id);
          message.success("Phê duyệt phiếu bảo dưỡng thành công");
          fetchTickets();
        } catch (error) {
          message.error("Lỗi khi phê duyệt phiếu bảo dưỡng");
        }
      },
    });
  };

  // ✅ Enhanced start với confirm
  const handleStart = async (ticket) => {
    confirm({
      title: "Bắt đầu thực hiện bảo dưỡng",
      content: (
        <div>
          <p>Bạn có muốn bắt đầu thực hiện bảo dưỡng cho thiết bị này không?</p>
          <div className="mt-2 p-3 bg-blue-50 rounded">
            <p>
              <strong>Mã phiếu:</strong> {ticket.ticketNumber}
            </p>
            <p>
              <strong>Thiết bị:</strong> {ticket.equipment?.name}
            </p>
            <p>
              <strong>Loại bảo dưỡng:</strong> {ticket.type}
            </p>
            <p>
              <strong>Ngày dự kiến:</strong>{" "}
              {ticket.scheduledDate
                ? new Date(ticket.scheduledDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <p className="mt-2 text-blue-600 text-sm">
            Thời gian bắt đầu sẽ được ghi nhận từ thời điểm hiện tại.
          </p>
        </div>
      ),
      icon: <PlayIcon className="w-6 h-6 text-blue-500" />,
      okText: "Bắt đầu",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await startMaintenance(ticket._id, {});
          message.success("Bắt đầu bảo dưỡng thành công");
          fetchTickets();
        } catch (error) {
          message.error("Lỗi khi bắt đầu bảo dưỡng");
        }
      },
    });
  };

  const handleComplete = async (ticketId, data) => {
    try {
      await completeMaintenance(ticketId, data);
      message.success("Hoàn thành bảo dưỡng thành công");
      fetchTickets();
    } catch (error) {
      message.error("Lỗi khi hoàn thành bảo dưỡng");
    }
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

  // ✅ Helper function để lấy tooltip text
  const getActionTooltip = (action, ticket) => {
    switch (action) {
      case "view":
        return "Xem chi tiết phiếu bảo dưỡng";
      case "approve":
        return "Phê duyệt phiếu bảo dưỡng";
      case "start":
        return "Bắt đầu thực hiện bảo dưỡng";
      case "edit":
        return ticket.status === "COMPLETED"
          ? "Không thể chỉnh sửa phiếu đã hoàn thành"
          : "Chỉnh sửa phiếu bảo dưỡng";
      case "delete":
        return ticket.status !== "PENDING"
          ? "Chỉ có thể xóa phiếu ở trạng thái chờ xử lý"
          : "Xóa phiếu bảo dưỡng";
      default:
        return "";
    }
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
          {/* ✅ View Action với Tooltip */}
          <Tooltip title={getActionTooltip("view", item)} placement="top">
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
          </Tooltip>

          {/* ✅ Approve Action với Tooltip */}
          {item.status === "PENDING" && isManager() && (
            <Tooltip title={getActionTooltip("approve", item)} placement="top">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(item)}
                className="text-green-600 hover:text-green-900"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* ✅ Start Action với Tooltip */}
          {item.status === "APPROVED" && item.assignedTo?._id === user._id && (
            <Tooltip title={getActionTooltip("start", item)} placement="top">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStart(item)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* ✅ Edit Action với Tooltip */}
          {canEditTicket(item) && (
            <Tooltip title={getActionTooltip("edit", item)} placement="top">
              <Button
                variant="ghost"
                size="sm"
                disabled={item.status === "COMPLETED"}
                onClick={() => {
                  setSelectedTicket(item);
                  setIsEditModalOpen(true);
                }}
                className={
                  item.status === "COMPLETED"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* ✅ Delete Action với Tooltip */}
          {(isAdmin() || isManager() || item.requestedBy._id === user._id) && (
            <Tooltip title={getActionTooltip("delete", item)} placement="top">
              <Button
                variant="ghost"
                size="sm"
                disabled={!canDeleteTicket(item)}
                onClick={() => handleDelete(item)}
                className={
                  canDeleteTicket(item)
                    ? "text-red-600 hover:text-red-900"
                    : "opacity-50 cursor-not-allowed"
                }
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phiếu bảo dưỡng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý phiếu bảo dưỡng thiết bị và theo dõi tiến độ thực hiện
          </p>
        </div>
        {isAdmin() || isManager() ? (
          <Tooltip title="Tạo phiếu bảo dưỡng mới" placement="left">
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Tạo phiếu bảo dưỡng
            </Button>
          </Tooltip>
        ) : null}
      </div>

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
            {/* ✅ Clear Filter Button với Tooltip */}
            <Tooltip title="Xóa tất cả bộ lọc" placement="top">
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
            </Tooltip>
          </div>
        </div>
      </div>

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
