import {
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  PrinterIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Modal as AntModal, message, Tooltip } from "antd";
import { useEffect, useState } from "react";
import Button from "../../components/Common/Button/Button";
import Input from "../../components/Common/Input/Input";
import Modal from "../../components/Common/Modal/Modal";
import Select from "../../components/Common/Select/Select";
import Table from "../../components/Common/Table/Table";
import ExportReportModal from "../../components/ExportReportModal/ExportReportModal";
import InvoiceHTML from "../../components/InvoiceHTML/InvoiceHTML";
import RepairTicketDetailModal from "../../components/RepairTicketDetailModal/RepairTicketDetailModal";
import RepairTicketForm from "../../components/RepairTicketForm/RepairTicketForm";
import StatsCard from "../../components/StatsCard/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { getEquipments } from "../../services/equipmentService";
import {
  approveRepairTicket,
  completeRepair,
  createRepairTicket,
  deleteRepairTicket,
  exportRepairReport,
  getRepairStatistics,
  getRepairTickets,
  startRepair,
  updateRepairTicket,
} from "../../services/repairTicketService";
import { getUsers } from "../../services/userService";
import { formatCurrency } from "../../utils";
const { confirm } = AntModal;

const RepairTickets = () => {
  const { isAdmin, isManager, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    type: "",
    equipment: "",
    assignedTo: "",
    failureType: "",
    severity: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTickets();
    fetchStatistics();
    fetchEquipments();
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getRepairTickets({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        type: filters.type,
        equipment: filters.equipment,
        assignedTo: filters.assignedTo,
        failureType: filters.failureType,
        severity: filters.severity,
      });
      setTickets(response.data.data || []);
      setPagination((prev) => ({ ...prev, total: response.data.meta.total }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu sửa chữa");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getRepairStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching repair statistics:", error);
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await getEquipments({ limit: 1000 });
      setEquipments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching equipments:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers({ limit: 1000 });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const refreshTicketDetail = async () => {
    if (selectedTicket) {
      try {
        // Fetch updated ticket data
        const response = await getRepairTickets({
          page: 1,
          limit: 1,
          search: selectedTicket.ticketNumber,
        });
        if (response.data.data.length > 0) {
          setSelectedTicket(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error refreshing ticket detail:", error);
      }
    }
    // Also refresh the main list
    fetchTickets();
    fetchStatistics();
  };

  const handleCreate = async (data) => {
    try {
      await createRepairTicket(data);
      message.success("Tạo phiếu sửa chữa thành công");
      setIsCreateModalOpen(false);
      fetchTickets();
      fetchStatistics();
    } catch (error) {
      message.error("Lỗi khi tạo phiếu sửa chữa");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateRepairTicket(selectedTicket._id, data);
      message.success("Cập nhật phiếu sửa chữa thành công");
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      fetchStatistics();
    } catch (error) {
      message.error("Lỗi khi cập nhật phiếu sửa chữa");
    }
  };

  const handleDelete = async (ticketId, ticketNumber) => {
    confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa phiếu sửa chữa{" "}
            <strong>{ticketNumber}</strong>?
          </p>
          <p className="text-red-500 text-sm mt-2">
            ⚠️ Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await deleteRepairTicket(ticketId);
          message.success("Xóa phiếu sửa chữa thành công");
          fetchTickets();
          fetchStatistics();
        } catch (error) {
          message.error("Lỗi khi xóa phiếu sửa chữa");
        }
      },
    });
  };

  const handleExportReport = async () => {
    setIsExportModalOpen(true);
  };

  const handleExportWithOptions = async (exportParams) => {
    try {
      setIsExporting(true);

      const response = await exportRepairReport(exportParams);

      if (response && response.data) {
        // Tạo file theo format được chọn
        if (exportParams.format === "json") {
          downloadJSON(
            response,
            `repair-report-${new Date().toISOString().split("T")[0]}.json`
          );
        } else {
          const csvContent = convertToCSV(response.data);
          downloadCSV(
            csvContent,
            `repair-report-${new Date().toISOString().split("T")[0]}.csv`
          );
        }

        message.success(
          `Xuất báo cáo thành công! Tổng ${
            response.summary?.totalTickets || 0
          } phiếu sửa chữa`
        );
      } else {
        throw new Error("No data received");
      }
    } catch (error) {
      console.error("Export error:", error);
      message.error("Lỗi khi xuất báo cáo");
      throw error;
    } finally {
      setIsExporting(false);
    }
  };
  const convertNumberToWords = (number) => {
    if (!number || number === 0) return "Không";
    const millions = Math.floor(number / 1000000);
    const thousands = Math.floor((number % 1000000) / 1000);
    const hundreds = number % 1000;

    let result = "";

    if (millions > 0) {
      result += millions + " triệu ";
    }
    if (thousands > 0) {
      result += thousands + " nghìn ";
    }
    if (hundreds > 0) {
      result += hundreds + " ";
    }

    return result.trim();
  };
  // Helper function to download JSON
  const downloadJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) {
      return "Không có dữ liệu để xuất";
    }

    // CSV Headers (tiếng Việt)
    const headers = [
      "Số phiếu",
      "Mã thiết bị",
      "Tên thiết bị",
      "Loại sửa chữa",
      "Trạng thái",
      "Mức độ ưu tiên",
      "Loại hỏng hóc",
      "Mức độ nghiêm trọng",
      "Người báo cáo",
      "Người thực hiện",
      "Mô tả vấn đề",
      "Nguyên nhân gốc",
      "Ngày báo cáo",
      "Ngày bắt đầu",
      "Ngày hoàn thành",
      "Chi phí (VNĐ)",
      "Thời gian dừng máy (giờ)",
    ];

    // Convert data to CSV rows
    const rows = data.map((item) => [
      item.ticketNumber || "",
      item.equipmentCode || "",
      item.equipmentName || "",
      getTypeText(item.type),
      getStatusText(item.status),
      getPriorityText(item.priority),
      getFailureTypeText(item.failureType),
      getSeverityText(item.severity),
      item.requestedBy || "",
      item.assignedTo || "",
      `"${(item.problemDescription || "").replace(/"/g, '""')}"`, // Escape quotes
      `"${(item.rootCause || "").replace(/"/g, '""')}"`,
      item.reportedDate
        ? new Date(item.reportedDate).toLocaleDateString("vi-VN")
        : "",
      item.actualStartDate
        ? new Date(item.actualStartDate).toLocaleDateString("vi-VN")
        : "",
      item.actualEndDate
        ? new Date(item.actualEndDate).toLocaleDateString("vi-VN")
        : "",
      item.totalCost || 0,
      item.downtime || 0,
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Add BOM for UTF-8 support in Excel
    return "\uFEFF" + csvContent;
  };

  // Helper function to download CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTypeText = (type) => {
    const typeText = {
      BREAKDOWN: "Hỏng hóc",
      CORRECTIVE: "Khắc phục",
      EMERGENCY: "Khẩn cấp",
      WARRANTY: "Bảo hành",
      OVERHAUL: "Đại tu",
    };
    return typeText[type] || type;
  };

  const getFailureTypeText = (failureType) => {
    const failureTypeText = {
      MECHANICAL: "Cơ khí",
      ELECTRICAL: "Điện",
      HYDRAULIC: "Thủy lực",
      ENGINE: "Động cơ",
      TRANSMISSION: "Hộp số",
      BRAKE_SYSTEM: "Hệ thống phanh",
      COOLING_SYSTEM: "Hệ thống làm mát",
      FUEL_SYSTEM: "Hệ thống nhiên liệu",
      COMPUTER_SYSTEM: "Hệ thống máy tính",
      OTHER: "Khác",
    };
    return failureTypeText[failureType] || failureType;
  };

  const getSeverityText = (severity) => {
    const severityText = {
      MINOR: "Nhỏ",
      MODERATE: "Vừa",
      MAJOR: "Lớn",
      CRITICAL: "Nghiêm trọng",
    };
    return severityText[severity] || severity;
  };
  const handleApprove = async (ticketId, ticketNumber) => {
    confirm({
      title: "Xác nhận phê duyệt",
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      content: `Bạn có chắc chắn muốn phê duyệt phiếu sửa chữa ${ticketNumber}?`,
      okText: "Phê duyệt",
      okType: "primary",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await approveRepairTicket(ticketId);
          message.success("Phê duyệt phiếu sửa chữa thành công");
          fetchTickets();
        } catch (error) {
          message.error("Lỗi khi phê duyệt phiếu sửa chữa");
        }
      },
    });
  };

  const handleStartRepair = async (ticketId, ticketNumber) => {
    confirm({
      title: "Bắt đầu sửa chữa",
      icon: <PlayIcon className="w-6 h-6 text-blue-500" />,
      content: `Bạn có chắc chắn muốn bắt đầu sửa chữa phiếu ${ticketNumber}?`,
      okText: "Bắt đầu",
      okType: "primary",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await startRepair(ticketId, {});
          message.success("Bắt đầu sửa chữa thành công");
          fetchTickets();
        } catch (error) {
          message.error("Lỗi khi bắt đầu sửa chữa");
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800", // Thêm trạng thái APPROVED
      DIAGNOSED: "bg-purple-100 text-purple-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusText = {
      PENDING: "Chờ xử lý",
      APPROVED: "Đã phê duyệt",
      DIAGNOSED: "Đã chẩn đoán",
      IN_PROGRESS: "Đang sửa chữa",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      ON_HOLD: "Tạm dừng",
    };
    return statusText[status] || status;
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return priorityColors[priority] || "bg-gray-100 text-gray-800";
  };

  const getPriorityText = (priority) => {
    const priorityText = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      CRITICAL: "Khẩn cấp",
    };
    return priorityText[priority] || priority;
  };
  const handlePrintInvoice = async (ticket) => {
    try {
      setIsPrinting(true);
      const invoiceHTML = generateInvoiceHTML(ticket);
      const printWindow = window.open("", "_blank");
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

      message.success("Đang chuẩn bị in hóa đơn...");
    } catch (error) {
      message.error("Lỗi khi in hóa đơn");
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const generateInvoiceHTML = (ticket) => {
    const currentDate = new Date().toLocaleDateString("vi-VN");
    const invoiceNumber = `HD-${ticket.ticketNumber}`;

    return InvoiceHTML({
      ticket,
      currentDate,
      invoiceNumber,
      getStatusText,
      getTypeText,
      getPriorityText,
      formatDate,
      convertNumberToWords,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const canPrintInvoice = (item) => {
    return item.status === "COMPLETED" && item.costs?.totalCost > 0;
  };

  const canApprove = (item) => {
    return item.status === "PENDING" && (isAdmin() || isManager());
  };

  const canStart = (item) => {
    return (
      (item.status === "APPROVED" || item.status === "DIAGNOSED") &&
      (item.assignedTo?._id === user?.userId || isAdmin() || isManager())
    );
  };

  const canComplete = (item) => {
    return (
      item.status === "IN_PROGRESS" &&
      (item.assignedTo?._id === user?.userId || isAdmin() || isManager())
    );
  };

  const canEdit = (item) => {
    return (
      item.status !== "COMPLETED" &&
      item.status !== "CANCELLED" &&
      (isAdmin() || isManager() || item.requestedBy?._id === user?.userId)
    );
  };

  const canDelete = (item) => {
    return (
      item.status === "PENDING" &&
      (isAdmin() || isManager() || item.requestedBy?._id === user?.userId)
    );
  };

  const canDiagnose = (item) => {
    return (
      (item.status === "APPROVED" || item.status === "PENDING") &&
      (item.assignedTo?._id === user?.userId || isAdmin() || isManager())
    );
  };

  const columns = [
    {
      key: "ticketNumber",
      title: "Số phiếu",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.ticketNumber}</div>
      ),
    },
    {
      key: "equipment",
      title: "Thiết bị",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.equipment?.equipmentCode}
          </div>
          <div className="text-sm text-gray-500">{item.equipment?.name}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Loại",
      render: (item) => {
        const typeText = {
          BREAKDOWN: "Hỏng hóc",
          CORRECTIVE: "Khắc phục",
          EMERGENCY: "Khẩn cấp",
          WARRANTY: "Bảo hành",
          OVERHAUL: "Đại tu",
        };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {typeText[item.type] || item.type}
          </span>
        );
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            item.status
          )}`}
        >
          {getStatusText(item.status)}
        </span>
      ),
    },
    {
      key: "priority",
      title: "Ưu tiên",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
            item.priority
          )}`}
        >
          {getPriorityText(item.priority)}
        </span>
      ),
    },
    {
      key: "assignedTo",
      title: "Người thực hiện",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.assignedTo?.username || "-"}
        </div>
      ),
    },
    {
      key: "reportedDate",
      title: "Ngày báo cáo",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.reportedDate)}
        </div>
      ),
    },
    {
      key: "totalCost",
      title: "Chi phí",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(item.costs?.totalCost)}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (item) => (
        <div className="flex items-center space-x-2">
          {/* View Details - Always visible */}
          <Tooltip title="Xem chi tiết">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTicket(item);
                setIsDetailModalOpen(true);
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
          </Tooltip>

          {canPrintInvoice(item) && (
            <Tooltip title="In hóa đơn">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePrintInvoice(item)}
                disabled={isPrinting}
                className="text-purple-600 hover:text-purple-900"
              >
                <PrinterIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
          {canApprove(item) && (
            <Tooltip title="Phê duyệt phiếu sửa chữa">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(item._id, item.ticketNumber)}
                className="text-green-600 hover:text-green-900"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {canStart(item) && (
            <Tooltip title="Bắt đầu sửa chữa">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartRepair(item._id, item.ticketNumber)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {canComplete(item) && (
            <Tooltip title="Hoàn thành sửa chữa">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  confirm({
                    title: "Hoàn thành sửa chữa",
                    icon: (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ),
                    content: `Bạn có chắc chắn đã hoàn thành sửa chữa phiếu ${item.ticketNumber}?`,
                    okText: "Hoàn thành",
                    okType: "primary",
                    cancelText: "Hủy",
                    centered: true,
                    onOk: async () => {
                      try {
                        await completeRepair(item._id, {
                          completionNotes: "Đã hoàn thành sửa chữa",
                        });
                        message.success("Hoàn thành sửa chữa thành công");
                        fetchTickets();
                      } catch (error) {
                        message.error("Lỗi khi hoàn thành sửa chữa");
                      }
                    },
                  });
                }}
                className="text-green-600 hover:text-green-900"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* Edit Button - Only when not completed/cancelled */}
          {canEdit(item) && (
            <Tooltip title="Chỉnh sửa phiếu sửa chữa">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTicket(item);
                  setIsEditModalOpen(true);
                }}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* Delete Button - Only for PENDING status */}
          {canDelete(item) && (
            <Tooltip title="Xóa phiếu sửa chữa">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item._id, item.ticketNumber)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const repairTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "BREAKDOWN", label: "Hỏng hóc" },
    { value: "CORRECTIVE", label: "Khắc phục" },
    { value: "EMERGENCY", label: "Khẩn cấp" },
    { value: "WARRANTY", label: "Bảo hành" },
    { value: "OVERHAUL", label: "Đại tu" },
  ];

  const repairStatuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "APPROVED", label: "Đã phê duyệt" }, // Thêm APPROVED
    { value: "DIAGNOSED", label: "Đã chẩn đoán" },
    { value: "IN_PROGRESS", label: "Đang sửa chữa" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "ON_HOLD", label: "Tạm dừng" },
  ];

  const priorities = [
    { value: "", label: "Tất cả mức độ" },
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Khẩn cấp" },
  ];

  const severities = [
    { value: "", label: "Tất cả mức độ" },
    { value: "MINOR", label: "Nhỏ" },
    { value: "MODERATE", label: "Vừa" },
    { value: "MAJOR", label: "Lớn" },
    { value: "CRITICAL", label: "Nghiêm trọng" },
  ];

  const equipmentOptions = [
    { value: "", label: "Tất cả thiết bị" },
    ...equipments.map((equipment) => ({
      value: equipment._id,
      label: `${equipment.equipmentCode} - ${equipment.name}`,
    })),
  ];

  const userOptions = [
    { value: "", label: "Tất cả người thực hiện" },
    ...users.map((user) => ({
      value: user._id,
      label: user.username,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phiếu sửa chữa</h1>
          <p className="mt-2 text-gray-600">
            Quản lý phiếu sửa chữa thiết bị và theo dõi tiến độ
          </p>
        </div>
        {isAdmin() && isManager() ? (
          <>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExportReport}
                disabled={isExporting}
                className="flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Tạo phiếu sửa chữa
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng phiếu"
          value={pagination.total}
          icon={WrenchScrewdriverIcon}
          color="blue"
        />
        <StatsCard
          title="Đang chờ xử lý"
          value={tickets.filter((t) => t.status === "PENDING").length}
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title="Đang sửa chữa"
          value={tickets.filter((t) => t.status === "IN_PROGRESS").length}
          icon={WrenchScrewdriverIcon}
          color="blue"
        />
        <StatsCard
          title="Hoàn thành"
          value={tickets.filter((t) => t.status === "COMPLETED").length}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <Input
              placeholder="Tìm theo số phiếu, mô tả..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              options={repairStatuses}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại sửa chữa
            </label>
            <Select
              options={repairTypes}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ ưu tiên
            </label>
            <Select
              options={priorities}
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thiết bị
            </label>
            <Select
              options={equipmentOptions}
              value={filters.equipment}
              onChange={(value) => setFilters({ ...filters, equipment: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người thực hiện
            </label>
            <Select
              options={userOptions}
              value={filters.assignedTo}
              onChange={(value) =>
                setFilters({ ...filters, assignedTo: value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ nghiêm trọng
            </label>
            <Select
              options={severities}
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  priority: "",
                  type: "",
                  equipment: "",
                  assignedTo: "",
                  failureType: "",
                  severity: "",
                })
              }
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={tickets}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, page }),
          }}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo phiếu sửa chữa mới"
        size="lg"
      >
        <RepairTicketForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          equipments={equipments}
          users={users}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTicket(null);
        }}
        title="Chỉnh sửa phiếu sửa chữa"
        size="lg"
      >
        <RepairTicketForm
          initialData={selectedTicket}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTicket(null);
          }}
          equipments={equipments}
          users={users}
        />
      </Modal>

      <RepairTicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onRefresh={refreshTicketDetail}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportWithOptions}
        currentFilters={filters}
      />
    </div>
  );
};

export default RepairTickets;
