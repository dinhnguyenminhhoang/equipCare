import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import Button from "../Common/Button/Button";
import Modal from "../Common/Modal/Modal";
import Input from "../Common/Input/Input";
import { resetUserPassword } from "../../services/userService";
import { message } from "antd";

const UserDetailModal = ({ user, isOpen, onClose, onPasswordReset }) => {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleText = (roles) => {
    const roleTexts = {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý",
      TECHNICIAN: "Kỹ thuật viên",
      USER: "Người dùng",
    };
    return (
      roles?.map((role) => roleTexts[role] || role).join(", ") ||
      "Chưa có vai trò"
    );
  };

  const handleResetPassword = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const response = await resetUserPassword(user._id, {
        newPassword: newPassword || undefined,
      });

      message.success("Reset mật khẩu thành công!");

      if (response.newPassword) {
        message.info(`Mật khẩu mới: ${response.newPassword}`, 10);
      }

      setShowResetPassword(false);
      setNewPassword("");
      onPasswordReset?.();
    } catch (error) {
      message.error("Lỗi khi reset mật khẩu");
    } finally {
      setLoading(false);
    }
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

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <UserIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết người dùng: {user.username || user.email}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {formatDate(user.updatedAt)}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowResetPassword(true)}
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <KeyIcon className="w-4 h-4 mr-1" />
              Reset mật khẩu
            </Button>
            <Button onClick={onClose} variant="secondary">
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <InfoSection title="Thông tin cơ bản">
            <InfoItem
              icon={UserIcon}
              label="Username"
              value={user.username}
              valueClassName="font-medium"
            />

            <InfoItem
              icon={EnvelopeIcon}
              label="Email"
              value={user.email}
              valueClassName="font-medium text-blue-600"
            />

            <InfoItem
              icon={PhoneIcon}
              label="Số điện thoại"
              value={user.phone}
            />

            <InfoItem
              icon={BuildingOfficeIcon}
              label="Phòng ban"
              value={user.department}
            />
          </InfoSection>

          <InfoSection title="Quyền và trạng thái">
            <InfoItem
              icon={ShieldCheckIcon}
              label="Vai trò"
              value={getRoleText(user.roles)}
              valueClassName="font-medium"
            />

            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
              </div>
            </div>

            <InfoItem
              icon={CalendarIcon}
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
            />
          </InfoSection>
        </div>

        {/* Role badges */}
        {user.roles && user.roles.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Danh sách vai trò
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    role === "ADMIN"
                      ? "bg-red-100 text-red-800"
                      : role === "MANAGER"
                      ? "bg-purple-100 text-purple-800"
                      : role === "TECHNICIAN"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getRoleText([role])}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPassword}
        onClose={() => {
          setShowResetPassword(false);
          setNewPassword("");
        }}
        title="Reset mật khẩu người dùng"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setShowResetPassword(false);
                setNewPassword("");
              }}
              variant="secondary"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="primary"
              loading={loading}
            >
              Reset mật khẩu
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <KeyIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Lưu ý khi reset mật khẩu
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nếu để trống, hệ thống sẽ tạo mật khẩu ngẫu nhiên</li>
                    <li>Mật khẩu mới sẽ được hiển thị một lần duy nhất</li>
                    <li>
                      Người dùng nên đổi mật khẩu sau lần đăng nhập đầu tiên
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Mật khẩu mới (để trống để tạo ngẫu nhiên)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới hoặc để trống"
          />
        </div>
      </Modal>
    </Modal>
  );
};

export default UserDetailModal;
