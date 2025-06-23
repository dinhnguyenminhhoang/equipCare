import { message } from "antd";
import { useEffect, useState } from "react";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";

const UserForm = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    roles: ["USER"],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        confirmPassword: "",
        phone: initialData.phone || "",
        department: initialData.department || "",
        roles: initialData.roles || ["USER"],
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const roleOptions = [
    { value: "USER", label: "Người dùng" },
    { value: "TECHNICIAN", label: "Kỹ thuật viên" },
    { value: "MANAGER", label: "Quản lý" },
    { value: "ADMIN", label: "Quản trị viên" },
  ];

  const statusOptions = [
    { value: true, label: "Hoạt động" },
    { value: false, label: "Không hoạt động" },
  ];

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!isEdit && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "Phải chọn ít nhất một vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };

      // Remove password fields if editing and password is empty
      if (isEdit && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      } else {
        delete submitData.confirmPassword;
      }

      await onSubmit(submitData);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            error={errors.username}
            placeholder="Nhập username"
          />

          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            placeholder="Nhập email"
          />

          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            placeholder="Nhập số điện thoại"
          />

          <Input
            label="Phòng ban"
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
            error={errors.department}
            placeholder="Nhập phòng ban"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isEdit ? "Đổi mật khẩu (để trống nếu không thay đổi)" : "Mật khẩu"}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={isEdit ? "Mật khẩu mới" : "Mật khẩu *"}
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            placeholder="Nhập mật khẩu"
          />

          <Input
            label={isEdit ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            placeholder="Nhập lại mật khẩu"
          />
        </div>
      </div>

      {/* Roles and Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quyền và trạng thái
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò *
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <label key={role.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange("roles", [...formData.roles, role.value]);
                      } else {
                        handleChange(
                          "roles",
                          formData.roles.filter((r) => r !== role.value)
                        );
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {role.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              options={statusOptions}
              value={formData.isActive}
              onChange={(value) => handleChange("isActive", value)}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
