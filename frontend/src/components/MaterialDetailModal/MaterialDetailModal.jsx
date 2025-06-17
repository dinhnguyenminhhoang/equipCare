import { useState, useEffect } from "react";
import { Tabs } from "antd";
import {
  CalendarIcon,
  CubeIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  TruckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { getMaterialTransactions } from "../../services/materialService";
import Button from "../Common/Button/Button";
import Modal from "../Common/Modal/Modal";

const { TabPane } = Tabs;

const MaterialDetailModal = ({ material, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      fetchTransactions();
    }
  }, [isOpen, material]);

  const fetchTransactions = async () => {
    if (!material?._id) return;

    setLoading(true);
    try {
      const response = await getMaterialTransactions(material._id, {
        limit: 10,
      });
      setTransactions(response.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (!material)
      return {
        status: "unknown",
        color: "bg-gray-100 text-gray-800",
        text: "Không xác định",
      };

    if (material.currentStock === 0) {
      return {
        status: "out",
        color: "bg-red-100 text-red-800",
        text: "Hết hàng",
        icon: ExclamationCircleIcon,
      };
    } else if (material.currentStock <= material.minStockLevel) {
      return {
        status: "low",
        color: "bg-yellow-100 text-yellow-800",
        text: "Sắp hết",
        icon: ExclamationCircleIcon,
      };
    } else {
      return {
        status: "good",
        color: "bg-green-100 text-green-800",
        text: "Đủ hàng",
        icon: CheckCircleIcon,
      };
    }
  };

  const isExpiringSoon = () => {
    if (!material?.expiryDate || !material?.isPerishable) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(material.expiryDate) <= thirtyDaysFromNow;
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    className = "",
    valueClassName = "",
  }) => (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-sm text-gray-900 break-words ${valueClassName}`}>
          {value || "Chưa có thông tin"}
        </p>
      </div>
    </div>
  );

  const InfoSection = ({ title, children, className = "" }) => (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h4>
      {children}
    </div>
  );

  const getTransactionTypeColor = (type) => {
    return type === "INBOUND"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getTransactionTypeText = (type) => {
    return type === "INBOUND" ? "Nhập kho" : "Xuất kho";
  };

  const BasicInfoTab = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <InfoSection title="Thông tin cơ bản">
        <InfoItem
          icon={CubeIcon}
          label="Mã vật tư"
          value={material?.materialCode}
          valueClassName="font-semibold text-blue-600"
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Tên vật tư"
          value={material?.name}
          valueClassName="font-medium"
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Danh mục"
          value={material?.category}
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Đơn vị tính"
          value={material?.unit}
        />

        <InfoItem
          icon={DocumentTextIcon}
          label="Mã vạch"
          value={material?.barcode}
        />

        <div className="flex items-start space-x-3">
          <CubeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">
              Trạng thái tồn kho
            </p>
            <div className="mt-1">
              {(() => {
                const stockStatus = getStockStatus();
                const IconComponent = stockStatus.icon;
                return (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}
                  >
                    <IconComponent className="w-4 h-4 mr-1" />
                    {stockStatus.text}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Thông tin kho">
        <InfoItem
          icon={CubeIcon}
          label="Tồn kho hiện tại"
          value={
            material?.currentStock !== undefined
              ? `${material.currentStock.toLocaleString()} ${material?.unit}`
              : "0"
          }
          valueClassName="font-medium text-blue-600"
        />

        <InfoItem
          icon={ExclamationCircleIcon}
          label="Mức tồn kho tối thiểu"
          value={
            material?.minStockLevel !== undefined
              ? `${material.minStockLevel.toLocaleString()} ${material?.unit}`
              : "0"
          }
          valueClassName="font-medium text-orange-600"
        />

        <InfoItem
          icon={CheckCircleIcon}
          label="Mức tồn kho tối đa"
          value={
            material?.maxStockLevel !== undefined
              ? `${material.maxStockLevel.toLocaleString()} ${material?.unit}`
              : "Không giới hạn"
          }
          valueClassName="font-medium text-green-600"
        />

        <InfoItem
          icon={CurrencyDollarIcon}
          label="Đơn giá"
          value={formatCurrency(material?.unitPrice)}
          valueClassName="font-medium text-green-600"
        />

        <InfoItem
          icon={CurrencyDollarIcon}
          label="Giá trị tồn kho"
          value={formatCurrency(
            (material?.currentStock || 0) * (material?.unitPrice || 0)
          )}
          valueClassName="font-medium text-green-600"
        />

        <InfoItem
          icon={MapPinIcon}
          label="Vị trí lưu trữ"
          value={material?.storageLocation}
        />
      </InfoSection>
    </div>
  );

  const ExpiryTab = () => (
    <div className="space-y-8">
      <InfoSection title="Thông tin hạn sử dụng">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={material?.isPerishable || false}
                disabled
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Vật tư có hạn sử dụng
              </span>
            </div>

            {material?.isPerishable && (
              <>
                <InfoItem
                  icon={CalendarIcon}
                  label="Ngày hết hạn"
                  value={formatDate(material?.expiryDate)}
                  valueClassName={
                    isExpiringSoon() ? "font-medium text-red-600" : ""
                  }
                />

                {isExpiringSoon() && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                      <div className="text-sm text-red-800">
                        <strong>Cảnh báo:</strong> Vật tư này sắp hết hạn sử
                        dụng trong vòng 30 ngày tới.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </InfoSection>

      {material?.description && (
        <InfoSection title="Mô tả">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {material.description}
            </p>
          </div>
        </InfoSection>
      )}
    </div>
  );

  const SupplierTab = () => (
    <div className="space-y-8">
      <InfoSection title="Thông tin nhà cung cấp">
        {material?.supplier ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <InfoItem
                icon={TruckIcon}
                label="Tên nhà cung cấp"
                value={material.supplier.name}
                valueClassName="font-medium"
              />

              <InfoItem
                icon={UserIcon}
                label="Người liên hệ"
                value={material.supplier.contact}
              />
            </div>

            <div className="space-y-4">
              <InfoItem
                icon={PhoneIcon}
                label="Số điện thoại"
                value={material.supplier.phone}
              />

              <InfoItem
                icon={EnvelopeIcon}
                label="Email"
                value={material.supplier.email}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Chưa có thông tin nhà cung cấp
            </p>
          </div>
        )}
      </InfoSection>
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Lịch sử xuất nhập kho
        </h4>
        <Button size="sm" variant="outline">
          Xem tất cả
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            Đang tải lịch sử giao dịch...
          </p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {transaction.transactionNumber}
                    </h5>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(
                        transaction.transactionType
                      )}`}
                    >
                      {getTransactionTypeText(transaction.transactionType)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Số lượng:</span>{" "}
                      {transaction.quantity > 0 ? "+" : ""}
                      {transaction.quantity} {material?.unit}
                    </div>
                    <div>
                      <span className="font-medium">Tồn kho trước:</span>{" "}
                      {transaction.previousStock} {material?.unit}
                    </div>
                    <div>
                      <span className="font-medium">Tồn kho sau:</span>{" "}
                      {transaction.newStock} {material?.unit}
                    </div>
                    <div>
                      <span className="font-medium">Giá trị:</span>{" "}
                      {formatCurrency(transaction.totalValue)}
                    </div>
                    <div>
                      <span className="font-medium">Ngày giao dịch:</span>{" "}
                      {formatDateTime(transaction.transactionDate)}
                    </div>
                    {transaction.performedBy && (
                      <div>
                        <span className="font-medium">Người thực hiện:</span>{" "}
                        {transaction.performedBy.username}
                      </div>
                    )}
                  </div>

                  {transaction.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Ghi chú:</strong> {transaction.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Chưa có giao dịch nào</p>
          <p className="text-xs text-gray-400">
            Vật tư này chưa có lịch sử xuất nhập kho
          </p>
        </div>
      )}
    </div>
  );

  if (!material) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <CubeIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết vật tư: {material.materialCode}
            </h3>
            <p className="text-sm text-gray-500">{material.name}</p>
          </div>
        </div>
      }
      size="full"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {formatDateTime(material.updatedAt)}
          </div>
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="secondary">
              Đóng
            </Button>
            <Button variant="primary">Chỉnh sửa</Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[75vh] overflow-y-auto">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="material-detail-tabs"
          size="large"
        >
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4" />
                <span>Thông tin cơ bản</span>
              </span>
            }
            key="info"
          >
            <div className="py-4">
              <BasicInfoTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Hạn sử dụng</span>
                {material?.isPerishable && isExpiringSoon() && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    Sắp hết hạn
                  </span>
                )}
              </span>
            }
            key="expiry"
          >
            <div className="py-4">
              <ExpiryTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <TruckIcon className="w-4 h-4" />
                <span>Nhà cung cấp</span>
              </span>
            }
            key="supplier"
          >
            <div className="py-4">
              <SupplierTab />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>Lịch sử giao dịch</span>
                {transactions.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {transactions.length}
                  </span>
                )}
              </span>
            }
            key="transactions"
          >
            <div className="py-4">
              <TransactionsTab />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default MaterialDetailModal;
