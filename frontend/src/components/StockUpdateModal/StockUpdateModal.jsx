import { useState } from "react";
import { message } from "antd";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";
import { useAuth } from "../../context/AuthContext";

const StockUpdateModal = ({ material, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "INCREASE",
    quantity: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const transactionTypes = [
    { value: "INCREASE", label: "Nhập kho (+)" },
    { value: "DECREASE", label: "Xuất kho (-)" },
  ];

  const commonReasons = {
    INCREASE: [
      { value: "", label: "Chọn lý do nhập kho..." },
      { value: "Mua hàng mới", label: "Mua hàng mới" },
      { value: "Nhập từ kho khác", label: "Nhập từ kho khác" },
      { value: "Trả hàng từ sản xuất", label: "Trả hàng từ sản xuất" },
      { value: "Điều chỉnh tồn kho", label: "Điều chỉnh tồn kho" },
      { value: "Khác", label: "Khác" },
    ],
    DECREASE: [
      { value: "", label: "Chọn lý do xuất kho..." },
      { value: "Sử dụng cho bảo dưỡng", label: "Sử dụng cho bảo dưỡng" },
      { value: "Sử dụng cho sửa chữa", label: "Sử dụng cho sửa chữa" },
      { value: "Chuyển sang kho khác", label: "Chuyển sang kho khác" },
      { value: "Hỏng hóc/mất mát", label: "Hỏng hóc/mất mát" },
      { value: "Hết hạn sử dụng", label: "Hết hạn sử dụng" },
      { value: "Điều chỉnh tồn kho", label: "Điều chỉnh tồn kho" },
      { value: "Khác", label: "Khác" },
    ],
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset reason when changing type
    if (name === "type") {
      setFormData((prev) => ({ ...prev, reason: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.quantity ||
      isNaN(formData.quantity) ||
      parseFloat(formData.quantity) <= 0
    ) {
      newErrors.quantity = "Số lượng phải là số dương";
    }

    if (
      formData.type === "DECREASE" &&
      parseFloat(formData.quantity) > material.currentStock
    ) {
      newErrors.quantity = "Số lượng xuất không được vượt quá tồn kho hiện tại";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Lý do là bắt buộc";
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
      await onSubmit({
        ...formData,
        quantity: parseFloat(formData.quantity),
        performedBy: user._id,
      });
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const calculateNewStock = () => {
    if (!formData.quantity || isNaN(formData.quantity))
      return material.currentStock;

    const quantity = parseFloat(formData.quantity);
    if (formData.type === "INCREASE") {
      return material.currentStock + quantity;
    } else {
      return Math.max(0, material.currentStock - quantity);
    }
  };

  const getStockStatusAfterUpdate = () => {
    const newStock = calculateNewStock();

    if (newStock === 0) {
      return {
        color: "text-red-600",
        text: "Hết hàng",
        icon: ExclamationCircleIcon,
      };
    } else if (newStock <= material.minStockLevel) {
      return {
        color: "text-yellow-600",
        text: "Sắp hết",
        icon: ExclamationCircleIcon,
      };
    } else {
      return { color: "text-green-600", text: "Đủ hàng", icon: CubeIcon };
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Material Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3 mb-3">
          <CubeIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900">
              {material.materialCode} - {material.name}
            </h4>
            <p className="text-sm text-gray-500">
              Tồn kho hiện tại:{" "}
              <span className="font-medium">
                {material.currentStock} {material.unit}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại giao dịch <span className="text-red-500">*</span>
        </label>
        <Select
          options={transactionTypes}
          value={formData.type}
          onChange={(value) => handleChange("type", value)}
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            error={errors.quantity}
            placeholder={`Nhập số lượng (${material.unit})`}
            min="0"
            step="0.01"
            icon={formData.type === "INCREASE" ? ArrowUpIcon : ArrowDownIcon}
          />
        </div>
        {formData.type === "DECREASE" && (
          <p className="mt-1 text-xs text-gray-500">
            Tồn kho khả dụng: {material.currentStock} {material.unit}
          </p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do <span className="text-red-500">*</span>
        </label>
        <Select
          options={commonReasons[formData.type]}
          value={formData.reason}
          onChange={(value) => handleChange("reason", value)}
          error={errors.reason}
        />

        {formData.reason === "Khác" && (
          <div className="mt-3">
            <textarea
              value={formData.customReason || ""}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập lý do cụ thể..."
            />
          </div>
        )}
      </div>

      {/* Preview */}
      {formData.quantity && !isNaN(formData.quantity) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3">Xem trước thay đổi</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tồn kho hiện tại:</span>
              <span className="ml-2 font-medium text-gray-900">
                {material.currentStock} {material.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-600">
                Số lượng {formData.type === "INCREASE" ? "nhập" : "xuất"}:
              </span>
              <span
                className={`ml-2 font-medium ${
                  formData.type === "INCREASE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formData.type === "INCREASE" ? "+" : "-"}
                {formData.quantity} {material.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tồn kho sau:</span>
              <span className="ml-2 font-medium text-blue-600">
                {calculateNewStock()} {material.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Trạng thái:</span>
              {(() => {
                const status = getStockStatusAfterUpdate();
                const IconComponent = status.icon;
                return (
                  <span
                    className={`ml-2 font-medium ${status.color} flex items-center`}
                  >
                    <IconComponent className="w-4 h-4 mr-1" />
                    {status.text}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {formData.type === "DECREASE" &&
        formData.quantity &&
        calculateNewStock() <= material.minStockLevel && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <strong>Cảnh báo:</strong> Sau khi xuất kho, tồn kho sẽ xuống
                dưới mức tối thiểu ({material.minStockLevel} {material.unit}).
              </div>
            </div>
          </div>
        )}

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
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex items-center"
        >
          {formData.type === "INCREASE" ? (
            <ArrowUpIcon className="w-4 h-4 mr-2" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-2" />
          )}
          {formData.type === "INCREASE" ? "Nhập kho" : "Xuất kho"}
        </Button>
      </div>
    </form>
  );
};

export default StockUpdateModal;
