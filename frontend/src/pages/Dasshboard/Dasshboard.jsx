import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Badge,
  Progress,
  Alert,
  Tag,
  Avatar,
  Tooltip,
  Spin,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Divider,
  Timeline,
  Empty,
  message,
  Tabs,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  AlertOutlined,
  BarChartOutlined,
  DashboardOutlined,
  SettingOutlined,
  BellOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getDashboardOverview,
  getEquipmentStatus,
  getMaintenanceSummary,
  getMaterialAlerts,
  getRecentActivities,
  getRepairSummary,
} from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
];

const Dashboard = () => {
  const { isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [overview, setOverview] = useState(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);
  const [repairSummary, setRepairSummary] = useState(null);
  const [equipmentStatus, setEquipmentStatus] = useState(null);
  const [materialAlerts, setMaterialAlerts] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  const [error, setError] = useState(null);

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const [
        overviewData,
        maintenanceData,
        repairData,
        equipmentData,
        materialData,
        activitiesData,
      ] = await Promise.all([
        getDashboardOverview(),
        getMaintenanceSummary({ period: selectedPeriod }),
        getRepairSummary({ period: selectedPeriod }),
        getEquipmentStatus(),
        getMaterialAlerts(),
        getRecentActivities({ limit: 20 }),
      ]);

      setOverview(overviewData.data || overviewData);
      setMaintenanceSummary(maintenanceData.data || maintenanceData);
      setRepairSummary(repairData.data || repairData);
      setEquipmentStatus(equipmentData.data || equipmentData);
      setMaterialAlerts(materialData.data || materialData);
      setRecentActivities(activitiesData.data || activitiesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
      message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload when period changes
  useEffect(() => {
    if (overview) {
      // Only reload if we have initial data
      loadDashboardData(false);
    }
  }, [selectedPeriod]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(false);
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  // Utility functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "success",
      MAINTENANCE: "warning",
      REPAIR: "error",
      COMPLETED: "success",
      IN_PROGRESS: "processing",
      PENDING: "default",
      CRITICAL: "error",
      HIGH: "warning",
      MEDIUM: "default",
      LOW: "success",
    };
    return colors[status] || "default";
  };

  const getActivityIcon = (type) => {
    const icons = {
      MAINTENANCE: <ToolOutlined className="text-blue-500" />,
      REPAIR: <SettingOutlined className="text-red-500" />,
      INVENTORY: <ShoppingCartOutlined className="text-green-500" />,
    };
    return icons[type] || <FileTextOutlined />;
  };

  const renderStatCard = (
    title,
    value,
    prefix,
    suffix,
    trend,
    icon,
    color = "blue"
  ) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div
            className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}
          >
            <div className={`text-${color}-600 text-xl`}>{icon}</div>
          </div>
          <Statistic
            title={<span className="text-gray-600 font-medium">{title}</span>}
            value={value || 0}
            prefix={prefix}
            suffix={suffix}
            className="mb-2"
          />
          {trend !== undefined && trend !== null && (
            <div className="flex items-center">
              {trend > 0 ? (
                <ArrowUpOutlined className="text-green-500 mr-1" />
              ) : trend < 0 ? (
                <ArrowDownOutlined className="text-red-500 mr-1" />
              ) : null}
              <span
                className={
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-gray-500 ml-1">so với kỳ trước</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Prepare chart data
  const prepareEquipmentStatusData = () => {
    if (!equipmentStatus?.statusDistribution) return [];
    return equipmentStatus.statusDistribution.map((item) => ({
      name: item._id,
      value: item.count,
    }));
  };

  const prepareCostTrendData = () => {
    if (!maintenanceSummary?.costStats || !repairSummary?.costStats) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      maintenance: Math.random() * 50000 + 30000,
      repair: Math.random() * 40000 + 20000,
      material: Math.random() * 25000 + 15000,
    }));
  };

  // Recent Activities Table Columns
  const activityColumns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type) => <Tooltip title={type}>{getActivityIcon(type)}</Tooltip>,
    },
    {
      title: "Mã số",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
      render: (text, record) => (
        <span className="font-mono text-sm">
          {record.ticketNumber || record.transactionNumber}
        </span>
      ),
    },
    {
      title: "Thiết bị/Vật tư",
      key: "item",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.equipment?.name || record.material?.name}
          </div>
          <div className="text-xs text-gray-500">
            {record.equipment?.equipmentCode || record.material?.materialCode}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Người thực hiện",
      key: "performedBy",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
          {record.performedBy?.username}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <span className="text-sm text-gray-600">{formatDate(date)}</span>
      ),
    },
  ];

  // Error state
  if (error && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleOutlined className="text-red-500 text-6xl mb-4" />
          <Title level={3} className="text-gray-600">
            Lỗi tải dữ liệu
          </Title>
          <Text className="text-gray-500 mb-4">{error}</Text>
          <Button type="primary" onClick={() => loadDashboardData()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            Đang tải dữ liệu dashboard...
          </div>
        </div>
      </div>
    );
  }

  return isAdmin() || isManager() ? (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={2} className="mb-2 text-gray-800">
                <DashboardOutlined className="mr-3 text-blue-600" />
                Dashboard Quản Lý Thiết Bị
              </Title>
              <Text className="text-gray-600">
                Tổng quan hệ thống và hoạt động thiết bị
              </Text>
            </div>
            <Space>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                className="w-32"
                loading={refreshing}
              >
                <Option value="week">Tuần</Option>
                <Option value="month">Tháng</Option>
                <Option value="year">Năm</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                type="primary"
                loading={refreshing}
                onClick={handleRefresh}
                className="bg-blue-600 border-blue-600"
              >
                Làm mới
              </Button>
            </Space>
          </div>
        </div>

        {error && (
          <Alert
            message="Lỗi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            closable
            className="mb-6"
          />
        )}

        {overview && (
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              {renderStatCard(
                "Tổng thiết bị",
                overview.summary?.totalEquipments,
                null,
                "thiết bị",
                null,
                <BarChartOutlined />,
                "blue"
              )}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatCard(
                "Đang hoạt động",
                overview.summary?.activeEquipments,
                null,
                "thiết bị",
                null,
                <CheckCircleOutlined />,
                "green"
              )}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatCard(
                "Bảo trì tháng này",
                overview.trends?.maintenanceThisMonth,
                null,
                "công việc",
                parseFloat(overview.trends?.maintenanceGrowth),
                <ToolOutlined />,
                "orange"
              )}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatCard(
                "Sửa chữa tháng này",
                overview.trends?.repairThisMonth,
                null,
                "công việc",
                parseFloat(overview.trends?.repairGrowth),
                <SettingOutlined />,
                "red"
              )}
            </Col>
          </Row>
        )}

        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24}>
            <Card className="hover:shadow-lg transition-shadow">
              <Tabs
                defaultActiveKey="status"
                items={[
                  {
                    key: "status",
                    label: (
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-2" />
                        Trạng thái thiết bị
                      </span>
                    ),
                    children: (
                      <Row gutter={[24, 24]}>
                        <Col xs={24} lg={12}>
                          <div className="h-80">
                            <Title level={4} className="text-center mb-4">
                              Phân bố trạng thái
                            </Title>
                            {equipmentStatus?.statusDistribution ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={equipmentStatus.statusDistribution.map(
                                      (item) => ({
                                        name: item._id,
                                        value: item.count,
                                      })
                                    )}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                      `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {equipmentStatus.statusDistribution.map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <RechartsTooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Spin />
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={24} lg={12}>
                          <div className="space-y-4 pt-8">
                            <div className="text-center mb-6">
                              <Title level={4}>Tỷ lệ sử dụng</Title>
                              <Progress
                                type="circle"
                                percent={parseFloat(
                                  equipmentStatus?.utilizationRate || 0
                                )}
                                size={150}
                                strokeColor={{
                                  "0%": "#108ee9",
                                  "100%": "#87d068",
                                }}
                                format={(percent) => `${percent}%`}
                              />
                            </div>
                            {equipmentStatus?.statusDistribution?.map(
                              (item, index) => (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 rounded mr-3"
                                      style={{
                                        backgroundColor:
                                          COLORS[index % COLORS.length],
                                      }}
                                    />
                                    <span className="font-medium">
                                      {item._id}
                                    </span>
                                  </div>
                                  <span className="text-lg font-bold">
                                    {item.count}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </Col>
                      </Row>
                    ),
                  },
                  {
                    key: "type",
                    label: (
                      <span className="flex items-center">
                        <BarChartOutlined className="mr-2" />
                        Loại thiết bị
                      </span>
                    ),
                    children: (
                      <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                          <div className="h-80">
                            <Title level={4} className="text-center mb-4">
                              Phân bố theo loại thiết bị
                            </Title>
                            {equipmentStatus?.typeDistribution ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={equipmentStatus.typeDistribution.map(
                                    (item) => ({
                                      name: item._id,
                                      count: item.count,
                                    })
                                  )}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <RechartsTooltip />
                                  <Bar
                                    dataKey="count"
                                    fill="#1890ff"
                                    radius={[4, 4, 0, 0]}
                                  >
                                    {equipmentStatus.typeDistribution.map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      )
                                    )}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Spin />
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={24} lg={8}>
                          <div className="space-y-4 pt-8">
                            <Title level={5} className="text-center">
                              Chi tiết số lượng
                            </Title>
                            {equipmentStatus?.typeDistribution?.map(
                              (item, index) => (
                                <Card
                                  key={item._id}
                                  size="small"
                                  className="bg-gradient-to-r from-blue-50 to-purple-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-700">
                                        {item._id}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Loại thiết bị
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {item.count}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        thiết bị
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )
                            )}
                          </div>
                        </Col>
                      </Row>
                    ),
                  },
                  {
                    key: "hours",
                    label: (
                      <span className="flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        Giờ vận hành
                      </span>
                    ),
                    children: (
                      <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                          <div className="h-80">
                            <Title level={4} className="text-center mb-4">
                              Thống kê giờ vận hành
                            </Title>
                            {equipmentStatus?.operatingHoursStats ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    {
                                      name: "Tổng giờ",
                                      value:
                                        equipmentStatus.operatingHoursStats
                                          .totalOperatingHours,
                                    },
                                    {
                                      name: "Trung bình",
                                      value:
                                        equipmentStatus.operatingHoursStats
                                          .averageOperatingHours,
                                    },
                                    {
                                      name: "Cao nhất",
                                      value:
                                        equipmentStatus.operatingHoursStats
                                          .maxOperatingHours,
                                    },
                                    {
                                      name: "Thấp nhất",
                                      value:
                                        equipmentStatus.operatingHoursStats
                                          .minOperatingHours,
                                    },
                                  ]}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <RechartsTooltip
                                    formatter={(value) => [`${value} giờ`, ""]}
                                  />
                                  <Bar
                                    dataKey="value"
                                    fill="#52c41a"
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Spin />
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={24} lg={8}>
                          <div className="space-y-4 pt-4">
                            <Title level={5} className="text-center">
                              Thống kê chi tiết
                            </Title>
                            {equipmentStatus?.operatingHoursStats && (
                              <>
                                <Card
                                  size="small"
                                  className="bg-gradient-to-r from-green-50 to-blue-50"
                                >
                                  <Statistic
                                    title="Tổng giờ vận hành"
                                    value={
                                      equipmentStatus.operatingHoursStats
                                        .totalOperatingHours
                                    }
                                    suffix="giờ"
                                    prefix={<ClockCircleOutlined />}
                                  />
                                </Card>
                                <Card
                                  size="small"
                                  className="bg-gradient-to-r from-blue-50 to-purple-50"
                                >
                                  <Statistic
                                    title="Trung bình mỗi thiết bị"
                                    value={
                                      equipmentStatus.operatingHoursStats
                                        .averageOperatingHours
                                    }
                                    suffix="giờ"
                                    precision={1}
                                  />
                                </Card>
                                <Card
                                  size="small"
                                  className="bg-gradient-to-r from-yellow-50 to-orange-50"
                                >
                                  <Statistic
                                    title="Cao nhất"
                                    value={
                                      equipmentStatus.operatingHoursStats
                                        .maxOperatingHours
                                    }
                                    suffix="giờ"
                                  />
                                </Card>
                                <Card
                                  size="small"
                                  className="bg-gradient-to-r from-gray-50 to-gray-100"
                                >
                                  <Statistic
                                    title="Thấp nhất"
                                    value={
                                      equipmentStatus.operatingHoursStats
                                        .minOperatingHours
                                    }
                                    suffix="giờ"
                                  />
                                </Card>
                                <div className="text-center text-sm text-gray-500 mt-4">
                                  Tổng số thiết bị:{" "}
                                  {equipmentStatus.operatingHoursStats.count}
                                </div>
                              </>
                            )}
                          </div>
                        </Col>
                      </Row>
                    ),
                  },
                  {
                    key: "maintenance",
                    label: (
                      <span className="flex items-center">
                        <ToolOutlined className="mr-2" />
                        Bảo trì đến hạn
                      </span>
                    ),
                    children: (
                      <div>
                        <Title level={4} className="text-center mb-4">
                          Thiết bị cần bảo trì
                        </Title>
                        {equipmentStatus?.maintenanceDue &&
                        equipmentStatus.maintenanceDue.length > 0 ? (
                          <Table
                            dataSource={equipmentStatus.maintenanceDue}
                            rowKey="_id"
                            pagination={false}
                            columns={[
                              {
                                title: "Mã thiết bị",
                                dataIndex: "equipmentCode",
                                key: "equipmentCode",
                                render: (text) => (
                                  <span className="font-mono">{text}</span>
                                ),
                              },
                              {
                                title: "Tên thiết bị",
                                dataIndex: "name",
                                key: "name",
                                render: (text) => (
                                  <span className="font-medium">{text}</span>
                                ),
                              },
                              {
                                title: "Ngày bảo trì tiếp theo",
                                dataIndex: [
                                  "maintenance",
                                  "nextMaintenanceDate",
                                ],
                                key: "nextMaintenanceDate",
                                render: (date) => (
                                  <span className="text-red-600 font-medium">
                                    {new Date(date).toLocaleDateString("vi-VN")}
                                  </span>
                                ),
                              },
                              {
                                title: "Giờ vận hành",
                                dataIndex: "operatingHours",
                                key: "operatingHours",
                                render: (hours) => `${hours} giờ`,
                              },
                              {
                                title: "Người phụ trách",
                                dataIndex: ["assignedTo", "username"],
                                key: "assignedTo",
                                render: (username) => (
                                  <div className="flex items-center">
                                    <Avatar
                                      size="small"
                                      icon={<UserOutlined />}
                                      className="mr-2"
                                    />
                                    {username || "Chưa phân công"}
                                  </div>
                                ),
                              },
                              {
                                title: "Trạng thái",
                                key: "status",
                                render: () => (
                                  <Tag color="warning">Cần bảo trì</Tag>
                                ),
                              },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <CheckCircleOutlined className="text-green-500 text-6xl mb-4" />
                            <Title level={4} className="text-gray-600">
                              Tuyệt vời!
                            </Title>
                            <Text className="text-gray-500">
                              Hiện tại không có thiết bị nào cần bảo trì
                            </Text>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row gutter={[24, 24]}>
          {/* Recent Activities */}
          <Col xs={24} lg={14}>
            <Card
              title="Hoạt động gần đây"
              className="hover:shadow-lg transition-shadow"
              loading={!recentActivities}
              extra={
                <Button size="small" type="link">
                  Xem tất cả
                </Button>
              }
            >
              {recentActivities && recentActivities.length > 0 ? (
                <Table
                  dataSource={recentActivities}
                  columns={activityColumns}
                  pagination={{ pageSize: 10 }}
                  size="small"
                  rowKey="id"
                />
              ) : (
                <Empty description="Không có hoạt động nào" />
              )}
            </Card>
          </Col>

          {/* Material Alerts */}
          <Col xs={24} lg={10}>
            <Card
              title="Cảnh báo vật tư"
              className="hover:shadow-lg transition-shadow"
              loading={!materialAlerts}
            >
              {materialAlerts ? (
                <div className="space-y-4">
                  {/* Low Stock */}
                  {materialAlerts.lowStockMaterials?.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <WarningOutlined className="text-orange-500 mr-2" />
                        <span className="font-medium">
                          Sắp hết hàng ({materialAlerts.summary?.lowStockCount})
                        </span>
                      </div>
                      {materialAlerts.lowStockMaterials
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {item.materialCode}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                {item.currentStock}/{item.minStockLevel}
                              </div>
                              <Progress
                                percent={
                                  (item.currentStock / item.minStockLevel) * 100
                                }
                                size="small"
                                status="exception"
                                showInfo={false}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Expiring Materials */}
                  {materialAlerts.expiringMaterials?.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <ClockCircleOutlined className="text-red-500 mr-2" />
                        <span className="font-medium">
                          Sắp hết hạn ({materialAlerts.summary?.expiringCount})
                        </span>
                      </div>
                      {materialAlerts.expiringMaterials
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {item.materialCode}
                              </div>
                            </div>
                            <div className="text-right text-sm text-red-600">
                              {formatDate(item.expiryDate)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Out of Stock */}
                  {materialAlerts.outOfStockMaterials?.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <ExclamationCircleOutlined className="text-red-500 mr-2" />
                        <span className="font-medium">
                          Hết hàng ({materialAlerts.summary?.outOfStockCount})
                        </span>
                      </div>
                      {materialAlerts.outOfStockMaterials
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2"
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {item.materialCode}
                              </div>
                            </div>
                            <Badge status="error" text="Hết hàng" />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* No alerts */}
                  {!materialAlerts.lowStockMaterials?.length &&
                    !materialAlerts.expiringMaterials?.length &&
                    !materialAlerts.outOfStockMaterials?.length && (
                      <Empty description="Không có cảnh báo nào" />
                    )}
                </div>
              ) : (
                <Empty description="Đang tải dữ liệu..." />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  ) : (
    <p>không có quyền truy cập</p>
  );
};

export default Dashboard;
