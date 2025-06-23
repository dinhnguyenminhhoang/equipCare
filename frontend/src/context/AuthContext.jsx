// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import Cookies from "js-cookie";
import { customerLoginAPi } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(Cookies.get("token"));

  useEffect(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
        Cookies.remove("user");
        Cookies.remove("token");
        Cookies.remove("userId");
      }
    } else if (
      !storedUser &&
      !storedToken &&
      window.location.window.location.pathname !== "/login" &&
      !window.location.pathname.includes("/confirm-account")
    ) {
      window.location.href = "/login";
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await customerLoginAPi(credentials);

      if (response.data && response.data.tokens) {
        const { user, tokens } = response.data;

        setUser(user);
        setToken(tokens.accessToken);

        const cookieOptions = {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };

        Cookies.set("user", JSON.stringify(user), cookieOptions);
        Cookies.set("token", tokens.accessToken, cookieOptions);
        Cookies.set("userId", user._id, cookieOptions);

        message.success("Đăng nhập thành công!");
        return { success: true, roles: user.roles };
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("userId");
    window.location.href = "/login";
    message.success("Đăng xuất thành công!");
  };

  const isAdmin = () => {
    return user?.roles?.includes("ADMIN");
  };

  const isManager = () => {
    return user?.roles?.includes("MANAGER") || isAdmin();
  };

  const isTechnician = () => {
    return user?.roles?.includes("TECHNICIAN") || isManager();
  };
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isManager,
    isTechnician,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
