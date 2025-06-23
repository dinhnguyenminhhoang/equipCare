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
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = Cookies.get("user");
        const storedToken = Cookies.get("token");

        console.log("Auth initialization:", {
          hasStoredUser: !!storedUser,
          hasStoredToken: !!storedToken,
        });

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          console.log("User restored from cookies:", parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
        Cookies.remove("user");
        Cookies.remove("token");
        Cookies.remove("userId");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Redirect logic riêng biệt, chạy sau khi initialized
  useEffect(() => {
    if (!isInitialized || loading) return;

    const currentPath = window.location.pathname;
    const publicPaths = [
      "/login",
      "/register",
      "/",
      "/confirm-account",
      "/history",
    ];
    const isPublicPath = publicPaths.some(
      (path) => currentPath === path || currentPath.includes("/confirm-account")
    );

    console.log("Auth redirect check:", {
      hasUser: !!user,
      hasToken: !!token,
      currentPath,
      isPublicPath,
    });

    // Chỉ redirect nếu không có auth và đang ở protected route
    if (!user && !token && !isPublicPath) {
      console.log("Redirecting to login - no auth data");
      window.location.href = "/login";
    }
  }, [user, token, isInitialized, loading]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Attempting login with:", credentials.email);

      const response = await customerLoginAPi(credentials);
      console.log("Login API response:", response);

      if (response.data && response.data.tokens) {
        const { user: userData, tokens } = response.data;

        console.log("Login successful, user data:", userData);
        console.log("User roles:", userData.roles);

        // Update state first
        setUser(userData);
        setToken(tokens.accessToken);

        // Then save to cookies
        const cookieOptions = {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };

        Cookies.set("user", JSON.stringify(userData), cookieOptions);
        Cookies.set("token", tokens.accessToken, cookieOptions);
        Cookies.set("userId", userData._id, cookieOptions);

        message.success("Đăng nhập thành công!");

        // Return với user data để handleSubmit có thể sử dụng
        return {
          success: true,
          roles: userData.roles,
          user: userData,
        };
      } else {
        console.error("Invalid response format:", response);
        return { success: false, error: "Invalid response format" };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại!";
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out user");
    setUser(null);
    setToken(null);

    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("userId");

    message.success("Đăng xuất thành công!");
    window.location.href = "/login";
  };

  const isAdmin = () => {
    const result = user?.roles?.includes("ADMIN");
    return result;
  };

  const isManager = () => {
    const result = user?.roles?.includes("MANAGER") || isAdmin();
    return result;
  };

  const isTechnician = () => {
    const result = user?.roles?.includes("TECHNICIAN") || isManager();
    return result;
  };

  const value = {
    user,
    token,
    loading,
    isInitialized,
    login,
    logout,
    isAdmin,
    isManager,
    isTechnician,
    isAuthenticated: !!token && !!user,
  };

  console.log("AuthContext current state:", {
    hasUser: !!user,
    hasToken: !!token,
    loading,
    isInitialized,
    isAuthenticated: !!token && !!user,
    userRoles: user?.roles,
    userEmail: user?.email,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
