import { message } from "antd";
import { useEffect, useState } from "react";
import {
  failureTypes,
  priorities,
  repairTypes,
  severities,
} from "../../../utils/const";
import Button from "../../Common/Button/Button";
import Input from "../../Common/Input/Input";
import Select from "../../Common/Select/Select";
import { getuserTechnical } from "../../../services/userService";

const ClientRepairTicketForm = ({ onSubmit, onCancel, equipments = [] }) => {
  const [formData, setFormData] = useState({
    equipment: "",
    type: "CORRECTIVE",
    priority: "MEDIUM",
    severity: "MODERATE",
    problemDescription: "",
    symptomDetails: "",
    failureType: "",
    assignedTo: "",
    scheduledDate: "",
    startDate: "",
    endDate: "",
    rootCause: "",
    diagnosisDetails: "",
    solutionDescription: "",
    workPerformed: "",
    equipmentHoursAtFailure: "",
    equipmentHoursAtCompletion: "",
    completionNotes: "",
    followUpRequired: false,
    followUpDate: "",
    followUpNotes: "",
    isRecurring: false,
    downtime: {
      totalDowntime: "",
      productionLoss: "",
      impactDescription: "",
    },
    costs: {
      laborCost: "",
      materialCost: "",
      externalServiceCost: "",
      overheadCost: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const loadFormData = async () => {
    try {
      const [userRes] = await Promise.all([getuserTechnical({ limit: 100 })]);
      const userOptions = [
        { value: "", label: "Chọn người thực hiện" },
        ...userRes.data.map((user) => ({
          value: user._id,
          label: user.username,
        })),
      ];

      setUsers(userOptions || []);
    } catch (error) {
      console.error("Error loading form data:", error);
      message.error("Lỗi khi tải dữ liệu form");
    }
  };
  useEffect(() => {
    loadFormData();
  }, []);
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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.equipment) {
      newErrors.equipment = "Thiết bị là bắt buộc";
    }

    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = "Mô tả vấn đề là bắt buộc";
    }

    if (!formData.type) {
      newErrors.type = "Loại sửa chữa là bắt buộc";
    }

    if (!formData.priority) {
      newErrors.priority = "Mức độ ưu tiên là bắt buộc";
    }

    if (!formData.severity) {
      newErrors.severity = "Mức độ nghiêm trọng là bắt buộc";
    }

    if (formData.scheduledDate) {
      const scheduledDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (scheduledDate < now) {
        newErrors.scheduledDate = "Ngày lên lịch không thể trong quá khứ";
      }
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = "Ngày theo dõi là bắt buộc khi yêu cầu theo dõi";
    }
    if (
      formData.equipmentHoursAtFailure &&
      isNaN(formData.equipmentHoursAtFailure)
    ) {
      newErrors.equipmentHoursAtFailure = "Số giờ hoạt động phải là số";
    }

    if (
      formData.equipmentHoursAtCompletion &&
      isNaN(formData.equipmentHoursAtCompletion)
    ) {
      newErrors.equipmentHoursAtCompletion = "Số giờ hoạt động phải là số";
    }

    if (
      formData.downtime.totalDowntime &&
      isNaN(formData.downtime.totalDowntime)
    ) {
      newErrors["downtime.totalDowntime"] = "Thời gian dừng máy phải là số";
    }

    if (
      formData.downtime.productionLoss &&
      isNaN(formData.downtime.productionLoss)
    ) {
      newErrors["downtime.productionLoss"] = "Tổn thất sản xuất phải là số";
    }

    // Validate costs
    if (formData.costs.laborCost && isNaN(formData.costs.laborCost)) {
      newErrors["costs.laborCost"] = "Chi phí nhân công phải là số";
    }

    if (formData.costs.materialCost && isNaN(formData.costs.materialCost)) {
      newErrors["costs.materialCost"] = "Chi phí vật tư phải là số";
    }

    if (
      formData.costs.externalServiceCost &&
      isNaN(formData.costs.externalServiceCost)
    ) {
      newErrors["costs.externalServiceCost"] =
        "Chi phí dịch vụ bên ngoài phải là số";
    }

    if (formData.costs.overheadCost && isNaN(formData.costs.overheadCost)) {
      newErrors["costs.overheadCost"] = "Chi phí khác phải là số";
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
      const submitData = {
        ...formData,
        scheduledDate: formData.scheduledDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        followUpDate: formData.followUpDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        equipmentHoursAtFailure: formData.equipmentHoursAtFailure
          ? parseFloat(formData.equipmentHoursAtFailure)
          : undefined,
        equipmentHoursAtCompletion: formData.equipmentHoursAtCompletion
          ? parseFloat(formData.equipmentHoursAtCompletion)
          : undefined,
        downtime: {
          totalDowntime: formData.downtime.totalDowntime
            ? parseFloat(formData.downtime.totalDowntime)
            : undefined,
          productionLoss: formData.downtime.productionLoss
            ? parseFloat(formData.downtime.productionLoss)
            : undefined,
          impactDescription: formData.downtime.impactDescription || undefined,
        },
        costs: {
          laborCost: formData.costs.laborCost
            ? parseFloat(formData.costs.laborCost)
            : undefined,
          materialCost: formData.costs.materialCost
            ? parseFloat(formData.costs.materialCost)
            : undefined,
          externalServiceCost: formData.costs.externalServiceCost
            ? parseFloat(formData.costs.externalServiceCost)
            : undefined,
          overheadCost: formData.costs.overheadCost
            ? parseFloat(formData.costs.overheadCost)
            : undefined,
        },
      };

      if (Object.values(submitData.downtime).every((val) => !val)) {
        delete submitData.downtime;
      }
      if (Object.values(submitData.costs).every((val) => !val)) {
        delete submitData.costs;
      }

      await onSubmit(submitData);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const equipmentOptions = [
    { value: "", label: "Chọn thiết bị" },
    ...equipments.map((equipment) => ({
      value: equipment._id,
      label: `${equipment.equipmentCode} - ${equipment.name}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Thiết bị *"
            options={equipmentOptions}
            value={formData.equipment}
            onChange={(value) => handleChange("equipment", value)}
            error={errors.equipment}
          />

          <Select
            label="Loại sửa chữa *"
            options={repairTypes}
            value={formData.type}
            onChange={(value) => handleChange("type", value)}
            error={errors.type}
          />

          <Select
            label="Mức độ ưu tiên *"
            options={priorities}
            value={formData.priority}
            onChange={(value) => handleChange("priority", value)}
            error={errors.priority}
          />

          <Select
            label="Mức độ nghiêm trọng *"
            options={severities}
            value={formData.severity}
            onChange={(value) => handleChange("severity", value)}
            error={errors.severity}
          />

          <Select
            label="Loại hỏng hóc"
            options={failureTypes}
            value={formData.failureType}
            onChange={(value) => handleChange("failureType", value)}
          />

          <Select
            label="Người thực hiện"
            options={users}
            value={formData.assignedTo}
            onChange={(value) => handleChange("assignedTo", value)}
          />
        </div>
      </div>

      <div>
        <Input
          label="Ngày lên lịch"
          type="datetime-local"
          value={formData.scheduledDate}
          onChange={(e) => handleChange("scheduledDate", e.target.value)}
          error={errors.scheduledDate}
        />
      </div>

      <div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả vấn đề *
            </label>
            <textarea
              value={formData.problemDescription}
              onChange={(e) =>
                handleChange("problemDescription", e.target.value)
              }
              rows={4}
              className={`block p-4 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.problemDescription ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Mô tả chi tiết vấn đề gặp phải với thiết bị..."
            />
            {errors.problemDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.problemDescription}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chi tiết triệu chứng
            </label>
            <textarea
              value={formData.symptomDetails}
              onChange={(e) => handleChange("symptomDetails", e.target.value)}
              rows={3}
              className="block p-4 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Mô tả các triệu chứng cụ thể, âm thanh bất thường, rung động, v.v..."
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
          Tạo phiếu sửa chữa
        </Button>
      </div>
    </form>
  );
};

export default ClientRepairTicketForm;
