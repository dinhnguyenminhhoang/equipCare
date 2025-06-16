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
  const [loading, setLoading] = useState(true);
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
        // Clear invalid cookies
        Cookies.remove("user");
        Cookies.remove("token");
        Cookies.remove("userId");
      }
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

        // Set cookies with options
        const cookieOptions = {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: "strict", // CSRF protection
        };

        Cookies.set("user", JSON.stringify(user), cookieOptions);
        Cookies.set("token", tokens.accessToken, cookieOptions);
        Cookies.set("userId", user._id, cookieOptions);

        message.success("Đăng nhập thành công!");
        return { success: true };
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

    // Remove cookies
    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("userId");

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
