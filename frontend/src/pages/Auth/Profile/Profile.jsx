import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Divider,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "../../../services/userService";

const { Title, Text } = Typography;
const { Option } = Select;
const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res) {
        setUserData(res);
      }
    } catch (error) {
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditProfile = () => {
    editForm.setFieldsValue({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      department: userData.department || "",
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    try {
      setUserData({
        ...userData,
        ...values,
        updatedAt: new Date().toISOString(),
      });
      const res = await updateProfile(values);
      message.success("Cập nhật thông tin thành công!");
      setEditModalVisible(false);
    } catch (error) {
      message.error("Cập nhật thông tin thất bại!");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      const res = await changePassword(values);
      message.success("Đổi mật khẩu thành công!");
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "red",
      MANAGER: "blue",
      TECHNICIAN: "green",
      USER: "default",
    };
    return colors[role] || "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto">
        <div className="text-center mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            Thông Tin Cá Nhân
          </Title>
          <Text type="secondary" className="text-lg">
            Quản lý thông tin tài khoản của bạn
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card
              className="text-center shadow-lg border-0 h-full"
              bodyStyle={{ padding: "32px 24px" }}
            >
              <div className="mb-6">
                <Badge
                  dot
                  status={userData?.isActive ? "success" : "error"}
                  offset={[-10, 10]}
                >
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                  />
                </Badge>
              </div>

              <Title level={3} className="mb-2 text-gray-800">
                {userData?.username}
              </Title>

              <div className="mb-4">
                {userData?.roles?.map((role) => (
                  <Tag
                    key={role}
                    color={getRoleColor(role)}
                    className="mb-1 px-3 py-1 text-sm font-medium"
                  >
                    {role}
                  </Tag>
                ))}
              </div>

              <Space direction="vertical" size="middle" className="w-full">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="large"
                  onClick={handleEditProfile}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  Chỉnh sửa thông tin
                </Button>

                <Button
                  icon={<LockOutlined />}
                  size="large"
                  onClick={() => setPasswordModalVisible(true)}
                  className="w-full border-blue-400 text-blue-600 hover:bg-blue-50 shadow-sm"
                >
                  Đổi mật khẩu
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Details Card */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-blue-600" />
                  <span className="text-gray-800">Chi tiết thông tin</span>
                </div>
              }
              className="shadow-lg border-0 h-full"
              headStyle={{
                borderBottom: "2px solid #f0f0f0",
                padding: "20px 24px",
              }}
            >
              <div className="space-y-6">
                <Row gutter={[16, 24]}>
                  <Col xs={24} sm={12}>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <UserOutlined className="text-xl text-blue-600 mr-3" />
                      <div>
                        <Text type="secondary" className="block text-sm">
                          Tên người dùng
                        </Text>
                        <Text strong className="text-base">
                          {userData?.username}
                        </Text>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12}>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <MailOutlined className="text-xl text-green-600 mr-3" />
                      <div>
                        <Text type="secondary" className="block text-sm">
                          Email
                        </Text>
                        <Text strong className="text-base">
                          {userData?.email}
                        </Text>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12}>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <PhoneOutlined className="text-xl text-orange-600 mr-3" />
                      <div>
                        <Text type="secondary" className="block text-sm">
                          Số điện thoại
                        </Text>
                        <Text strong className="text-base">
                          {userData?.phone}
                        </Text>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12}>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <TeamOutlined className="text-xl text-purple-600 mr-3" />
                      <div>
                        <Text type="secondary" className="block text-sm">
                          Phòng ban
                        </Text>
                        <Text strong className="text-base">
                          {userData?.department || "Chưa có thông tin"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <CalendarOutlined className="text-blue-600 mr-3" />
                    <div>
                      <Text type="secondary" className="block text-sm">
                        Ngày tạo tài khoản
                      </Text>
                      <Text className="text-sm">
                        {formatDate(userData?.createdAt)}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CalendarOutlined className="text-green-600 mr-3" />
                    <div>
                      <Text type="secondary" className="block text-sm">
                        Cập nhật lần cuối
                      </Text>
                      <Text className="text-sm">
                        {formatDate(userData?.updatedAt)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Edit Profile Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <EditOutlined className="mr-2 text-blue-600" />
              <span>Chỉnh sửa thông tin</span>
            </div>
          }
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          width={600}
          className="top-8"
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên người dùng"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên người dùng!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên người dùng"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Phòng ban" name="department">
                  <Select placeholder="Chọn phòng ban" size="large" allowClear>
                    <Option value="IT Department">IT Department</Option>
                    <Option value="HR Department">HR Department</Option>
                    <Option value="Finance Department">
                      Finance Department
                    </Option>
                    <Option value="Marketing Department">
                      Marketing Department
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                className="bg-blue-600"
              >
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <LockOutlined className="mr-2 text-red-600" />
              <span>Đổi mật khẩu</span>
            </div>
          }
          open={passwordModalVisible}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          footer={null}
          width={500}
          className="top-8"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
            className="mt-4"
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu hiện tại"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => {
                  setPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                className="bg-red-600 hover:bg-red-700"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
