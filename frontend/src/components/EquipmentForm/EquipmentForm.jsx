import { message } from "antd";
import { useEffect, useState } from "react";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";

const EquipmentForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    equipmentCode: "",
    name: "",
    type: "",
    model: "",
    brand: "",
    serialNumber: "",
    suppliedDate: "",
    purchasePrice: "",
    currentValue: "",
    location: "",
    specifications: {
      capacity: "",
      fuelType: "",
      enginePower: "",
      maxLiftHeight: "",
    },
    warrantyInfo: {
      warrantyStartDate: "",
      warrantyEndDate: "",
      warrantyProvider: "",
    },
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipmentCode: initialData.equipmentCode || "",
        name: initialData.name || "",
        type: initialData.type || "",
        model: initialData.model || "",
        brand: initialData.brand || "",
        serialNumber: initialData.serialNumber || "",
        suppliedDate: initialData.suppliedDate
          ? new Date(initialData.suppliedDate).toISOString().split("T")[0]
          : "",
        purchasePrice: initialData.purchasePrice || "",
        currentValue: initialData.currentValue || "",
        location: initialData.location || "",
        specifications: {
          capacity: initialData.specifications?.capacity || "",
          fuelType: initialData.specifications?.fuelType || "",
          enginePower: initialData.specifications?.enginePower || "",
          maxLiftHeight: initialData.specifications?.maxLiftHeight || "",
        },
        warrantyInfo: {
          warrantyStartDate: initialData.warrantyInfo?.warrantyStartDate
            ? new Date(initialData.warrantyInfo.warrantyStartDate)
                .toISOString()
                .split("T")[0]
            : "",
          warrantyEndDate: initialData.warrantyInfo?.warrantyEndDate
            ? new Date(initialData.warrantyInfo.warrantyEndDate)
                .toISOString()
                .split("T")[0]
            : "",
          warrantyProvider: initialData.warrantyInfo?.warrantyProvider || "",
        },
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const equipmentTypes = [
    { value: "CRANE", label: "Cẩu" },
    { value: "FORKLIFT", label: "Xe nâng" },
    { value: "TRACTOR", label: "Đầu kéo" },
    { value: "TRUCK", label: "Xe tải" },
    { value: "EXCAVATOR", label: "Máy xúc" },
    { value: "OTHER", label: "Khác" },
  ];

  const fuelTypes = [
    { value: "", label: "Chọn loại nhiên liệu" },
    { value: "DIESEL", label: "Dầu Diesel" },
    { value: "ELECTRIC", label: "Điện" },
    { value: "GASOLINE", label: "Xăng" },
    { value: "HYBRID", label: "Hybrid" },
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
    if (!formData.equipmentCode.trim()) {
      newErrors.equipmentCode = "Mã thiết bị là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên thiết bị là bắt buộc";
    }

    if (!formData.type) {
      newErrors.type = "Loại thiết bị là bắt buộc";
    }

    if (!formData.suppliedDate) {
      newErrors.suppliedDate = "Ngày cung cấp là bắt buộc";
    }

    // Validate numbers
    if (formData.purchasePrice && isNaN(formData.purchasePrice)) {
      newErrors.purchasePrice = "Giá mua phải là số";
    }

    if (formData.currentValue && isNaN(formData.currentValue)) {
      newErrors.currentValue = "Giá trị hiện tại phải là số";
    }

    if (
      formData.specifications.capacity &&
      isNaN(formData.specifications.capacity)
    ) {
      newErrors["specifications.capacity"] = "Sức chứa phải là số";
    }

    if (
      formData.specifications.enginePower &&
      isNaN(formData.specifications.enginePower)
    ) {
      newErrors["specifications.enginePower"] = "Công suất động cơ phải là số";
    }

    if (
      formData.specifications.maxLiftHeight &&
      isNaN(formData.specifications.maxLiftHeight)
    ) {
      newErrors["specifications.maxLiftHeight"] =
        "Chiều cao nâng tối đa phải là số";
    }

    // Validate warranty dates
    if (
      formData.warrantyInfo.warrantyStartDate &&
      formData.warrantyInfo.warrantyEndDate
    ) {
      if (
        new Date(formData.warrantyInfo.warrantyStartDate) >
        new Date(formData.warrantyInfo.warrantyEndDate)
      ) {
        newErrors["warrantyInfo.warrantyEndDate"] =
          "Ngày kết thúc bảo hành phải sau ngày bắt đầu";
      }
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
        purchasePrice: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : undefined,
        currentValue: formData.currentValue
          ? parseFloat(formData.currentValue)
          : undefined,
        specifications: {
          capacity: formData.specifications.capacity
            ? parseFloat(formData.specifications.capacity)
            : undefined,
          fuelType: formData.specifications.fuelType || undefined,
          enginePower: formData.specifications.enginePower
            ? parseFloat(formData.specifications.enginePower)
            : undefined,
          maxLiftHeight: formData.specifications.maxLiftHeight
            ? parseFloat(formData.specifications.maxLiftHeight)
            : undefined,
        },
        warrantyInfo: {
          warrantyStartDate:
            formData.warrantyInfo.warrantyStartDate || undefined,
          warrantyEndDate: formData.warrantyInfo.warrantyEndDate || undefined,
          warrantyProvider: formData.warrantyInfo.warrantyProvider || undefined,
        },
      };

      // Remove empty nested objects
      if (Object.values(submitData.specifications).every((val) => !val)) {
        delete submitData.specifications;
      }
      if (Object.values(submitData.warrantyInfo).every((val) => !val)) {
        delete submitData.warrantyInfo;
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
            label="Mã thiết bị *"
            value={formData.equipmentCode}
            onChange={(e) => handleChange("equipmentCode", e.target.value)}
            error={errors.equipmentCode}
            placeholder="Nhập mã thiết bị"
          />

          <Input
            label="Tên thiết bị *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Nhập tên thiết bị"
          />

          <Select
            label="Loại thiết bị *"
            options={[
              { value: "", label: "Chọn loại thiết bị" },
              ...equipmentTypes,
            ]}
            value={formData.type}
            onChange={(value) => handleChange("type", value)}
            error={errors.type}
          />

          <Input
            label="Model"
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="Nhập model"
          />

          <Input
            label="Thương hiệu"
            value={formData.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
            placeholder="Nhập thương hiệu"
          />

          <Input
            label="Số serial"
            value={formData.serialNumber}
            onChange={(e) => handleChange("serialNumber", e.target.value)}
            placeholder="Nhập số serial"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin tài chính
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Ngày cung cấp *"
            type="date"
            value={formData.suppliedDate}
            onChange={(e) => handleChange("suppliedDate", e.target.value)}
            error={errors.suppliedDate}
          />

          <Input
            label="Giá mua (VNĐ)"
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => handleChange("purchasePrice", e.target.value)}
            error={errors.purchasePrice}
            placeholder="0"
          />

          <Input
            label="Giá trị hiện tại (VNĐ)"
            type="number"
            value={formData.currentValue}
            onChange={(e) => handleChange("currentValue", e.target.value)}
            error={errors.currentValue}
            placeholder="0"
          />
        </div>
      </div>

      {/* Location and Assignment */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Vị trí và phân công
        </h3>
        <Input
          label="Vị trí"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Nhập vị trí thiết bị"
        />
      </div>

      {/* Technical Specifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông số kỹ thuật
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Sức chứa"
            type="number"
            value={formData.specifications.capacity}
            onChange={(e) =>
              handleChange("specifications.capacity", e.target.value)
            }
            error={errors["specifications.capacity"]}
            placeholder="0"
          />

          <Select
            label="Loại nhiên liệu"
            options={fuelTypes}
            value={formData.specifications.fuelType}
            onChange={(value) => handleChange("specifications.fuelType", value)}
          />

          <Input
            label="Công suất động cơ (HP)"
            type="number"
            value={formData.specifications.enginePower}
            onChange={(e) =>
              handleChange("specifications.enginePower", e.target.value)
            }
            error={errors["specifications.enginePower"]}
            placeholder="0"
          />

          <Input
            label="Chiều cao nâng tối đa (m)"
            type="number"
            value={formData.specifications.maxLiftHeight}
            onChange={(e) =>
              handleChange("specifications.maxLiftHeight", e.target.value)
            }
            error={errors["specifications.maxLiftHeight"]}
            placeholder="0"
          />
        </div>
      </div>

      {/* Warranty Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin bảo hành
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Ngày bắt đầu bảo hành"
            type="date"
            value={formData.warrantyInfo.warrantyStartDate}
            onChange={(e) =>
              handleChange("warrantyInfo.warrantyStartDate", e.target.value)
            }
          />

          <Input
            label="Ngày kết thúc bảo hành"
            type="date"
            value={formData.warrantyInfo.warrantyEndDate}
            onChange={(e) =>
              handleChange("warrantyInfo.warrantyEndDate", e.target.value)
            }
            error={errors["warrantyInfo.warrantyEndDate"]}
          />

          <Input
            label="Nhà cung cấp bảo hành"
            value={formData.warrantyInfo.warrantyProvider}
            onChange={(e) =>
              handleChange("warrantyInfo.warrantyProvider", e.target.value)
            }
            placeholder="Nhập nhà cung cấp bảo hành"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Nhập ghi chú về thiết bị..."
        />
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

export default EquipmentForm;
