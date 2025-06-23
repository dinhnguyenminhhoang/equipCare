import {
  CarOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  TruckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Layout,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import ClientMaintenanceTicketForm from "../../components/ClientModal/ClientMaintenanceTicketForm/ClientMaintenanceTicketForm";
import ClientRepairTicketForm from "../../components/ClientModal/ClientRepairTicketForm/ClientRepairTicketForm";
import MyModal from "../../components/Common/Modal/Modal";
import { useAuth } from "../../context/AuthContext";
import { getEquipments } from "../../services/equipmentService";
import { createMaintenanceTicket } from "../../services/maintenanceTicketService";
import { createRepairTicket } from "../../services/repairTicketService";
import { formatCurrency, formatDate } from "../../utils";
import { statusTextOption } from "../../utils/const";

const { Title, Text } = Typography;
const { Option } = Select;
const { Header, Content } = Layout;

const Home = () => {
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [repairModalVisible, setRepairModalVisible] = useState(false);
  const [warrantyModalVisible, setWarrantyModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showMaintenTicket, setShowMaintenTicket] = useState(false);
  const [showRepairTicket, setShowRepairTicket] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
  });
  const { logout } = useAuth();
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getEquipments({
        limit: params.limit || pagination.limit,
        page: params.page || pagination.page,
        ...params,
      });
      setAllEquipment(response.data.data || []);
      setPagination(response.meta || pagination);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ status: statusFilter, type: typeFilter, search: searchText });
  }, [statusFilter, typeFilter, searchText]);

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        color: "success",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        text: "Hoạt động",
      },
      MAINTENANCE: {
        color: "warning",
        icon: <WrenchScrewdriverIcon className="w-4 h-4" />,
        text: "Bảo trì",
      },
      INACTIVE: {
        color: "default",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        text: "Không hoạt động",
      },
    };
    return configs[status] || { color: "default", icon: null, text: status };
  };

  const getTypeIcon = (type) => {
    const icons = {
      TRUCK: <TruckIcon className="w-5 h-5 text-blue-500" />,
      CRANE: <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />,
      EXCAVATOR: <ToolOutlined className="text-green-500 text-lg" />,
      FORKLIFT: <CarOutlined className="text-purple-500 text-lg" />,
    };
    return icons[type] || <ToolOutlined className="text-gray-500 text-lg" />;
  };

  const columns = [
    {
      title: "Thiết bị",
      key: "equipment",
      fixed: "left",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Avatar
              size="large"
              icon={getTypeIcon(record.type)}
              className="bg-gray-100"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {record.name}
            </div>
            <div className="text-sm text-gray-500">
              Mã: {record.equipmentCode}
            </div>
            <div className="text-xs text-gray-400">
              {record.brand} - {record.model}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại & Trạng thái",
      key: "type_status",
      width: 180,
      render: (_, record) => {
        const statusConfig = getStatusConfig(record.status);
        return (
          <div className="space-y-2">
            <Tag color="blue" className="font-medium">
              {record.type}
            </Tag>
            <br />
            <Tag
              color={statusConfig.color}
              icon={statusConfig.icon}
              className="font-medium"
            >
              {statusConfig.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Vị trí & Người phụ trách",
      key: "location_assigned",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {record.location}
          </div>
          {record.assignedTo && (
            <div className="flex items-center text-sm text-gray-600">
              <UserIcon className="w-4 h-4 mr-1" />
              {record.assignedTo.username}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Giá trị",
      key: "value",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-600">
            {formatCurrency(record.currentValue)}
          </div>
          <div className="text-xs text-gray-500">
            Mua: {formatCurrency(record.purchasePrice)}
          </div>
        </div>
      ),
    },
    {
      title: "Giờ vận hành",
      dataIndex: "operatingHours",
      key: "operatingHours",
      width: 120,
      render: (hours) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{hours}</div>
          <div className="text-xs text-gray-500">giờ</div>
        </div>
      ),
    },
    {
      title: "Bảo trì",
      key: "maintenance",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          {record.maintenance?.lastMaintenanceDate && (
            <div className="text-xs text-gray-600">
              Lần cuối: {formatDate(record.maintenance.lastMaintenanceDate)}
            </div>
          )}
          <div className="flex space-x-1">
            <Tag
              size="small"
              color={
                record.maintenance?.maintenanceInterval60h ? "green" : "red"
              }
            >
              60h
            </Tag>
            <Tag
              size="small"
              color={
                record.maintenance?.maintenanceInterval120h ? "green" : "red"
              }
            >
              120h
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small" className="flex flex-col sm:flex-row">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Lập phiếu sửa chữa">
            <Button
              type="default"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleCreateRepairOrder(record)}
              className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            >
              Sửa chữa
            </Button>
          </Tooltip>
          <Tooltip title="Lập phiếu bảo hành">
            <Button
              type="default"
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleCreateWarrantyOrder(record)}
              className="bg-green-500 hover:bg-green-600 text-white border-green-500"
            >
              Bảo hành
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedEquipment(record);
    setDetailModalVisible(true);
  };

  const handleCreateRepairOrder = (record) => {
    setSelectedEquipment(record);
    setRepairModalVisible(true);
  };

  const handleCreateWarrantyOrder = (record) => {
    setSelectedEquipment(record);
    setWarrantyModalVisible(true);
  };
  const handleCreateRepair = async (data) => {
    await createRepairTicket(data);
    message.success("Tạo phiếu bảo dưỡng thành công");
    setShowRepairTicket(false);
  };

  const handleCreateMaintence = async (data) => {
    await createMaintenanceTicket(data);
    setShowMaintenTicket(false);
  };
  const getMaintenanceStatus = (equipment) => {
    const hours = equipment.operatingHours || 0;
    const nextMaintenance60 = Math.ceil(hours / 60) * 60;
    const nextMaintenance120 = Math.ceil(hours / 120) * 120;

    if (
      hours >= nextMaintenance60 &&
      !equipment.maintenance?.maintenanceInterval60h
    ) {
      return {
        status: "urgent",
        message: "Cần bảo trì 60h ngay lập tức",
        hours: nextMaintenance60,
      };
    }
    if (
      hours >= nextMaintenance120 &&
      !equipment.maintenance?.maintenanceInterval120h
    ) {
      return {
        status: "urgent",
        message: "Cần bảo trì 120h ngay lập tức",
        hours: nextMaintenance120,
      };
    }

    const next60 = nextMaintenance60 - hours;
    const next120 = nextMaintenance120 - hours;
    const nextService = Math.min(next60, next120);

    if (nextService <= 10) {
      return {
        status: "warning",
        message: `Sắp tới hạn bảo trì (${nextService}h)`,
        hours: nextService,
      };
    }

    return {
      status: "good",
      message: `Bảo trì tiếp theo sau ${nextService}h`,
      hours: nextService,
    };
  };
  const handleTableChange = (paginationInfo) => {
    const newPagination = {
      ...pagination,
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
    };
    setPagination(newPagination);
    fetchData({ page: paginationInfo.current, limit: paginationInfo.pageSize });
  };

  return (
    <>
      <Layout className="min-h-screen bg-gray-50">
        <Header className="!bg-white shadow-sm border-b px-6">
          <div className="flex items-center justify-between">
            <Title level={2} className="mb-0 text-gray-800">
              Quản lý Thiết bị
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchData()}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => window.location.replace("/history")}
                loading={loading}
              >
                Lịch sử
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
          <Card className="mb-6 shadow-sm">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tìm kiếm thiết bị..."
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
                  {statusTextOption.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Loại thiết bị"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                  className="w-full"
                >
                  <Option value="TRUCK">Xe tải</Option>
                  <Option value="CRANE">Cần cẩu</Option>
                  <Option value="EXCAVATOR">Máy xúc</Option>
                  <Option value="FORKLIFT">Xe nâng</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchData()}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card className="shadow-sm">
            <Table
              columns={columns}
              dataSource={allEquipment}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1400 }}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} thiết bị`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              onChange={handleTableChange}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có dữ liệu thiết bị"
                  />
                ),
              }}
              className="custom-table"
            />
          </Card>

          <Modal
            title={
              <div className="flex items-center space-x-3">
                <Avatar
                  size="large"
                  icon={
                    selectedEquipment
                      ? getTypeIcon(selectedEquipment.type)
                      : null
                  }
                  className="bg-gray-100"
                />
                <div>
                  <div className="text-lg font-semibold">Chi tiết thiết bị</div>
                  <div className="text-sm text-gray-500">
                    {selectedEquipment?.equipmentCode}
                  </div>
                </div>
              </div>
            }
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            width={800}
            footer={[
              <Button key="close" onClick={() => setDetailModalVisible(false)}>
                Đóng
              </Button>,
              <Button
                key="repair"
                type="default"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleCreateRepairOrder(selectedEquipment);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              >
                Lập phiếu sửa chữa
              </Button>,
              <Button
                key="warranty"
                type="default"
                icon={<SafetyCertificateOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleCreateWarrantyOrder(selectedEquipment);
                }}
                className="bg-green-500 hover:bg-green-600 text-white border-green-500"
              >
                Lập phiếu bảo hành
              </Button>,
            ]}
          >
            {selectedEquipment && (
              <div className="space-y-6">
                <Card size="small" title="Thông tin cơ bản">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Tên thiết bị">
                      {selectedEquipment.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã thiết bị">
                      {selectedEquipment.equipmentCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại thiết bị">
                      <Tag color="blue">{selectedEquipment.type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={getStatusConfig(selectedEquipment.status).color}
                      >
                        {getStatusConfig(selectedEquipment.status).text}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thương hiệu">
                      {selectedEquipment.brand}
                    </Descriptions.Item>
                    <Descriptions.Item label="Model">
                      {selectedEquipment.model}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số serial">
                      {selectedEquipment.serialNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vị trí">
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {selectedEquipment.location}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Financial Information */}
                <Card size="small" title="Thông tin tài chính">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Giá mua"
                        value={selectedEquipment.purchasePrice}
                        formatter={(value) => formatCurrency(value)}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Giá trị hiện tại"
                        value={selectedEquipment.currentValue}
                        formatter={(value) => formatCurrency(value)}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Khấu hao"
                        value={
                          ((selectedEquipment.purchasePrice -
                            selectedEquipment.currentValue) /
                            selectedEquipment.purchasePrice) *
                          100
                        }
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Col>
                  </Row>
                </Card>

                {/* Technical Specifications */}
                {selectedEquipment.specifications && (
                  <Card size="small" title="Thông số kỹ thuật">
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Công suất động cơ">
                        {selectedEquipment.specifications.enginePower} HP
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại nhiên liệu">
                        {selectedEquipment.specifications.fuelType}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sức nâng">
                        {selectedEquipment.specifications.capacity} tấn
                      </Descriptions.Item>
                      <Descriptions.Item label="Độ cao nâng tối đa">
                        {selectedEquipment.specifications.maxLiftHeight} m
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                {/* Operation & Maintenance */}
                <Card size="small" title="Vận hành & Bảo trì">
                  <Row gutter={16} className="mb-4">
                    <Col span={12}>
                      <Statistic
                        title="Giờ vận hành"
                        value={selectedEquipment.operatingHours}
                        suffix="giờ"
                        prefix={<ClockIcon className="w-4 h-4" />}
                      />
                    </Col>
                    <Col span={12}>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Trạng thái bảo trì
                        </div>
                        {(() => {
                          const maintenanceStatus =
                            getMaintenanceStatus(selectedEquipment);
                          return (
                            <Tag
                              color={
                                maintenanceStatus.status === "urgent"
                                  ? "red"
                                  : maintenanceStatus.status === "warning"
                                  ? "orange"
                                  : "green"
                              }
                              className="text-sm"
                            >
                              {maintenanceStatus.message}
                            </Tag>
                          );
                        })()}
                      </div>
                    </Col>
                  </Row>

                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Bảo trì 60h">
                      <Tag
                        color={
                          selectedEquipment.maintenance?.maintenanceInterval60h
                            ? "green"
                            : "red"
                        }
                      >
                        {selectedEquipment.maintenance?.maintenanceInterval60h
                          ? "Đã thực hiện"
                          : "Chưa thực hiện"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bảo trì 120h">
                      <Tag
                        color={
                          selectedEquipment.maintenance?.maintenanceInterval120h
                            ? "green"
                            : "red"
                        }
                      >
                        {selectedEquipment.maintenance?.maintenanceInterval120h
                          ? "Đã thực hiện"
                          : "Chưa thực hiện"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bảo trì lần cuối">
                      {selectedEquipment.maintenance?.lastMaintenanceDate
                        ? formatDate(
                            selectedEquipment.maintenance.lastMaintenanceDate
                          )
                        : "Chưa có"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Assignment & Notes */}
                <Card size="small" title="Phân công & Ghi chú">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Người phụ trách">
                      {selectedEquipment.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <Avatar
                            size="small"
                            icon={<UserIcon className="w-3 h-3" />}
                          />
                          <span>{selectedEquipment.assignedTo.username}</span>
                          <span className="text-gray-500">
                            ({selectedEquipment.assignedTo.email})
                          </span>
                        </div>
                      ) : (
                        "Chưa phân công"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cung cấp">
                      {formatDate(selectedEquipment.suppliedDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                      {selectedEquipment.notes || "Không có ghi chú"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
          </Modal>

          <Modal
            title={
              <div className="flex items-center space-x-2">
                <FileTextOutlined className="text-orange-500" />
                <span>Lập phiếu sửa chữa</span>
              </div>
            }
            open={repairModalVisible}
            onCancel={() => setRepairModalVisible(false)}
            width={600}
            footer={[
              <Button key="cancel" onClick={() => setRepairModalVisible(false)}>
                Hủy
              </Button>,
              <Button
                onClick={() => {
                  setRepairModalVisible(false);
                  setShowRepairTicket(true);
                }}
                type="primary"
                key="submit"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Tạo phiếu sửa chữa
              </Button>,
            ]}
          >
            {selectedEquipment && (
              <div className="space-y-4">
                <Card size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Thiết bị">
                      {selectedEquipment.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã thiết bị">
                      {selectedEquipment.equipmentCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vị trí">
                      {selectedEquipment.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giờ vận hành">
                      {selectedEquipment.operatingHours} giờ
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
          </Modal>

          <Modal
            title={
              <div className="flex items-center space-x-2">
                <SafetyCertificateOutlined className="text-green-500" />
                <span>Lập phiếu bảo hành</span>
              </div>
            }
            open={warrantyModalVisible}
            onCancel={() => setWarrantyModalVisible(false)}
            width={600}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setWarrantyModalVisible(false);
                }}
              >
                Hủy
              </Button>,
              <Button
                onClick={() => {
                  setWarrantyModalVisible(false);
                  setShowMaintenTicket(true);
                }}
                type="primary"
                className="bg-green-500 hover:bg-green-600"
              >
                Tạo phiếu bảo hành
              </Button>,
            ]}
          >
            {selectedEquipment && (
              <div className="space-y-4">
                <Card size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Thiết bị">
                      {selectedEquipment.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã thiết bị">
                      {selectedEquipment.equipmentCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày mua">
                      {formatDate(selectedEquipment.suppliedDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thương hiệu">
                      {selectedEquipment.brand}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>

      <MyModal
        isOpen={showMaintenTicket}
        onClose={() => {
          setShowMaintenTicket(false);
        }}
        title="phiếu bảo dưỡng"
        size="xl"
      >
        <ClientMaintenanceTicketForm
          onSubmit={handleCreateMaintence}
          onCancel={() => {}}
          equipments={[selectedEquipment]}
        />
      </MyModal>
      <MyModal
        isOpen={showRepairTicket}
        onClose={() => setShowRepairTicket(false)}
        title="Phiếu sửa chữa"
        size="lg"
      >
        <ClientRepairTicketForm
          onCancel={() => setShowRepairTicket(false)}
          onSubmit={handleCreateRepair}
          equipments={[selectedEquipment]}
        />
      </MyModal>
    </>
  );
};

export default Home;
