import {
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStatistics,
} from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Common/Button/Button";
import StatsCard from "../../components/StatsCard/StatsCard";
import Input from "../../components/Common/Input/Input";
import Select from "../../components/Common/Select/Select";
import Table from "../../components/Common/Table/Table";
import Modal from "../../components/Common/Modal/Modal";
import { message } from "antd";
import UserForm from "../../components/UserForm/UserForm";
import UserDetailModal from "../../components/UserDetailModal/UserDetailModal";

const Users = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    roles: "",
    department: "",
    isActive: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchStatistics();
    }
  }, [filters, pagination.page, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        roles: filters.roles,
        department: filters.department,
        isActive: filters.isActive,
      });
      setUsers(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.meta.total }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getUserStatistics();
      setStatistics(response);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createUser(data);
      message.success("Tạo người dùng thành công");
      setIsCreateModalOpen(false);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tạo người dùng";
      message.error(errorMessage);
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateUser(selectedUser._id, data);
      message.success("Cập nhật người dùng thành công");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật người dùng";
      message.error(errorMessage);
      throw error;
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteUser(userId);
        message.success("Xóa người dùng thành công");
        fetchUsers();
        fetchStatistics();
      } catch (error) {
        message.error("Lỗi khi xóa người dùng");
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      message.success("Cập nhật trạng thái thành công");
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const getRoleText = (roles) => {
    const roleTexts = {
      ADMIN: "Admin",
      MANAGER: "Manager",
      TECHNICIAN: "Kỹ thuật viên",
      USER: "User",
    };
    return roles?.map((role) => roleTexts[role] || role).join(", ") || "N/A";
  };

  const getRoleBadgeColor = (roles) => {
    if (roles?.includes("ADMIN")) return "bg-red-100 text-red-800";
    if (roles?.includes("MANAGER")) return "bg-purple-100 text-purple-800";
    if (roles?.includes("TECHNICIAN")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "username",
      title: "Thông tin người dùng",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.username || item.email}
          </div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: "roles",
      title: "Vai trò",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
            item.roles
          )}`}
        >
          {getRoleText(item.roles)}
        </span>
      ),
    },
    {
      key: "department",
      title: "Phòng ban",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.department || "-"}</div>
      ),
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.phone || "-"}</div>
      ),
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.isActive ? (
            <>
              <CheckIcon className="w-3 h-3 mr-1" />
              Hoạt động
            </>
          ) : (
            <>
              <XMarkIcon className="w-3 h-3 mr-1" />
              Không hoạt động
            </>
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
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
              setSelectedUser(item);
              setIsDetailModalOpen(true);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(item);
              setIsEditModalOpen(true);
            }}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(item._id)}
            className={
              !item.isActive
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }
          >
            {!item.isActive ? (
              <XMarkIcon className="w-4 h-4" />
            ) : (
              <CheckIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  const roleOptions = [
    { value: "", label: "Tất cả vai trò" },
    { value: "ADMIN", label: "Quản trị viên" },
    { value: "MANAGER", label: "Quản lý" },
    { value: "TECHNICIAN", label: "Kỹ thuật viên" },
    { value: "USER", label: "Người dùng" },
  ];

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
  ];

  // Kiểm tra quyền admin
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có quyền truy cập
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn cần quyền quản trị viên để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin người dùng, phân quyền và theo dõi hoạt động
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng người dùng"
          value={statistics.totalUsers || 0}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatsCard
          title="Đang hoạt động"
          value={statistics.activeUsers || 0}
          icon={UserIcon}
          color="green"
        />
        <StatsCard
          title="Không hoạt động"
          value={statistics.inactiveUsers || 0}
          icon={UserIcon}
          color="red"
        />
        <StatsCard
          title="Quản trị viên"
          value={
            statistics.roleStats?.find((r) => r._id === "ADMIN")?.count || 0
          }
          icon={ShieldCheckIcon}
          color="purple"
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
              placeholder="Tìm theo username, email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <Select
              options={roleOptions}
              value={filters.roles}
              onChange={(value) => setFilters({ ...filters, roles: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              options={statusOptions}
              value={filters.isActive}
              onChange={(value) => setFilters({ ...filters, isActive: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phòng ban
            </label>
            <Input
              placeholder="Nhập phòng ban..."
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setFilters({
                search: "",
                roles: "",
                department: "",
                isActive: "",
              })
            }
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={users}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, page }),
          }}
        />
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm người dùng mới"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Chỉnh sửa người dùng"
        size="lg"
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          isEdit={true}
        />
      </Modal>

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        onPasswordReset={() => {}}
      />
    </div>
  );
};

export default Users;
