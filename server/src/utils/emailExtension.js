const orderContent = (order) => {
  return `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9;">
            <h2 style="color: #4CAF50;">Chi tiết đơn hàng</h2>
            <ul style="list-style-type: none; padding: 0;">
              ${order?.cart
                ?.map(
                  (item) => `
                    <li style="margin-bottom: 8px;margin-left:0">
                      <strong>${item.productName}</strong> - 
                      Số lượng: <strong>${item.quantity}</strong>, 
                      Kích thước: <strong>${item.size}</strong>
                    </li>`
                )
                .join("")}
            </ul>
            <p><strong>Tổng tiền:</strong> ${order.totalAmount.toLocaleString(
              "vi-VN",
              {
                style: "currency",
                currency: "VND",
              }
            )}</p>
            <p><strong>Số điện thoại:</strong> ${order.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.address}</p>
            <p><strong>Phương thức thanh toán:</strong> ${
              order.paymentMethod === "cash"
                ? "Thanh toán khi nhận hàng"
                : "Thanh toán qua thẻ"
            }</p>
          </div>
          <p style="margin-top: 20px;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ chúng tôi qua email hoặc hotline của cửa hàng.</p>
          <p style="text-align: center; color: #888; font-size: 0.9em; margin-top: 30px;">
            <em>Trân trọng,<br />Đội ngũ hỗ trợ khách hàng</em>
          </p>
        </div>`;
};
const confirmOrderForm = (order) => {
  return {
    title: "Thông tin đơn hàng của bạn",
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50; text-align: center;">Cảm ơn quý khách đã đặt hàng!</h1>
          <p>Xin chào,</p>
          <p>Đây là thông tin chi tiết về đơn hàng của bạn:</p>
          ${orderContent(order)}
        </div>
      `,
  };
};
const processingOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đang được xử lý`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #FFA500; text-align: center;">Đơn hàng đang được xử lý</h1>
          <p>Xin chào,</p>
          <p>Đơn hàng của bạn hiện đang được xử lý. Chúng tôi sẽ sớm gửi thông tin cập nhật tiếp theo.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};

const deliveredOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đã được giao`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50; text-align: center;">Đơn hàng đã được giao thành công!</h1>
          <p>Chúng tôi hy vọng bạn hài lòng với sản phẩm. Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};

const cancelOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đã bị hủy`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #FF0000; text-align: center;">Đơn hàng đã bị hủy</h1>
          <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng của bạn đã bị hủy. Nếu đây là nhầm lẫn, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};
const resetPasswordForm = (resetLink) => {
  return {
    title: "Đặt lại mật khẩu của bạn",
    body: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #007bff; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Đặt lại mật khẩu</h1>
          </div>
          <div style="padding: 20px;">
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.</p>
            <p>Nếu bạn muốn đặt lại mật khẩu, hãy nhấn vào nút bên dưới:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" 
                style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                Đặt lại mật khẩu
              </a>
            </div>
            <p>Nếu nút trên không hoạt động, bạn cũng có thể sao chép và dán liên kết dưới đây vào trình duyệt của mình:</p>
            <p><a href="${resetLink}" style="color: #007bff; word-break: break-word;">${resetLink}</a></p>
            <p>Trân trọng,<br/>Đội ngũ hỗ trợ</p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #666;">
            <p>Email này được gửi tự động từ hệ thống, vui lòng không trả lời. Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
          </div>
        </div>
      </div>
      `,
  };
};
const confirmAccountForm = (confirmLink) => {
  return {
    title: "Xác nhận tài khoản của bạn",
    body: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #28a745; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Xác nhận tài khoản</h1>
          </div>
          <div style="padding: 20px;">
            <p>Xin chào,</p>
            <p>Chúng tôi rất vui khi bạn đã đăng ký tài khoản tại hệ thống của chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng xác nhận tài khoản của bạn bằng cách nhấn vào nút bên dưới:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${confirmLink}" 
                style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #ffffff; background-color: #28a745; text-decoration: none; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                Xác nhận tài khoản
              </a>
            </div>
            <p>Nếu nút trên không hoạt động, bạn cũng có thể sao chép và dán liên kết dưới đây vào trình duyệt của mình:</p>
            <p><a href="${confirmLink}" style="color: #28a745; word-break: break-word;">${confirmLink}</a></p>
            <p>Trân trọng,<br/>Đội ngũ hỗ trợ</p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #666;">
            <p>Email này được gửi tự động từ hệ thống, vui lòng không trả lời. Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
          </div>
        </div>
      </div>
      `,
  };
};
const receiveReportEmailForm = (name, phone, subject, message) => {
  return {
    title: `${subject} - ${name} - ${phone}`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50; text-align: center;">Thông tin khách hàng báo cáo!</h1>
          <p>${message}</p>
        </div>
      `,
  };
};
const replyReportEmailForm = (customerName, reportTitle, replyMessage) => {
  return {
    title: `Phản hồi: ${reportTitle} - ${customerName}`,
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">Phản hồi từ bộ phận hỗ trợ</h2>
        <p>Chào <strong>${customerName}</strong>,</p>
        <p>Cảm ơn bạn đã liên hệ với chúng tôi về vấn đề "<strong>${reportTitle}</strong>".</p>
        <p>Dưới đây là phản hồi của chúng tôi:</p>
        <blockquote style="border-left: 4px solid #4CAF50; padding-left: 10px; color: #555;">
          ${replyMessage}
        </blockquote>
        <p>Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ lại với chúng tôi.</p>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ Hỗ trợ Khách hàng</strong></p>
      </div>
    `,
  };
};

module.exports = {
  confirmOrderForm,
  processingOrderForm,
  deliveredOrderForm,
  cancelOrderForm,
  resetPasswordForm,
  confirmAccountForm,
  receiveReportEmailForm,
  replyReportEmailForm,
};
