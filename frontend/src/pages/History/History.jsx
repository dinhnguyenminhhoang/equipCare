import {
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  HomeFilled,
  LogoutOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  ToolOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Layout,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import { getHistory } from "../../services/userService";
import { formatCurrency, formatDate } from "../../utils";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const History = () => {
  const [history, setHistory] = useState({
    maintenanceTicketsHistory: [],
    repairTicketsHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("maintenance");

  // Search and Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const { logout } = useAuth();
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory();
      setHistory(
        response || {
          maintenanceTicketsHistory: [],
          repairTicketsHistory: [],
        }
      );
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter functions
  const filterBySearch = (data, searchText) => {
    if (!searchText) return data;
    const searchLower = searchText.toLowerCase();
    return data.filter(
      (item) =>
        (item.ticketNumber &&
          item.ticketNumber.toLowerCase().includes(searchLower)) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
        (item.problemDescription &&
          item.problemDescription.toLowerCase().includes(searchLower)) ||
        (item.symptomDetails &&
          item.symptomDetails.toLowerCase().includes(searchLower))
    );
  };

  const filterByStatus = (data, status) => {
    if (!status) return data;
    return data.filter((item) => item.status === status);
  };

  const filterByPriority = (data, priority) => {
    if (!priority) return data;
    return data.filter((item) => item.priority === priority);
  };

  const filterByType = (data, type) => {
    if (!type) return data;
    return data.filter((item) => item.type === type);
  };

  const filterByDateRange = (data, dateRange, dateField = "scheduledDate") => {
    if (!dateRange || dateRange.length !== 2) return data;
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return data;

    return data.filter((item) => {
      if (!item[dateField]) return false;
      const itemDate = dayjs(item[dateField]);
      return (
        itemDate.isAfter(startDate.startOf("day")) &&
        itemDate.isBefore(endDate.endOf("day"))
      );
    });
  };

  // Filtered data using useMemo for performance
  const filteredMaintenanceData = useMemo(() => {
    let data = history.maintenanceTicketsHistory || [];

    data = filterBySearch(data, searchText);
    data = filterByStatus(data, statusFilter);
    data = filterByPriority(data, priorityFilter);
    data = filterByType(data, typeFilter);
    data = filterByDateRange(data, dateRange, "scheduledDate");

    return data;
  }, [
    history.maintenanceTicketsHistory,
    searchText,
    statusFilter,
    priorityFilter,
    typeFilter,
    dateRange,
  ]);

  const filteredRepairData = useMemo(() => {
    let data = history.repairTicketsHistory || [];

    data = filterBySearch(data, searchText);
    data = filterByStatus(data, statusFilter);
    data = filterByPriority(data, priorityFilter);
    data = filterByType(data, typeFilter);
    data = filterByDateRange(data, dateRange, "reportedDate");

    return data;
  }, [
    history.repairTicketsHistory,
    searchText,
    statusFilter,
    priorityFilter,
    typeFilter,
    dateRange,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setPriorityFilter("");
    setTypeFilter("");
    setDateRange([]);
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchText ||
    statusFilter ||
    priorityFilter ||
    typeFilter ||
    dateRange.length > 0;

  const getStatusConfig = (status) => {
    const configs = {
      COMPLETED: {
        color: "success",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        text: "Hoàn thành",
      },
      IN_PROGRESS: {
        color: "processing",
        icon: <ClockIcon className="w-4 h-4" />,
        text: "Đang thực hiện",
      },
      PENDING: {
        color: "warning",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        text: "Chờ xử lý",
      },
      APPROVED: {
        color: "success",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        text: "Đã duyệt",
      },
      REJECTED: {
        color: "error",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        text: "Từ chối",
      },
      CANCELLED: {
        color: "default",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        text: "Hủy bỏ",
      },
    };
    return configs[status] || { color: "default", icon: null, text: status };
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      CRITICAL: { color: "red", text: "Khẩn cấp" },
      HIGH: { color: "orange", text: "Cao" },
      MEDIUM: { color: "blue", text: "Trung bình" },
      LOW: { color: "green", text: "Thấp" },
    };
    return configs[priority] || { color: "default", text: priority };
  };

  const getTypeConfig = (type) => {
    const configs = {
      PREVENTIVE: {
        color: "blue",
        icon: <SettingOutlined />,
        text: "Bảo trì định kỳ",
      },
      CORRECTIVE: {
        color: "orange",
        icon: <ToolOutlined />,
        text: "Bảo trì sửa chữa",
      },
      EMERGENCY: {
        color: "red",
        icon: <WarningOutlined />,
        text: "Bảo trì khẩn cấp",
      },
      WARRANTY: {
        color: "green",
        icon: <SafetyCertificateOutlined />,
        text: "Bảo hành",
      },
      BREAKDOWN: {
        color: "red",
        icon: <ExclamationCircleOutlined />,
        text: "Sự cố",
      },
    };
    return (
      configs[type] || { color: "default", icon: <ToolOutlined />, text: type }
    );
  };

  // Recalculate stats based on filtered data
  const maintenanceStats = useMemo(
    () => ({
      total: filteredMaintenanceData.length,
      completed: filteredMaintenanceData.filter((t) => t.status === "COMPLETED")
        .length,
      inProgress: filteredMaintenanceData.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length,
      totalCost: filteredMaintenanceData.reduce(
        (sum, t) => sum + (t.costs?.totalCost || 0),
        0
      ),
    }),
    [filteredMaintenanceData]
  );

  const repairStats = useMemo(
    () => ({
      total: filteredRepairData.length,
      approved: filteredRepairData.filter((t) => t.status === "APPROVED")
        .length,
      critical: filteredRepairData.filter((t) => t.priority === "CRITICAL")
        .length,
      totalCost: filteredRepairData.reduce(
        (sum, t) => sum + (t.costs?.totalCost || 0),
        0
      ),
    }),
    [filteredRepairData]
  );

  const maintenanceColumns = [
    {
      title: "Phiếu bảo trì",
      key: "ticket",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            icon={<WrenchScrewdriverIcon className="w-4 h-4" />}
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.ticketNumber}
            </div>
            <div className="text-sm text-gray-500">
              {getTypeConfig(record.type).text}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái & Ưu tiên",
      key: "status_priority",
      width: 180,
      render: (_, record) => {
        const statusConfig = getStatusConfig(record.status);
        const priorityConfig = getPriorityConfig(record.priority);
        return (
          <div className="space-y-2">
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
            <br />
            <Tag color={priorityConfig.color}>{priorityConfig.text}</Tag>
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Thời gian",
      key: "dates",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1 text-sm">
          <div>
            <Text type="secondary">Lên lịch: </Text>
            {formatDate(record.scheduledDate)}
          </div>
          {record.actualStartDate && (
            <div>
              <Text type="secondary">Bắt đầu: </Text>
              {formatDate(record.actualStartDate)}
            </div>
          )}
          {record.actualEndDate && (
            <div>
              <Text type="secondary">Kết thúc: </Text>
              {formatDate(record.actualEndDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Chi phí",
      key: "cost",
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(record.costs?.totalCost)}
          </div>
        </div>
      ),
    },
  ];

  const repairColumns = [
    {
      title: "Phiếu sửa chữa",
      key: "ticket",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            icon={getTypeConfig(record.type).icon}
            className={`${
              getTypeConfig(record.type).color === "green"
                ? "bg-green-100 text-green-600"
                : "bg-orange-100 text-orange-600"
            }`}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.ticketNumber}
            </div>
            <div className="text-sm text-gray-500">
              {getTypeConfig(record.type).text}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái & Ưu tiên",
      key: "status_priority",
      width: 180,
      render: (_, record) => {
        const statusConfig = getStatusConfig(record.status);
        const priorityConfig = getPriorityConfig(record.priority);
        return (
          <div className="space-y-2">
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
            <br />
            <Tag color={priorityConfig.color}>{priorityConfig.text}</Tag>
          </div>
        );
      },
    },
    {
      title: "Vấn đề",
      key: "problem",
      width: 250,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 text-sm">
            {record.problemDescription}
          </div>
          <div className="text-xs text-gray-500">{record.symptomDetails}</div>
        </div>
      ),
    },
    {
      title: "Loại sự cố",
      key: "failure",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          <Tag color="red">{record.failureType}</Tag>
          <br />
          <Tag color={record.severity === "CRITICAL" ? "red" : "orange"}>
            {record.severity}
          </Tag>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1 text-sm">
          <div>
            <Text type="secondary">Báo cáo: </Text>
            {formatDate(record.reportedDate)}
          </div>
          <div>
            <Text type="secondary">Lên lịch: </Text>
            {formatDate(record.scheduledDate)}
          </div>
        </div>
      ),
    },
    {
      title: "Chi phí",
      key: "cost",
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(record.costs?.totalCost)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="!bg-white shadow-sm border-b px-6">
        <div className="flex items-center justify-between">
          <Title level={2} className="mb-0 text-gray-800">
            Lịch sử Bảo trì & Sửa chữa
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              icon={<HomeFilled />}
              onClick={() => window.location.replace("/")}
              loading={loading}
            >
              trang chủ
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => logout()}
              loading={loading}
            >
              Đăng xuất
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="p-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="w-4 h-4" />
                <span>Bảo trì ({maintenanceStats.total})</span>
              </span>
            }
            key="maintenance"
          >
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Tổng phiếu bảo trì"
                    value={maintenanceStats.total}
                    prefix={<FileTextOutlined className="text-blue-500" />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Đã hoàn thành"
                    value={maintenanceStats.completed}
                    prefix={
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    }
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Đang thực hiện"
                    value={maintenanceStats.inProgress}
                    prefix={<ClockIcon className="w-5 h-5 text-orange-500" />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Tổng chi phí"
                    value={maintenanceStats.totalCost}
                    formatter={(value) => formatCurrency(value)}
                    prefix={
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    }
                    valueStyle={{ color: "#389e0d" }}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="mb-6 shadow-sm">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Tìm kiếm phiếu bảo trì..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="IN_PROGRESS">Đang thực hiện</Option>
                    <Option value="PENDING">Chờ xử lý</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Ưu tiên"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="CRITICAL">Khẩn cấp</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="LOW">Thấp</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Loại"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="PREVENTIVE">Bảo trì định kỳ</Option>
                    <Option value="CORRECTIVE">Bảo trì sửa chữa</Option>
                    <Option value="EMERGENCY">Bảo trì khẩn cấp</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <RangePicker
                    className="w-full"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </Col>
                <Col xs={24} sm={12} md={2}>
                  <Button
                    type={hasActiveFilters ? "primary" : "default"}
                    danger={hasActiveFilters}
                    icon={<FilterOutlined />}
                    className="w-full"
                    onClick={clearAllFilters}
                    title={hasActiveFilters ? "Xóa bộ lọc" : "Bộ lọc"}
                  >
                    {hasActiveFilters ? "Xóa" : "Lọc"}
                  </Button>
                </Col>
              </Row>
              {hasActiveFilters && (
                <Row className="mt-4">
                  <Col span={24}>
                    <Text type="secondary" className="text-sm">
                      Đang áp dụng bộ lọc • Hiển thị {maintenanceStats.total} /{" "}
                      {history.maintenanceTicketsHistory?.length || 0} kết quả
                    </Text>
                  </Col>
                </Row>
              )}
            </Card>

            <Card className="shadow-sm">
              <Table
                columns={maintenanceColumns}
                dataSource={filteredMaintenanceData}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} phiếu bảo trì`,
                }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có dữ liệu bảo trì"
                    />
                  ),
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4" />
                <span>Sửa chữa ({repairStats.total})</span>
              </span>
            }
            key="repair"
          >
            {/* Repair Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Tổng phiếu sửa chữa"
                    value={repairStats.total}
                    prefix={<FileTextOutlined className="text-orange-500" />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Đã duyệt"
                    value={repairStats.approved}
                    prefix={
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    }
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Khẩn cấp"
                    value={repairStats.critical}
                    prefix={
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    }
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-md transition-shadow">
                  <Statistic
                    title="Tổng chi phí"
                    value={repairStats.totalCost}
                    formatter={(value) => formatCurrency(value)}
                    prefix={
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    }
                    valueStyle={{ color: "#389e0d" }}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="mb-6 shadow-sm">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Tìm kiếm phiếu sửa chữa..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="APPROVED">Đã duyệt</Option>
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="REJECTED">Từ chối</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Loại"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="WARRANTY">Bảo hành</Option>
                    <Option value="BREAKDOWN">Sự cố</Option>
                    <Option value="EMERGENCY">Khẩn cấp</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Ưu tiên"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    allowClear
                    className="w-full"
                  >
                    <Option value="CRITICAL">Khẩn cấp</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="LOW">Thấp</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <RangePicker
                    className="w-full"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </Col>
                <Col xs={24} sm={12} md={2}>
                  <Button
                    type={hasActiveFilters ? "primary" : "default"}
                    danger={hasActiveFilters}
                    icon={<FilterOutlined />}
                    className="w-full"
                    onClick={clearAllFilters}
                    title={hasActiveFilters ? "Xóa bộ lọc" : "Bộ lọc"}
                  >
                    {hasActiveFilters ? "Xóa" : "Lọc"}
                  </Button>
                </Col>
              </Row>
              {hasActiveFilters && (
                <Row className="mt-4">
                  <Col span={24}>
                    <Text type="secondary" className="text-sm">
                      Đang áp dụng bộ lọc • Hiển thị {repairStats.total} /{" "}
                      {history.repairTicketsHistory?.length || 0} kết quả
                    </Text>
                  </Col>
                </Row>
              )}
            </Card>
            <Card className="shadow-sm">
              <Table
                columns={repairColumns}
                dataSource={filteredRepairData}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1400 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} phiếu sửa chữa`,
                }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có dữ liệu sửa chữa"
                    />
                  ),
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default History;
