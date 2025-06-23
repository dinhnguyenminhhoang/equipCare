import { useState } from "react";
import { message } from "antd";
import Button from "../Common/Button/Button";
import Input from "../Common/Input/Input";
import Select from "../Common/Select/Select";
import Modal from "../Common/Modal/Modal";
import {
  DocumentArrowDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const ExportReportModal = ({ isOpen, onClose, onExport, currentFilters }) => {
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    fromDate: "",
    toDate: "",
    format: "csv",
    includeDetails: true,
    includeStatistics: true,
    useCurrentFilters: true,
  });

  const handleChange = (name, value) => {
    setExportOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExport = async () => {
    // Validate dates
    if (exportOptions.fromDate && exportOptions.toDate) {
      const fromDate = new Date(exportOptions.fromDate);
      const toDate = new Date(exportOptions.toDate);
      if (toDate < fromDate) {
        message.error("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }
    }

    setLoading(true);
    try {
      const exportParams = {
        fromDate: exportOptions.fromDate || null,
        toDate: exportOptions.toDate || null,
        format: exportOptions.format,
        includeDetails: exportOptions.includeDetails,
        includeStatistics: exportOptions.includeStatistics,
      };

      // Nếu sử dụng filter hiện tại
      if (exportOptions.useCurrentFilters) {
        Object.assign(exportParams, currentFilters);
      }

      await onExport(exportParams);
      onClose();

      // Reset form
      setExportOptions({
        fromDate: "",
        toDate: "",
        format: "csv",
        includeDetails: true,
        includeStatistics: true,
        useCurrentFilters: true,
      });
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { value: "csv", label: "CSV (Excel)" },
    { value: "json", label: "JSON" },
  ];

  const getFilterSummary = () => {
    const activeFilters = [];
    if (currentFilters.search)
      activeFilters.push(`Tìm kiếm: "${currentFilters.search}"`);
    if (currentFilters.status)
      activeFilters.push(`Trạng thái: ${currentFilters.status}`);
    if (currentFilters.priority)
      activeFilters.push(`Ưu tiên: ${currentFilters.priority}`);
    if (currentFilters.type) activeFilters.push(`Loại: ${currentFilters.type}`);

    return activeFilters.length > 0
      ? activeFilters.join(", ")
      : "Không có bộ lọc nào được áp dụng";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
          <span>Xuất báo cáo phiếu sửa chữa</span>
        </div>
      }
      size="md"
    >
      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Khoảng thời gian
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Từ ngày"
              type="date"
              value={exportOptions.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
              icon={CalendarIcon}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={exportOptions.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              icon={CalendarIcon}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Để trống để xuất tất cả dữ liệu
          </p>
        </div>

        {/* Format */}
        <div>
          <Select
            label="Định dạng file"
            options={formatOptions}
            value={exportOptions.format}
            onChange={(value) => handleChange("format", value)}
          />
        </div>

        {/* Current Filters */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="useCurrentFilters"
              checked={exportOptions.useCurrentFilters}
              onChange={(e) =>
                handleChange("useCurrentFilters", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="useCurrentFilters"
              className="text-sm font-medium text-gray-900"
            >
              Sử dụng bộ lọc hiện tại
            </label>
          </div>
          {exportOptions.useCurrentFilters && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Bộ lọc áp dụng:</strong> {getFilterSummary()}
              </p>
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Tùy chọn xuất
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeDetails"
                checked={exportOptions.includeDetails}
                onChange={(e) =>
                  handleChange("includeDetails", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeDetails" className="text-sm text-gray-700">
                Bao gồm chi tiết phiếu sửa chữa
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeStatistics"
                checked={exportOptions.includeStatistics}
                onChange={(e) =>
                  handleChange("includeStatistics", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="includeStatistics"
                className="text-sm text-gray-700"
              >
                Bao gồm thống kê tổng hợp
              </label>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Thông tin xuất
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Định dạng: {exportOptions.format.toUpperCase()}</p>
            <p>
              • Khoảng thời gian:{" "}
              {exportOptions.fromDate || exportOptions.toDate
                ? `${exportOptions.fromDate || "Từ đầu"} đến ${
                    exportOptions.toDate || "hiện tại"
                  }`
                : "Toàn bộ dữ liệu"}
            </p>
            <p>
              • Bộ lọc:{" "}
              {exportOptions.useCurrentFilters ? "Có áp dụng" : "Không áp dụng"}
            </p>
            <p>• Chi tiết: {exportOptions.includeDetails ? "Có" : "Không"}</p>
            <p>
              • Thống kê: {exportOptions.includeStatistics ? "Có" : "Không"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleExport} loading={loading}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            {loading ? "Đang xuất..." : "Xuất báo cáo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportReportModal;
