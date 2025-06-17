import { message } from "antd";
import { useEffect, useState } from "react";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";

const MaterialForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    materialCode: "",
    name: "",
    description: "",
    category: "",
    unit: "",
    unitPrice: "",
    minStockLevel: "",
    maxStockLevel: "",
    currentStock: "",
    supplier: {
      name: "",
      contact: "",
      phone: "",
      email: "",
    },
    storageLocation: "",
    expiryDate: "",
    barcode: "",
    isPerishable: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        materialCode: initialData.materialCode || "",
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        unit: initialData.unit || "",
        unitPrice: initialData.unitPrice || "",
        minStockLevel: initialData.minStockLevel || "",
        maxStockLevel: initialData.maxStockLevel || "",
        currentStock: initialData.currentStock || "",
        supplier: {
          name: initialData.supplier?.name || "",
          contact: initialData.supplier?.contact || "",
          phone: initialData.supplier?.phone || "",
          email: initialData.supplier?.email || "",
        },
        storageLocation: initialData.storageLocation || "",
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split("T")[0]
          : "",
        barcode: initialData.barcode || "",
        isPerishable: initialData.isPerishable || false,
      });
    }
  }, [initialData]);

  const materialCategories = [
    { value: "", label: "Chọn danh mục" },
    { value: "ENGINE_OIL", label: "Dầu động cơ" },
    { value: "HYDRAULIC_OIL", label: "Dầu thủy lực" },
    { value: "FILTER", label: "Bộ lọc" },
    { value: "BRAKE_PAD", label: "Má phanh" },
    { value: "TIRE", label: "Lốp xe" },
    { value: "SPARE_PART", label: "Phụ tùng" },
    { value: "LUBRICANT", label: "Chất bôi trơn" },
    { value: "COOLANT", label: "Chất làm mát" },
    { value: "BELT", label: "Dây đai" },
    { value: "BATTERY", label: "Ắc quy" },
    { value: "OTHER", label: "Khác" },
  ];

  const materialUnits = [
    { value: "", label: "Chọn đơn vị" },
    { value: "LITER", label: "Lít" },
    { value: "PIECE", label: "Cái" },
    { value: "KG", label: "Kg" },
    { value: "METER", label: "Mét" },
    { value: "BOX", label: "Hộp" },
    { value: "SET", label: "Bộ" },
    { value: "BOTTLE", label: "Chai" },
  ];

  const handleChange = (name, value) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    if (!formData.materialCode.trim()) {
      newErrors.materialCode = "Mã vật tư là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên vật tư là bắt buộc";
    }

    if (!formData.category) {
      newErrors.category = "Danh mục là bắt buộc";
    }

    if (!formData.unit) {
      newErrors.unit = "Đơn vị tính là bắt buộc";
    }

    if (!formData.unitPrice || isNaN(formData.unitPrice)) {
      newErrors.unitPrice = "Đơn giá phải là số";
    }

    if (formData.minStockLevel && isNaN(formData.minStockLevel)) {
      newErrors.minStockLevel = "Mức tồn kho tối thiểu phải là số";
    }

    if (formData.maxStockLevel && isNaN(formData.maxStockLevel)) {
      newErrors.maxStockLevel = "Mức tồn kho tối đa phải là số";
    }

    if (formData.currentStock && isNaN(formData.currentStock)) {
      newErrors.currentStock = "Tồn kho hiện tại phải là số";
    }

    // Validate email format
    if (
      formData.supplier.email &&
      !/\S+@\S+\.\S+/.test(formData.supplier.email)
    ) {
      newErrors["supplier.email"] = "Email không hợp lệ";
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
      // Clean up data before submitting
      const submitData = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        minStockLevel: formData.minStockLevel
          ? parseInt(formData.minStockLevel)
          : 0,
        maxStockLevel: formData.maxStockLevel
          ? parseInt(formData.maxStockLevel)
          : undefined,
        currentStock: formData.currentStock
          ? parseInt(formData.currentStock)
          : 0,
        expiryDate: formData.expiryDate || undefined,
      };

      // Remove empty supplier object if no data
      if (Object.values(submitData.supplier).every((val) => !val)) {
        delete submitData.supplier;
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
            label="Mã vật tư *"
            value={formData.materialCode}
            onChange={(e) => handleChange("materialCode", e.target.value)}
            error={errors.materialCode}
            placeholder="Nhập mã vật tư"
          />

          <Input
            label="Tên vật tư *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Nhập tên vật tư"
          />

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập mô tả vật tư..."
            />
          </div>
        </div>
      </div>

      {/* Category and Unit */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Phân loại và đơn vị
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Danh mục *"
            options={materialCategories}
            value={formData.category}
            onChange={(value) => handleChange("category", value)}
            error={errors.category}
          />

          <Select
            label="Đơn vị tính *"
            options={materialUnits}
            value={formData.unit}
            onChange={(value) => handleChange("unit", value)}
            error={errors.unit}
          />
        </div>
      </div>

      {/* Pricing and Stock */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Giá cả và tồn kho
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Đơn giá (VNĐ) *"
            type="number"
            value={formData.unitPrice}
            onChange={(e) => handleChange("unitPrice", e.target.value)}
            error={errors.unitPrice}
            placeholder="0"
            min="0"
          />

          <Input
            label="Tồn kho hiện tại"
            type="number"
            value={formData.currentStock}
            onChange={(e) => handleChange("currentStock", e.target.value)}
            error={errors.currentStock}
            placeholder="0"
            min="0"
          />

          <Input
            label="Mức tồn kho tối thiểu"
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => handleChange("minStockLevel", e.target.value)}
            error={errors.minStockLevel}
            placeholder="0"
            min="0"
          />

          <Input
            label="Mức tồn kho tối đa"
            type="number"
            value={formData.maxStockLevel}
            onChange={(e) => handleChange("maxStockLevel", e.target.value)}
            error={errors.maxStockLevel}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Storage and Expiry */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Lưu trữ và hạn sử dụng
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Vị trí lưu trữ"
            value={formData.storageLocation}
            onChange={(e) => handleChange("storageLocation", e.target.value)}
            placeholder="Nhập vị trí lưu trữ"
          />

          <Input
            label="Mã vạch"
            value={formData.barcode}
            onChange={(e) => handleChange("barcode", e.target.value)}
            placeholder="Nhập mã vạch"
          />

          <div className="flex items-center space-x-3">
            <input
              id="isPerishable"
              type="checkbox"
              checked={formData.isPerishable}
              onChange={(e) => handleChange("isPerishable", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPerishable"
              className="text-sm font-medium text-gray-700"
            >
              Có hạn sử dụng
            </label>
          </div>
        </div>

        {formData.isPerishable && (
          <div className="mt-4">
            <Input
              label="Hạn sử dụng"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}
      </div>

      {/* Supplier Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin nhà cung cấp
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Tên nhà cung cấp"
            value={formData.supplier.name}
            onChange={(e) => handleChange("supplier.name", e.target.value)}
            placeholder="Nhập tên nhà cung cấp"
          />

          <Input
            label="Người liên hệ"
            value={formData.supplier.contact}
            onChange={(e) => handleChange("supplier.contact", e.target.value)}
            placeholder="Nhập tên người liên hệ"
          />

          <Input
            label="Số điện thoại"
            value={formData.supplier.phone}
            onChange={(e) => handleChange("supplier.phone", e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <Input
            label="Email"
            type="email"
            value={formData.supplier.email}
            onChange={(e) => handleChange("supplier.email", e.target.value)}
            error={errors["supplier.email"]}
            placeholder="Nhập email"
          />
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
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
