// src/pages/MaintenanceLevels/MaintenanceLevels.jsx
import {
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  createMaintenanceLevel,
  deleteMaintenanceLevel,
  getMaintenanceLevels,
  updateMaintenanceLevel,
} from "../../services/maintenanceLevelService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Common/Button/Button";
import StatsCard from "../../components/StatsCard/StatsCard";
import Input from "../../components/Common/Input/Input";
import Select from "../../components/Common/Select/Select";
import Table from "../../components/Common/Table/Table";
import Modal from "../../components/Common/Modal/Modal";
import { message } from "antd";
import MaintenanceLevelForm from "../../components/MaintenanceLevelForm/MaintenanceLevelForm";
import MaintenanceLevelDetailModal from "../../components/MaintenanceLevelDetailModal/MaintenanceLevelDetailModal";

const MaintenanceLevels = () => {
  const { isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    intervalHours: "",
    equipmentType: "",
    priority: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchLevels();
  }, [filters, pagination.page]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceLevels({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        intervalHours: filters.intervalHours,
        equipmentType: filters.equipmentType,
        priority: filters.priority,
      });
      setLevels(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.meta.total }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách cấp bảo dưỡng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createMaintenanceLevel(data);
      message.success("Tạo cấp bảo dưỡng thành công");
      setIsCreateModalOpen(false);
      fetchLevels();
    } catch (error) {
      message.error("Lỗi khi tạo cấp bảo dưỡng");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMaintenanceLevel(selectedLevel._id, data);
      message.success("Cập nhật cấp bảo dưỡng thành công");
      setIsEditModalOpen(false);
      setSelectedLevel(null);
      fetchLevels();
    } catch (error) {
      message.error("Lỗi khi cập nhật cấp bảo dưỡng");
    }
  };

  const handleDelete = async (levelId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cấp bảo dưỡng này?")) {
      try {
        await deleteMaintenanceLevel(levelId);
        message.success("Xóa cấp bảo dưỡng thành công");
        fetchLevels();
      } catch (error) {
        message.error("Lỗi khi xóa cấp bảo dưỡng");
      }
    }
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

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      key: "levelCode",
      title: "Mã cấp",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.levelCode}</div>
      ),
    },
    {
      key: "name",
      title: "Tên cấp bảo dưỡng",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {item.description}
          </div>
        </div>
      ),
    },
    {
      key: "intervalHours",
      title: "Chu kỳ (giờ)",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.intervalHours}h</div>
      ),
    },
    {
      key: "equipmentTypes",
      title: "Loại thiết bị",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.equipmentTypes?.slice(0, 2).map((type, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            >
              {type}
            </span>
          ))}
          {item.equipmentTypes?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{item.equipmentTypes.length - 2} thêm
            </span>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      title: "Mức ưu tiên",
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
      key: "estimatedDuration",
      title: "Thời gian ước tính",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.estimatedDuration ? `${item.estimatedDuration}h` : "-"}
        </div>
      ),
    },
    {
      key: "estimatedCost",
      title: "Chi phí ước tính",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(item.estimatedCost?.totalCost)}
        </div>
      ),
    },
    {
      key: "requiredTasks",
      title: "Số công việc",
      render: (item) => (
        <div className="text-sm text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {item.requiredTasks?.length || 0}
          </span>
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
              setSelectedLevel(item);
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
                  setSelectedLevel(item);
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

  const intervalOptions = [
    { value: "", label: "Tất cả chu kỳ" },
    { value: "60", label: "60 giờ" },
    { value: "120", label: "120 giờ" },
    { value: "240", label: "240 giờ" },
    { value: "480", label: "480 giờ" },
    { value: "1000", label: "1000 giờ" },
    { value: "2000", label: "2000 giờ" },
  ];

  const equipmentTypeOptions = [
    { value: "", label: "Tất cả loại thiết bị" },
    { value: "CRANE", label: "Cẩu" },
    { value: "FORKLIFT", label: "Xe nâng" },
    { value: "TRACTOR", label: "Đầu kéo" },
    { value: "TRUCK", label: "Xe tải" },
    { value: "EXCAVATOR", label: "Máy xúc" },
    { value: "OTHER", label: "Khác" },
  ];

  const priorityOptions = [
    { value: "", label: "Tất cả mức ưu tiên" },
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Khẩn cấp" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cấp bảo dưỡng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các cấp bảo dưỡng và chu kỳ bảo dưỡng thiết bị
          </p>
        </div>
        {(isAdmin() || isManager()) && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm cấp bảo dưỡng
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng cấp bảo dưỡng"
          value={pagination.total}
          icon={WrenchScrewdriverIcon}
          color="blue"
        />
        <StatsCard
          title="Chu kỳ ngắn (≤120h)"
          value={levels.filter((l) => l.intervalHours <= 120).length}
          icon={ClockIcon}
          color="green"
        />
        <StatsCard
          title="Chu kỳ dài (>480h)"
          value={levels.filter((l) => l.intervalHours > 480).length}
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title="Mức ưu tiên cao"
          value={
            levels.filter((l) => ["HIGH", "CRITICAL"].includes(l.priority))
              .length
          }
          icon={CogIcon}
          color="red"
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
              placeholder="Tìm theo mã, tên cấp bảo dưỡng..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chu kỳ bảo dưỡng
            </label>
            <Select
              options={intervalOptions}
              value={filters.intervalHours}
              onChange={(value) =>
                setFilters({ ...filters, intervalHours: value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại thiết bị
            </label>
            <Select
              options={equipmentTypeOptions}
              value={filters.equipmentType}
              onChange={(value) =>
                setFilters({ ...filters, equipmentType: value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức ưu tiên
            </label>
            <Select
              options={priorityOptions}
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setFilters({
                search: "",
                intervalHours: "",
                equipmentType: "",
                priority: "",
              })
            }
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Maintenance Levels Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={levels}
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
        title="Thêm cấp bảo dưỡng mới"
        size="xl"
      >
        <MaintenanceLevelForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLevel(null);
        }}
        title="Chỉnh sửa cấp bảo dưỡng"
        size="xl"
      >
        <MaintenanceLevelForm
          initialData={selectedLevel}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedLevel(null);
          }}
        />
      </Modal>

      <MaintenanceLevelDetailModal
        level={selectedLevel}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLevel(null);
        }}
      />
    </div>
  );
};

export default MaintenanceLevels;
