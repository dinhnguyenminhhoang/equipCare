import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Table, Spin } from "antd";
import { Empty } from "antd";

const CustomTable = ({
  columns,
  data,
  loading = false,
  pagination,
  emptyMessage = "Không có dữ liệu",
}) => {
  const antdPagination = pagination
    ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: false,
        showQuickJumper: false,
        itemRender: (current, type, originalElement) => {
          if (type === "prev") {
            return (
              <span className="flex items-center mr-2">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Trước
              </span>
            );
          }
          if (type === "next") {
            return (
              <span className="flex items-center">
                Sau
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </span>
            );
          }
          return originalElement;
        },
      }
    : false;

  // Custom empty component
  const customEmpty = (
    <Empty description={emptyMessage} image={Empty.SIMPLE_IMAGE} />
  );

  return (
    <Spin spinning={loading} tip="Đang tải...">
      <Table
        columns={columns}
        dataSource={data}
        pagination={antdPagination}
        rowKey={(record) => record._id || record.id}
        locale={{ emptyText: customEmpty }}
        className="custom-table"
        size="middle"
      />
    </Spin>
  );
};

export default CustomTable;
