
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

module.exports = {
  resetPasswordForm,
  confirmAccountForm,
};
