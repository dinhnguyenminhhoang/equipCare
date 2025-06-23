// src/pages/Equipment/Equipment.jsx
import {
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { message } from "antd";
import { useEffect, useState } from "react";
import Button from "../../components/Common/Button/Button";
import Input from "../../components/Common/Input/Input";
import Modal from "../../components/Common/Modal/Modal";
import Select from "../../components/Common/Select/Select";
import Table from "../../components/Common/Table/Table";
import EquipmentDetailModal from "../../components/EquipmentDetailModal/EquipmentDetailModal";
import EquipmentForm from "../../components/EquipmentForm/EquipmentForm";
import StatsCard from "../../components/StatsCard/StatsCard";
import { useAuth } from "../../context/AuthContext";
import {
  createEquipment,
  deleteEquipment,
  getEquipmentStatistics,
  getEquipments,
  getEquipmentsDueForMaintenance,
  updateEquipment,
  updateOperatingHours,
} from "../../services/equipmentService";
import { statusText } from "../../utils/const";

const Equipment = () => {
  const { isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOperatingHoursModalOpen, setIsOperatingHoursModalOpen] =
    useState(false);
  const [operatingHours, setOperatingHours] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    location: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchEquipments();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await getEquipments({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        type: filters.type,
        status: filters.status,
        location: filters.location,
      });
      setEquipments(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.meta.total }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const stats = await getEquipmentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createEquipment(data);
      message.success("Tạo thiết bị thành công");
      setIsCreateModalOpen(false);
      fetchEquipments();
      fetchStatistics();
    } catch (error) {
      message.error("Lỗi khi tạo thiết bị");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateEquipment(selectedEquipment._id, data);
      message.success("Cập nhật thiết bị thành công");
      setIsEditModalOpen(false);
      setSelectedEquipment(null);
      fetchEquipments();
      fetchStatistics();
    } catch (error) {
      message.error("Lỗi khi cập nhật thiết bị");
    }
  };

  const handleDelete = async (equipmentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      try {
        await deleteEquipment(equipmentId);
        message.success("Xóa thiết bị thành công");
        fetchEquipments();
        fetchStatistics();
      } catch (error) {
        message.error("Lỗi khi xóa thiết bị");
      }
    }
  };

  const handleUpdateOperatingHours = async () => {
    if (!selectedEquipment || !operatingHours) {
      message.error("Vui lòng nhập số giờ hoạt động");
      return;
    }

    try {
      await updateOperatingHours(
        selectedEquipment._id,
        parseFloat(operatingHours)
      );
      message.success("Cập nhật số giờ hoạt động thành công");
      setIsOperatingHoursModalOpen(false);
      setSelectedEquipment(null);
      setOperatingHours("");
      fetchEquipments();
    } catch (error) {
      message.error("Lỗi khi cập nhật số giờ hoạt động");
    }
  };

  const handleViewDueMaintenance = async () => {
    try {
      const response = await getEquipmentsDueForMaintenance({
        page: 1,
        limit: 100,
      });
      const dueEquipments = response.data.data;

      if (dueEquipments.length === 0) {
        message.info("Không có thiết bị nào cần bảo dưỡng");
        return;
      }

      // Show modal hoặc navigate đến trang maintenance
      message.success(`Có ${dueEquipments.length} thiết bị cần bảo dưỡng`);

      // Có thể mở modal hiển thị danh sách hoặc navigate
      console.log("Due maintenance equipments:", dueEquipments);
    } catch (error) {
      message.error("Lỗi khi tải danh sách thiết bị cần bảo dưỡng");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ACTIVE: "bg-green-100 text-green-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
      REPAIR: "bg-red-100 text-red-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    return statusText[status] || status;
  };

  const columns = [
    {
      key: "equipmentCode",
      title: "Mã thiết bị",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.equipmentCode}</div>
      ),
    },
    {
      key: "name",
      title: "Tên thiết bị",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.model}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Loại thiết bị",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.type}
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
      key: "operatingHours",
      title: "Giờ hoạt động",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.operatingHours || 0}h</div>
      ),
    },
    {
      key: "location",
      title: "Vị trí",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.location || "-"}</div>
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
              setSelectedEquipment(item);
              setIsDetailModalOpen(true);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {(isAdmin() || isManager()) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedEquipment(item);
                  setOperatingHours(item.operatingHours || 0);
                  setIsOperatingHoursModalOpen(true);
                }}
                title="Cập nhật giờ hoạt động"
              >
                <ClockIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedEquipment(item);
                  setIsEditModalOpen(true);
                }}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item._id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const equipmentTypes = [
    { value: "", label: "Tất cả loại thiết bị" },
    { value: "CRANE", label: "Cẩu" },
    { value: "FORKLIFT", label: "Xe nâng" },
    { value: "TRACTOR", label: "Đầu kéo" },
    { value: "TRUCK", label: "Xe tải" },
    { value: "EXCAVATOR", label: "Máy xúc" },
    { value: "OTHER", label: "Khác" },
  ];

  const equipmentStatuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "MAINTENANCE", label: "Bảo dưỡng" },
    { value: "REPAIR", label: "Sửa chữa" },
    { value: "INACTIVE", label: "Ngừng hoạt động" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thiết bị</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin thiết bị, theo dõi trạng thái và lịch bảo dưỡng
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleViewDueMaintenance}
            className="flex items-center"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Thiết bị cần BĐ
          </Button>
          {(isAdmin() || isManager()) && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm thiết bị
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng thiết bị"
          value={statistics.totalEquipments || 0}
          icon={WrenchScrewdriverIcon}
          color="blue"
          loading={statsLoading}
        />
        <StatsCard
          title="Đang hoạt động"
          value={
            statistics.statusStats?.find((s) => s._id === "ACTIVE")?.count || 0
          }
          icon={WrenchScrewdriverIcon}
          color="green"
          loading={statsLoading}
        />
        <StatsCard
          title="Đang bảo dưỡng"
          value={
            statistics.statusStats?.find((s) => s._id === "MAINTENANCE")
              ?.count || 0
          }
          icon={WrenchScrewdriverIcon}
          color="yellow"
          loading={statsLoading}
        />
        <StatsCard
          title="Cần bảo dưỡng"
          value={statistics.maintenanceDue || 0}
          icon={WrenchScrewdriverIcon}
          color="red"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <Input
              placeholder="Tìm theo mã, tên thiết bị..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại thiết bị
            </label>
            <Select
              options={equipmentTypes}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              options={equipmentStatuses}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị trí
            </label>
            <Input
              placeholder="Nhập vị trí..."
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setFilters({ search: "", type: "", status: "", location: "" })
            }
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={equipments}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, page }),
          }}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm thiết bị mới"
        size="lg"
      >
        <EquipmentForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEquipment(null);
        }}
        title="Chỉnh sửa thiết bị"
        size="lg"
      >
        <EquipmentForm
          initialData={selectedEquipment}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedEquipment(null);
          }}
        />
      </Modal>

      {/* Operating Hours Modal */}
      <Modal
        isOpen={isOperatingHoursModalOpen}
        onClose={() => {
          setIsOperatingHoursModalOpen(false);
          setSelectedEquipment(null);
          setOperatingHours("");
        }}
        title="Cập nhật số giờ hoạt động"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thiết bị: {selectedEquipment?.equipmentCode} -{" "}
              {selectedEquipment?.name}
            </label>
            <Input
              label="Số giờ hoạt động"
              type="number"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="Nhập số giờ hoạt động"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsOperatingHoursModalOpen(false);
                setSelectedEquipment(null);
                setOperatingHours("");
              }}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateOperatingHours}>
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>

      <EquipmentDetailModal
        equipment={selectedEquipment}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEquipment(null);
        }}
      />
    </div>
  );
};

export default Equipment;
