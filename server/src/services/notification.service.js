"use strict";

const { Notification } = require("../models/notification.model");
const { Equipment } = require("../models/equipment.model");
const { Material } = require("../models/material.model");
const { User } = require("../models/user.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");

class NotificationService {
  static getNotifications = async (userId, queryParams) => {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = { recipient: userId, isActive: true };

    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const populate = [{ path: "sender", select: "username email" }];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    return await paginate({
      model: Notification,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      populate,
      options,
    });
  };

  static getNotificationById = async (notificationId, userId) => {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
      isActive: true,
    })
      .populate("sender", "username email")
      .lean();

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    return notification;
  };

  static markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
      isActive: true,
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.status === "UNREAD") {
      await Notification.findByIdAndUpdate(notificationId, {
        status: "READ",
        readDate: new Date(),
      });
    }

    return { message: "Notification marked as read" };
  };

  static markAllAsRead = async (userId) => {
    await Notification.updateMany(
      { recipient: userId, status: "UNREAD", isActive: true },
      {
        status: "READ",
        readDate: new Date(),
      }
    );

    return { message: "All notifications marked as read" };
  };

  static deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
      isActive: true,
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    await Notification.findByIdAndUpdate(notificationId, { isActive: false });
    return { message: "Notification deleted successfully" };
  };

  static getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({
      recipient: userId,
      status: "UNREAD",
      isActive: true,
    });

    return { unreadCount: count };
  };

  // Utility methods for creating notifications
  static createNotification = async (payload) => {
    const {
      recipient,
      sender,
      type,
      title,
      message,
      priority = "MEDIUM",
      relatedEntity,
      actionRequired = false,
      actionUrl,
      deliveryMethod = ["IN_APP"],
    } = payload;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      priority,
      relatedEntity,
      actionRequired,
      actionUrl,
      deliveryMethod,
    });

    return notification;
  };

  static createMaintenanceDueNotification = async (equipment, recipient) => {
    const title = `Thiết bị ${equipment.equipmentCode} cần bảo dưỡng`;
    const message = `Thiết bị ${equipment.name} (${equipment.equipmentCode}) đã đến thời gian bảo dưỡng định kỳ.`;

    return await this.createNotification({
      recipient,
      type: "MAINTENANCE_DUE",
      title,
      message,
      priority: "HIGH",
      relatedEntity: {
        entityType: "EQUIPMENT",
        entityId: equipment._id,
      },
      actionRequired: true,
      actionUrl: `/equipments/${equipment._id}`,
    });
  };

  static createLowStockNotification = async (material, recipients) => {
    const title = `Vật tư ${material.materialCode} sắp hết hàng`;
    const message = `Vật tư ${material.name} (${material.materialCode}) chỉ còn ${material.currentStock} ${material.unit}, thấp hơn mức tối thiểu ${material.minStockLevel} ${material.unit}.`;

    const notifications = recipients.map((recipient) => ({
      recipient,
      type: "STOCK_LOW",
      title,
      message,
      priority: "HIGH",
      relatedEntity: {
        entityType: "MATERIAL",
        entityId: material._id,
      },
      actionRequired: true,
      actionUrl: `/materials/${material._id}`,
    }));

    return await Notification.insertMany(notifications);
  };

  static createTaskAssignedNotification = async (
    ticket,
    assignedTo,
    ticketType
  ) => {
    const title = `Bạn được giao ${
      ticketType === "MAINTENANCE" ? "phiếu bảo dưỡng" : "phiếu sửa chữa"
    } mới`;
    const message = `Phiếu ${ticket.ticketNumber} đã được giao cho bạn thực hiện.`;

    return await this.createNotification({
      recipient: assignedTo,
      type: "TASK_ASSIGNED",
      title,
      message,
      priority: "MEDIUM",
      relatedEntity: {
        entityType:
          ticketType === "MAINTENANCE" ? "MAINTENANCE_TICKET" : "REPAIR_TICKET",
        entityId: ticket._id,
      },
      actionRequired: true,
      actionUrl: `/${ticketType.toLowerCase()}-tickets/${ticket._id}`,
    });
  };

  static createApprovalRequiredNotification = async (
    ticket,
    approvers,
    ticketType
  ) => {
    const title = `Yêu cầu phê duyệt ${
      ticketType === "MAINTENANCE" ? "phiếu bảo dưỡng" : "phiếu sửa chữa"
    }`;
    const message = `Phiếu ${ticket.ticketNumber} cần được phê duyệt.`;

    const notifications = approvers.map((approver) => ({
      recipient: approver,
      type: "APPROVAL_REQUIRED",
      title,
      message,
      priority: "HIGH",
      relatedEntity: {
        entityType:
          ticketType === "MAINTENANCE" ? "MAINTENANCE_TICKET" : "REPAIR_TICKET",
        entityId: ticket._id,
      },
      actionRequired: true,
      actionUrl: `/${ticketType.toLowerCase()}-tickets/${ticket._id}`,
    }));

    return await Notification.insertMany(notifications);
  };

  // Scheduler methods
  static checkMaintenanceDue = async () => {
    const today = new Date();
    const equipmentsDue = await Equipment.find({
      isActive: true,
      "maintenance.nextMaintenanceDate": { $lte: today },
      status: "ACTIVE",
    });

    for (const equipment of equipmentsDue) {
      // Lấy danh sách người quản lý thiết bị
      const managers = await User.find({
        roles: { $in: ["ADMIN", "MANAGER", "TECHNICIAN"] },
        isActive: true,
      });

      for (const manager of managers) {
        await this.createMaintenanceDueNotification(equipment, manager._id);
      }
    }
  };

  static checkLowStock = async () => {
    const lowStockMaterials = await Material.find({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    });

    if (lowStockMaterials.length > 0) {
      // Lấy danh sách người quản lý kho
      const managers = await User.find({
        roles: { $in: ["ADMIN", "MANAGER"] },
        isActive: true,
      });

      for (const material of lowStockMaterials) {
        await this.createLowStockNotification(
          material,
          managers.map((m) => m._id)
        );
      }
    }
  };

  static checkExpiringMaterials = async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMaterials = await Material.find({
      isActive: true,
      isPerishable: true,
      expiryDate: {
        $exists: true,
        $lte: thirtyDaysFromNow,
        $gte: new Date(),
      },
    });

    if (expiringMaterials.length > 0) {
      const managers = await User.find({
        roles: { $in: ["ADMIN", "MANAGER"] },
        isActive: true,
      });

      for (const material of expiringMaterials) {
        const title = `Vật tư ${material.materialCode} sắp hết hạn`;
        const daysUntilExpiry = Math.ceil(
          (material.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        const message = `Vật tư ${material.name} (${material.materialCode}) sẽ hết hạn trong ${daysUntilExpiry} ngày.`;

        const notifications = managers.map((manager) => ({
          recipient: manager._id,
          type: "MATERIAL_EXPIRED",
          title,
          message,
          priority: "MEDIUM",
          relatedEntity: {
            entityType: "MATERIAL",
            entityId: material._id,
          },
          actionRequired: true,
          actionUrl: `/materials/${material._id}`,
        }));

        await Notification.insertMany(notifications);
      }
    }
  };
}

module.exports = NotificationService;
