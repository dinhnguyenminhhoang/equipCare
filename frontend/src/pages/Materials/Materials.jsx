// src/pages/Materials/Materials.jsx
import { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { Table, Button, Input, Select, Modal } from "../../components/Common";
import StatsCard from "../../components/Dashboard/StatsCard";
import MaterialForm from "../../components/Materials/MaterialForm";
import MaterialDetailModal from "../../components/Materials/MaterialDetailModal";
import StockUpdateModal from "../../components/Materials/StockUpdateModal";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  updateStock,
  getMaterialStatistics,
} from "../../services/materialService";
import { toast } from "react-toastify";

const Materials = () => {
  const { isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    unit: "",
    lowStock: false,
    expiring: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchMaterials();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getMaterials({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category,
        unit: filters.unit,
        lowStock: filters.lowStock,
        expiring: filters.expiring,
      });
      setMaterials(response.data);
      setPagination((prev) => ({ ...prev, total: response.meta.total }));
    } catch (error) {
      toast.error("Lỗi khi tải danh sách vật tư");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getMaterialStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching material statistics:", error);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createMaterial(data);
      toast.success("Tạo vật tư thành công");
      setIsCreateModalOpen(false);
      fetchMaterials();
      fetchStatistics();
    } catch (error) {
      toast.error("Lỗi khi tạo vật tư");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMaterial(selectedMaterial._id, data);
      toast.success("Cập nhật vật tư thành công");
      setIsEditModalOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
      fetchStatistics();
    } catch (error) {
      toast.error("Lỗi khi cập nhật vật tư");
    }
  };

  const handleDelete = async (materialId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vật tư này?")) {
      try {
        await deleteMaterial(materialId);
        toast.success("Xóa vật tư thành công");
        fetchMaterials();
        fetchStatistics();
      } catch (error) {
        toast.error("Lỗi khi xóa vật tư");
      }
    }
  };

  const handleStockUpdate = async (data) => {
    try {
      await updateStock(selectedMaterial._id, data);
      toast.success("Cập nhật tồn kho thành công");
      setIsStockModalOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
      fetchStatistics();
    } catch (error) {
      toast.error("Lỗi khi cập nhật tồn kho");
    }
  };

  const getStockStatus = (material) => {
    if (material.currentStock === 0) {
      return {
        status: "out",
        color: "bg-red-100 text-red-800",
        text: "Hết hàng",
      };
    } else if (material.currentStock <= material.minStockLevel) {
      return {
        status: "low",
        color: "bg-yellow-100 text-yellow-800",
        text: "Sắp hết",
      };
    } else {
      return {
        status: "good",
        color: "bg-green-100 text-green-800",
        text: "Đủ hàng",
      };
    }
  };

  const isExpiringSoon = (material) => {
    if (!material.expiryDate || !material.isPerishable) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(material.expiryDate) <= thirtyDaysFromNow;
  };

  const columns = [
    {
      key: "materialCode",
      title: "Mã vật tư",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.materialCode}</div>
      ),
    },
    {
      key: "name",
      title: "Tên vật tư",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.description}</div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Danh mục",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.category}
        </span>
      ),
    },
    {
      key: "currentStock",
      title: "Tồn kho",
      render: (item) => {
        const stockStatus = getStockStatus(item);
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {item.currentStock} {item.unit}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
            >
              {stockStatus.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "minStockLevel",
      title: "Mức tối thiểu",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.minStockLevel} {item.unit}
        </div>
      ),
    },
    {
      key: "unitPrice",
      title: "Đơn giá",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.unitPrice)}
        </div>
      ),
    },
    {
      key: "expiryDate",
      title: "Hạn sử dụng",
      render: (item) => {
        if (!item.isPerishable || !item.expiryDate) {
          return <span className="text-gray-500">-</span>;
        }
        const isExpiring = isExpiringSoon(item);
        return (
          <div
            className={`text-sm ${
              isExpiring ? "text-red-600 font-medium" : "text-gray-900"
            }`}
          >
            {new Date(item.expiryDate).toLocaleDateString("vi-VN")}
            {isExpiring && (
              <ExclamationTriangleIcon className="w-4 h-4 inline ml-1 text-red-500" />
            )}
          </div>
        );
      },
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
              setSelectedMaterial(item);
              setIsDetailModalOpen(true);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedMaterial(item);
              setIsStockModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-900"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </Button>

          {(isAdmin() || isManager()) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMaterial(item);
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

  const materialCategories = [
    { value: "", label: "Tất cả danh mục" },
    { value: "ENGINE_OIL", label: "Dầu động cơ" },
    { value: "HYDRAULIC_OIL", label: "Dầu thủy lực" },
    { value: "FILTER", label: "Bộ lọc" },
    { value: "BRAKE_PAD", label: "Má phanh" },
    { value: "TIRE", label: "Lốp xe" },
    { value: "SPARE_PART", label: "Phụ tồn" },
    { value: "LUBRICANT", label: "Chất bôi trơn" },
    { value: "COOLANT", label: "Chất làm mát" },
    { value: "BELT", label: "Dây đai" },
    { value: "BATTERY", label: "Ắc quy" },
    { value: "OTHER", label: "Khác" },
  ];

  const materialUnits = [
    { value: "", label: "Tất cả đơn vị" },
    { value: "LITER", label: "Lít" },
    { value: "PIECE", label: "Cái" },
    { value: "KG", label: "Kg" },
    { value: "METER", label: "Mét" },
    { value: "BOX", label: "Hộp" },
    { value: "SET", label: "Bộ" },
    { value: "BOTTLE", label: "Chai" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý vật tư</h1>
          <p className="mt-2 text-gray-600">
            Quản lý vật tư, theo dõi tồn kho và cảnh báo hết hạn
          </p>
        </div>
        {(isAdmin() || isManager()) && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm vật tư
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng vật tư"
          value={statistics?.totalMaterials || 0}
          icon={CubeIcon}
          color="blue"
        />
        <StatsCard
          title="Sắp hết hàng"
          value={statistics?.lowStockCount || 0}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <StatsCard
          title="Sắp hết hạn"
          value={statistics?.expiringCount || 0}
          icon={ClockIcon}
          color="red"
        />
        <StatsCard
          title="Tổng giá trị"
          value={`${new Intl.NumberFormat("vi-VN").format(
            statistics?.totalStockValue || 0
          )} VNĐ`}
          icon={CubeIcon}
          color="green"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.lowStock ? "primary" : "outline"}
          size="sm"
          onClick={() =>
            setFilters({ ...filters, lowStock: !filters.lowStock })
          }
        >
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Sắp hết hàng
        </Button>
        <Button
          variant={filters.expiring ? "primary" : "outline"}
          size="sm"
          onClick={() =>
            setFilters({ ...filters, expiring: !filters.expiring })
          }
        >
          <ClockIcon className="w-4 h-4 mr-1" />
          Sắp hết hạn
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <Input
              placeholder="Tìm theo mã, tên vật tư..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <Select
              options={materialCategories}
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn vị tính
            </label>
            <Select
              options={materialUnits}
              value={filters.unit}
              onChange={(value) => setFilters({ ...filters, unit: value })}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  category: "",
                  unit: "",
                  lowStock: false,
                  expiring: false,
                })
              }
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={materials}
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
        title="Thêm vật tư mới"
        size="lg"
      >
        <MaterialForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        title="Chỉnh sửa vật tư"
        size="lg"
      >
        <MaterialForm
          initialData={selectedMaterial}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedMaterial(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedMaterial(null);
        }}
        title="Cập nhật tồn kho"
        size="md"
      >
        <StockUpdateModal
          material={selectedMaterial}
          onSubmit={handleStockUpdate}
          onCancel={() => {
            setIsStockModalOpen(false);
            setSelectedMaterial(null);
          }}
        />
      </Modal>

      <MaterialDetailModal
        material={selectedMaterial}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMaterial(null);
        }}
      />
    </div>
  );
};

export default Materials;
