import { useState, useEffect } from "react";
import { message } from "antd";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";
import Modal from "../Common/Modal/Modal";
import { getMaterials } from "../../services/materialService";

const AddMaterialModal = ({ isOpen, onClose, onSubmit, ticketId }) => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    materialId: "",
    quantityUsed: "",
    isWarrantyItem: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials({ limit: 1000 });
      setMaterials(response.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách vật tư");
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.materialId) {
      message.error("Vui lòng chọn vật tư");
      return;
    }

    if (!formData.quantityUsed || formData.quantityUsed <= 0) {
      message.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        materialId: "",
        quantityUsed: "",
        isWarrantyItem: false,
      });
      onClose();
    } catch (error) {
      message.error("Lỗi khi thêm vật tư");
    } finally {
      setLoading(false);
    }
  };

  const materialOptions = [
    { value: "", label: "Chọn vật tư" },
    ...materials.map((material) => ({
      value: material._id,
      label: `${material.materialCode} - ${material.name} (Tồn kho: ${material.currentStock} ${material.unit})`,
      data: material,
    })),
  ];

  const selectedMaterial = materials.find((m) => m._id === formData.materialId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm vật tư sử dụng"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Vật tư *"
          options={materialOptions}
          value={formData.materialId}
          onChange={(value) => handleChange("materialId", value)}
        />

        {selectedMaterial && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Đơn vị:</span>{" "}
                {selectedMaterial.unit}
              </div>
              <div>
                <span className="font-medium">Đơn giá:</span>{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedMaterial.unitPrice)}
              </div>
              <div>
                <span className="font-medium">Tồn kho:</span>{" "}
                {selectedMaterial.currentStock} {selectedMaterial.unit}
              </div>
              <div>
                <span className="font-medium">Vị trí:</span>{" "}
                {selectedMaterial.location || "Chưa có"}
              </div>
            </div>
          </div>
        )}

        <Input
          label="Số lượng sử dụng *"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.quantityUsed}
          onChange={(e) => handleChange("quantityUsed", e.target.value)}
          placeholder="Nhập số lượng sử dụng"
        />

        {selectedMaterial && formData.quantityUsed && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Thành tiền dự kiến:</span>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(
                selectedMaterial.unitPrice *
                  parseFloat(formData.quantityUsed || 0)
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isWarrantyItem"
            checked={formData.isWarrantyItem}
            onChange={(e) => handleChange("isWarrantyItem", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isWarrantyItem" className="text-sm text-gray-700">
            Vật tư bảo hành (không tính phí)
          </label>
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
            Thêm vật tư
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMaterialModal;
