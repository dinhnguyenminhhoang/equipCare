"use strict";

const { User } = require("../models/user.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { removeUndefinedObject } = require("../utils");
const { MaintenanceTicket } = require("../models/maintenanceTicket.model");
const { RepairTicket } = require("../models/repairTicket.model");

class UserService {
  static getUsers = async (queryParams) => {
    queryParams = removeUndefinedObject(queryParams);
    const {
      page = 1,
      limit = 10,
      search = "",
      roles,
      department,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = {};

    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      filters.roles = { $in: roleArray };
    }
    if (department) filters.department = new RegExp(department, "i");

    const searchFields = ["username", "email", "phone", "department"];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const projection = { password: 0 }; // Không trả về password

    return await paginate({
      model: User,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      projection,
      options,
    });
  };
  static getUsersTechnicians = async (queryParams) => {
    queryParams = removeUndefinedObject(queryParams);
    const {
      page = 1,
      limit = 10,
      search = "",
      roles = "TECHNICIAN",
      department,
      isActive = true,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = {};

    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      filters.roles = { $in: roleArray };
    }
    if (department) filters.department = new RegExp(department, "i");
    filters.isActive = isActive;
    const searchFields = ["username", "email", "phone", "department"];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const projection = { password: 0, roles: 0 }; // Không trả về password và roles

    return await paginate({
      model: User,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      projection,
      options,
    });
  };
  static getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  };

  static createUser = async (payload) => {
    const {
      username,
      email,
      phone,
      password,
      roles = ["USER"],
      department,
      isActive = true,
    } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new badRequestError("Email already exists");
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new badRequestError("Username already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      roles,
      department,
      isActive,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  };
  static updateUser = async (userId, payload) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (payload.email && payload.email !== user.email) {
      const existingUser = await User.findOne({
        email: payload.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new badRequestError("Email already exists");
      }
    }

    // Kiểm tra username nếu có thay đổi
    if (payload.username && payload.username !== user.username) {
      const existingUser = await User.findOne({
        username: payload.username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new badRequestError("Username already exists");
      }
    }

    // Hash password nếu có thay đổi
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...payload },
      { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
  };

  static deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Soft delete
    await User.findByIdAndUpdate(userId, { isActive: false });
    return { message: "User deleted successfully" };
  };

  static toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { new: true }
    ).select("-password");

    return updatedUser;
  };

  static getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  };

  static updateProfile = async (userId, payload) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Chỉ cho phép cập nhật một số trường
    const allowedFields = ["username", "phone", "department"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    });

    // Kiểm tra username nếu có thay đổi
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new badRequestError("Username already exists");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return updatedUser;
  };

  static changePassword = async (userId, payload) => {
    const { currentPassword, newPassword, confirmPassword } = payload;

    if (newPassword !== confirmPassword) {
      throw new badRequestError(
        "New password and confirm password do not match"
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new badRequestError("Current password is incorrect");
    }

    // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new badRequestError(
        "New password must be different from current password"
      );
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    return { message: "Password changed successfully" };
  };

  static getUserStatistics = async () => {
    console.log("Fetching user statistics...");
    const [totalUsers, activeUsers, roleStats, departmentStats, recentUsers] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isActive: true }),
        User.aggregate([
          { $unwind: "$roles" },
          { $group: { _id: "$roles", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: { department: { $exists: true, $ne: null } } },
          { $group: { _id: "$department", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.find({})
          .select("username email createdAt isActive")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleStats,
      departmentStats,
      recentUsers,
    };
  };

  static resetUserPassword = async (userId, payload) => {
    const { newPassword } = payload;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Tạo mật khẩu ngẫu nhiên nếu không cung cấp
    const passwordToSet = newPassword || crypto.randomBytes(8).toString("hex");

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return {
      message: "Password reset successfully",
      newPassword: newPassword ? undefined : passwordToSet, // Chỉ trả về password ngẫu nhiên
    };
  };
  static getHistory = async (userId) => {
    if (!userId) {
      throw new badRequestError("User ID is required");
    }
    const maintenanceTicketsHistory = await MaintenanceTicket.find({
      requestedBy: userId,
      isActive: true,
    });
    const repairTicketsHistory = await RepairTicket.find({
      requestedBy: userId,
      isActive: true,
    });
    return {
      maintenanceTicketsHistory,
      repairTicketsHistory,
    };
  };
}

module.exports = UserService;
