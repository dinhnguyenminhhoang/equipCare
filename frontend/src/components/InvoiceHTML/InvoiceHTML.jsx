import { formatCurrency } from "../../utils";

const InvoiceHTML = ({
  ticket,
  getTypeText,
  getStatusText,
  getPriorityText,
  formatDate,
  convertNumberToWords,
  invoiceNumber,
  currentDate,
}) => {
  return `
     <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn sửa chữa - ${invoiceNumber}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .company-info {
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
          }
          .invoice-title {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .invoice-info, .customer-info {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            color: #2563eb;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .info-label {
            font-weight: bold;
            min-width: 120px;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .services-table th,
          .services-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .services-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
          }
          .services-table td.number {
            text-align: center;
          }
          .services-table td.amount {
            text-align: right;
          }
          .total-section {
            margin-top: 20px;
            border-top: 2px solid #333;
            padding-top: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 50px;
            text-align: center;
          }
          .signature-box {
            padding: 20px 0;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 50px;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 5px;
            font-style: italic;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: #22c55e;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">CÔNG TY THIẾT BỊ XÂY DỰNG ABC</div>
          <div class="company-info">
            Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
            Điện thoại: (028) 1234 5678 | Email: info@abc-equipment.com<br>
            MST: 0123456789
          </div>
          <div class="invoice-title">Hóa đơn dịch vụ sửa chữa</div>
          <div>Số: ${invoiceNumber} | Ngày: ${currentDate}</div>
        </div>

        <div class="invoice-details">
          <div class="invoice-info">
            <div class="section-title">Thông tin phiếu sửa chữa</div>
            <div class="info-row">
              <span class="info-label">Số phiếu:</span>
              <span>${ticket.ticketNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Trạng thái:</span>
              <span class="status-badge">${getStatusText(ticket.status)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Loại sửa chữa:</span>
              <span>${getTypeText(ticket.type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Mức độ ưu tiên:</span>
              <span>${getPriorityText(ticket.priority)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày báo cáo:</span>
              <span>${formatDate(ticket.reportedDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày hoàn thành:</span>
              <span>${formatDate(ticket.actualEndDate)}</span>
            </div>
          </div>

          <div class="customer-info">
            <div class="section-title">Thông tin thiết bị</div>
            <div class="info-row">
              <span class="info-label">Mã thiết bị:</span>
              <span>${ticket.equipment?.equipmentCode || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tên thiết bị:</span>
              <span>${ticket.equipment?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Loại thiết bị:</span>
              <span>${ticket.equipment?.type || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Người báo cáo:</span>
              <span>${ticket.requestedBy?.username || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Người thực hiện:</span>
              <span>${ticket.assignedTo?.username || "N/A"}</span>
            </div>
          </div>
        </div>

        <div class="section-title">Mô tả vấn đề</div>
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; background-color: #f8f9fa;">
          ${ticket.problemDescription || "Không có mô tả"}
        </div>

        ${
          ticket.rootCause
            ? `
        <div class="section-title">Nguyên nhân gốc</div>
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; background-color: #f8f9fa;">
          ${ticket.rootCause}
        </div>
        `
            : ""
        }

        <div class="section-title">Chi tiết chi phí</div>
        <table class="services-table">
          <thead>
            <tr>
              <th style="width: 10%">STT</th>
              <th style="width: 40%">Mô tả</th>
              <th style="width: 15%">Số lượng</th>
              <th style="width: 20%">Đơn giá (VNĐ)</th>
              <th style="width: 15%">Thành tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="number">1</td>
              <td>Dịch vụ sửa chữa ${getTypeText(
                ticket.type
              ).toLowerCase()}</td>
              <td class="number">1</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.laborCost || 0
              )}</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.laborCost || 0
              )}</td>
            </tr>
            ${
              ticket.costs?.materialCost > 0
                ? `
            <tr>
              <td class="number">2</td>
              <td>Chi phí vật tư, phụ tùng</td>
              <td class="number">1</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.materialCost
              )}</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.materialCost
              )}</td>
            </tr>
            `
                : ""
            }
            ${
              ticket.costs?.externalServiceCost > 0
                ? `
            <tr>
              <td class="number">${
                ticket.costs?.materialCost > 0 ? "3" : "2"
              }</td>
              <td>Chi phí dịch vụ bên ngoài</td>
              <td class="number">1</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.externalServiceCost
              )}</td>
              <td class="amount">${formatCurrency(
                ticket.costs?.externalServiceCost
              )}</td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Tổng tiền hàng:</span>
            <span>${formatCurrency(ticket.costs?.totalCost || 0)}</span>
          </div>
          <div class="total-row">
            <span>Thuế VAT (0%):</span>
            <span>0 VNĐ</span>
          </div>
          <div class="total-row total-final">
            <span>Tổng cộng:</span>
            <span>${formatCurrency(ticket.costs?.totalCost || 0)}</span>
          </div>
          <div style="margin-top: 10px; font-style: italic;">
            Bằng chữ: <strong>${convertNumberToWords(
              ticket.costs?.totalCost || 0
            )} đồng</strong>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div class="signature-title">Người thực hiện</div>
            <div class="signature-line">${
              ticket.assignedTo?.username || ""
            }</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Khách hàng xác nhận</div>
            <div class="signature-line">Ký và ghi rõ họ tên</div>
          </div>
        </div>

        <div class="footer">
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
          <p>Hóa đơn này được tạo tự động từ hệ thống quản lý thiết bị.</p>
        </div>
      </body>
      </html>`;
};

export default InvoiceHTML;
