import { useState, useEffect } from "react";
import { message } from "antd";
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CogIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";
import { getMaterials } from "../../services/materialService";

const MaintenanceLevelForm = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    levelCode: "",
    name: "",
    description: "",
    intervalHours: 240,
    intervalType: "HOURS",
    equipmentTypes: [],
    requiredTasks: [],
    requiredMaterials: [],
    estimatedCost: {
      laborCost: 0,
      materialCost: 0,
      totalCost: 0,
    },
    estimatedDuration: 0,
    priority: "MEDIUM",
    safetyRequirements: [],
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        levelCode: initialData.levelCode || "",
        name: initialData.name || "",
        description: initialData.description || "",
        intervalHours: initialData.intervalHours || 240,
        intervalType: initialData.intervalType || "HOURS",
        equipmentTypes: initialData.equipmentTypes || [],
        requiredTasks: initialData.requiredTasks || [],
        requiredMaterials: initialData.requiredMaterials || [],
        estimatedCost: initialData.estimatedCost || {
          laborCost: 0,
          materialCost: 0,
          totalCost: 0,
        },
        estimatedDuration: initialData.estimatedDuration || 0,
        priority: initialData.priority || "MEDIUM",
        safetyRequirements: initialData.safetyRequirements || [],
      });
    }
  }, [initialData]);

  // Tính toán tổng chi phí khi có thay đổi
  useEffect(() => {
    const materialCost = formData.requiredMaterials.reduce((total, item) => {
      const material = materials.find((m) => m._id === item.material);
      return total + (material ? material.unitPrice * item.quantity : 0);
    }, 0);

    const totalCost = formData.estimatedCost.laborCost + materialCost;

    setFormData((prev) => ({
      ...prev,
      estimatedCost: {
        ...prev.estimatedCost,
        materialCost,
        totalCost,
      },
    }));
  }, [formData.requiredMaterials, formData.estimatedCost.laborCost, materials]);

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials({ limit: 100 });
      setMaterials(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addToArray = (arrayName, newItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem],
    }));
  };

  const removeFromArray = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.levelCode.trim()) {
      newErrors.levelCode = "Mã cấp bảo dưỡng là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên cấp bảo dưỡng là bắt buộc";
    }

    if (!formData.intervalHours) {
      newErrors.intervalHours = "Chu kỳ bảo dưỡng là bắt buộc";
    }

    if (formData.equipmentTypes.length === 0) {
      newErrors.equipmentTypes = "Phải chọn ít nhất một loại thiết bị";
    }

    if (formData.requiredTasks.length === 0) {
      newErrors.requiredTasks = "Phải có ít nhất một công việc bắt buộc";
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
      await onSubmit(formData);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const equipmentTypeOptions = [
    { value: "CRANE", label: "Cẩu" },
    { value: "FORKLIFT", label: "Xe nâng" },
    { value: "TRACTOR", label: "Đầu kéo" },
    { value: "TRUCK", label: "Xe tải" },
    { value: "EXCAVATOR", label: "Máy xúc" },
    { value: "OTHER", label: "Khác" },
  ];

  const intervalOptions = [
    { value: 60, label: "60 giờ" },
    { value: 120, label: "120 giờ" },
    { value: 240, label: "240 giờ" },
    { value: 480, label: "480 giờ" },
    { value: 1000, label: "1000 giờ" },
    { value: 2000, label: "2000 giờ" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Khẩn cấp" },
  ];

  const skillLevelOptions = [
    { value: "BASIC", label: "Cơ bản" },
    { value: "INTERMEDIATE", label: "Trung bình" },
    { value: "ADVANCED", label: "Nâng cao" },
    { value: "EXPERT", label: "Chuyên gia" },
  ];

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              label="Mã cấp bảo dưỡng *"
              value={formData.levelCode}
              onChange={(e) =>
                handleChange("levelCode", e.target.value.toUpperCase())
              }
              error={errors.levelCode}
              placeholder="Nhập mã cấp (VD: L1, L2...)"
            />

            <Input
              label="Tên cấp bảo dưỡng *"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              placeholder="Nhập tên cấp bảo dưỡng"
            />

            <Select
              label="Chu kỳ bảo dưỡng *"
              options={intervalOptions}
              value={formData.intervalHours}
              onChange={(value) =>
                handleChange("intervalHours", parseInt(value))
              }
              error={errors.intervalHours}
            />

            <Select
              label="Mức ưu tiên"
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => handleChange("priority", value)}
            />

            <div className="lg:col-span-2">
              <Input
                label="Ước tính thời gian (giờ)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  handleChange(
                    "estimatedDuration",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Nhập mô tả chi tiết về cấp bảo dưỡng..."
              />
            </div>
          </div>
        </div>

        {/* Loại thiết bị áp dụng */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Loại thiết bị áp dụng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {equipmentTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.equipmentTypes.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange("equipmentTypes", [
                        ...formData.equipmentTypes,
                        option.value,
                      ]);
                    } else {
                      handleChange(
                        "equipmentTypes",
                        formData.equipmentTypes.filter(
                          (type) => type !== option.value
                        )
                      );
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.equipmentTypes && (
            <p className="mt-1 text-sm text-red-600">{errors.equipmentTypes}</p>
          )}
        </div>

        {/* Công việc bắt buộc */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Công việc bắt buộc
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addToArray("requiredTasks", {
                  taskCode: "",
                  taskName: "",
                  description: "",
                  estimatedDuration: 0,
                  skillLevel: "BASIC",
                  isRequired: true,
                })
              }
              className="flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm công việc
            </Button>
          </div>

          <div className="space-y-4">
            {formData.requiredTasks.map((task, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {index + 1}
                    </span>
                    <h4 className="font-medium text-gray-900">
                      Công việc {index + 1}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray("requiredTasks", index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    label="Mã công việc *"
                    value={task.taskCode}
                    onChange={(e) =>
                      handleArrayChange(
                        "requiredTasks",
                        index,
                        "taskCode",
                        e.target.value
                      )
                    }
                    placeholder="Nhập mã công việc"
                  />

                  <Input
                    label="Tên công việc *"
                    value={task.taskName}
                    onChange={(e) =>
                      handleArrayChange(
                        "requiredTasks",
                        index,
                        "taskName",
                        e.target.value
                      )
                    }
                    placeholder="Nhập tên công việc"
                  />

                  <Input
                    label="Thời gian ước tính (phút)"
                    type="number"
                    value={task.estimatedDuration}
                    onChange={(e) =>
                      handleArrayChange(
                        "requiredTasks",
                        index,
                        "estimatedDuration",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min="0"
                  />

                  <Select
                    label="Trình độ yêu cầu"
                    options={skillLevelOptions}
                    value={task.skillLevel}
                    onChange={(value) =>
                      handleArrayChange(
                        "requiredTasks",
                        index,
                        "skillLevel",
                        value
                      )
                    }
                  />

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả công việc
                    </label>
                    <textarea
                      value={task.description}
                      onChange={(e) =>
                        handleArrayChange(
                          "requiredTasks",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Mô tả chi tiết cách thực hiện..."
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={task.isRequired}
                        onChange={(e) =>
                          handleArrayChange(
                            "requiredTasks",
                            index,
                            "isRequired",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Công việc bắt buộc
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.requiredTasks && (
            <p className="mt-1 text-sm text-red-600">{errors.requiredTasks}</p>
          )}

          {formData.requiredTasks.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Chưa có công việc nào
              </p>
              <p className="text-xs text-gray-400">
                Nhấn "Thêm công việc" để bắt đầu
              </p>
            </div>
          )}
        </div>

        {/* Vật tư cần thiết */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Vật tư cần thiết
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addToArray("requiredMaterials", {
                  material: "",
                  quantity: 1,
                  isOptional: false,
                })
              }
              className="flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm vật tư
            </Button>
          </div>

          <div className="space-y-4">
            {formData.requiredMaterials.map((materialItem, index) => {
              const selectedMaterial = materials.find(
                (m) => m._id === materialItem.material
              );
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">
                      Vật tư {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeFromArray("requiredMaterials", index)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vật tư *
                      </label>
                      <select
                        value={materialItem.material}
                        onChange={(e) =>
                          handleArrayChange(
                            "requiredMaterials",
                            index,
                            "material",
                            e.target.value
                          )
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Chọn vật tư...</option>
                        {materials.map((material) => (
                          <option key={material._id} value={material._id}>
                            {material.materialCode} - {material.name} (
                            {material.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Số lượng *"
                      type="number"
                      value={materialItem.quantity}
                      onChange={(e) =>
                        handleArrayChange(
                          "requiredMaterials",
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      placeholder="1"
                      min="1"
                    />

                    <div className="flex items-end">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={materialItem.isOptional}
                          onChange={(e) =>
                            handleArrayChange(
                              "requiredMaterials",
                              index,
                              "isOptional",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Tùy chọn</span>
                      </label>
                    </div>
                  </div>

                  {selectedMaterial && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Đơn giá:</span>{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(selectedMaterial.unitPrice)}
                          </div>
                          <div>
                            <span className="font-medium">Tồn kho:</span>{" "}
                            {selectedMaterial.currentStock}{" "}
                            {selectedMaterial.unit}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Thành tiền:</span>{" "}
                            <span className="text-green-600 font-semibold">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(
                                selectedMaterial.unitPrice *
                                  materialItem.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {formData.requiredMaterials.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chưa có vật tư nào</p>
              <p className="text-xs text-gray-400">
                Nhấn "Thêm vật tư" để bắt đầu
              </p>
            </div>
          )}
        </div>

        {/* Ước tính chi phí */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Ước tính chi phí
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Chi phí nhân công (VNĐ)"
                type="number"
                value={formData.estimatedCost.laborCost}
                onChange={(e) =>
                  handleNestedChange(
                    "estimatedCost",
                    "laborCost",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
                min="0"
                icon={CurrencyDollarIcon}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí vật tư (VNĐ)
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(
                  formData.estimatedCost.materialCost
                )}
              </div>
              <div className="text-xs text-gray-500">Tự động tính toán</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Tổng chi phí (VNĐ)
              </label>
              <div className="text-lg font-bold text-blue-900">
                {new Intl.NumberFormat("vi-VN").format(
                  formData.estimatedCost.totalCost
                )}
              </div>
              <div className="text-xs text-blue-600">Nhân công + Vật tư</div>
            </div>
          </div>
        </div>

        {/* Yêu cầu an toàn */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Yêu cầu an toàn
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addToArray("safetyRequirements", "")}
              className="flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm yêu cầu
            </Button>
          </div>

          <div className="space-y-3">
            {formData.safetyRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <ShieldExclamationIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) =>
                    handleArrayChange(
                      "safetyRequirements",
                      index,
                      null,
                      e.target.value
                    )
                  }
                  className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Nhập yêu cầu an toàn..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromArray("safetyRequirements", index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {formData.safetyRequirements.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <ShieldExclamationIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Chưa có yêu cầu an toàn nào
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
            <CogIcon className="w-4 h-4 mr-2" />
            {initialData ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceLevelForm;
