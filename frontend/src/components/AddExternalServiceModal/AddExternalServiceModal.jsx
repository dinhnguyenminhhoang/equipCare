import { useState } from "react";
import { message } from "antd";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Modal from "../Common/Modal/Modal";

const AddExternalServiceModal = ({ isOpen, onClose, onSubmit, ticketId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    provider: "",
    cost: "",
    description: "",
    serviceDate: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim()) {
      message.error("Vui lòng nhập tên dịch vụ");
      return;
    }

    if (!formData.provider.trim()) {
      message.error("Vui lòng nhập nhà cung cấp");
      return;
    }

    if (!formData.cost || formData.cost <= 0) {
      message.error("Vui lòng nhập chi phí hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        cost: parseFloat(formData.cost),
        serviceDate: formData.serviceDate || new Date().toISOString(),
      };

      await onSubmit(submitData);
      setFormData({
        serviceName: "",
        provider: "",
        cost: "",
        description: "",
        serviceDate: "",
      });
      onClose();
    } catch (error) {
      message.error("Lỗi khi thêm dịch vụ bên ngoài");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm dịch vụ bên ngoài"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên dịch vụ *"
          value={formData.serviceName}
          onChange={(e) => handleChange("serviceName", e.target.value)}
          placeholder="Ví dụ: Vận chuyển, Lắp đặt, Sửa chữa chuyên môn..."
        />

        <Input
          label="Nhà cung cấp *"
          value={formData.provider}
          onChange={(e) => handleChange("provider", e.target.value)}
          placeholder="Tên công ty hoặc cá nhân cung cấp dịch vụ"
        />

        <Input
          label="Chi phí (VNĐ) *"
          type="number"
          min="0"
          step="1000"
          value={formData.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
          placeholder="Nhập chi phí dịch vụ"
        />

        {formData.cost && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Chi phí:</span>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(parseFloat(formData.cost || 0))}
            </div>
          </div>
        )}

        <Input
          label="Ngày thực hiện"
          type="datetime-local"
          value={formData.serviceDate || formatDate()}
          onChange={(e) => handleChange("serviceDate", e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả dịch vụ
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Mô tả chi tiết về dịch vụ được thực hiện..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Thêm dịch vụ
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExternalServiceModal;
