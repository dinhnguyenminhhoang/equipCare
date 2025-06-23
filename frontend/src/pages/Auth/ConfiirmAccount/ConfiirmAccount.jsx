import { Spin } from "antd";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmAccountApi } from "../../../services/authService";
const ConfirmAccount = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  useEffect(() => {
    if (token) {
      const decodeInfo = jwtDecode(token);
      Cookies.set("token", token);
      Cookies.set("userId", decodeInfo.userId);
      const confirmAccount = async () => {
        try {
          let response = await confirmAccountApi();
          navigate("/login");
        } catch (error) {}
      };
      confirmAccount();
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600 mb-4">
          Đang xác thực...
        </p>
        <Spin size="large" />
      </div>
    </div>
  );
};

export default ConfirmAccount;
