"use strict";

const { MaintenanceTicket } = require("../models/maintenanceTicket.model");
const { RepairTicket } = require("../models/repairTicket.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");
const { Equipment } = require("../models");

class EquipmentService {
  static createEquipment = async (payload) => {
    const {
      equipmentCode,
      name,
      type,
      model,
      brand,
      serialNumber,
      suppliedDate,
      purchasePrice,
      currentValue,
      specifications,
      location,
      assignedTo,
      notes,
    } = payload;

    // Kiểm tra mã thiết bị đã tồn tại
    const existingEquipment = await Equipment.findOne({ equipmentCode });
    if (existingEquipment) {
      throw new badRequestError("Equipment code already exists");
    }

    const equipment = await Equipment.create({
      equipmentCode: equipmentCode.toUpperCase(),
      name,
      type,
      model,
      brand,
      serialNumber,
      suppliedDate,
      purchasePrice,
      currentValue,
      specifications,
      location,
      assignedTo,
      notes,
      maintenance: {
        maintenanceInterval60h: true,
        maintenanceInterval120h: true,
      },
    });

    return equipment;
  };

  static getEquipments = async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      type,
      status,
      location,
      assignedTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;
    const filters = {};

    if (type) filters.type = type;
    if (status) filters.status = status;
    if (location) filters.location = new RegExp(location, "i");
    if (assignedTo) filters.assignedTo = assignedTo;

    filters.isActive = true;

    const searchFields = [
      "equipmentCode",
      "name",
      "model",
      "brand",
      "serialNumber",
    ];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const populate = [{ path: "assignedTo", select: "username email" }];

    return await paginate({
      model: Equipment,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      populate,
      options,
    });
  };

  static getEquipmentById = async (equipmentId) => {
    const equipment = await Equipment.findById(equipmentId)
      .populate("assignedTo", "username email phone")
      .lean();

    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    return equipment;
  };

  static updateEquipment = async (equipmentId, payload) => {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    // Kiểm tra mã thiết bị nếu có thay đổi
    if (
      payload.equipmentCode &&
      payload.equipmentCode !== equipment.equipmentCode
    ) {
      const existingEquipment = await Equipment.findOne({
        equipmentCode: payload.equipmentCode.toUpperCase(),
        _id: { $ne: equipmentId },
      });
      if (existingEquipment) {
        throw new badRequestError("Equipment code already exists");
      }
      payload.equipmentCode = payload.equipmentCode.toUpperCase();
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      equipmentId,
      { ...payload },
      { new: true, runValidators: true }
    ).populate("assignedTo", "username email");

    return updatedEquipment;
  };

  static deleteEquipment = async (equipmentId) => {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    await Equipment.findByIdAndUpdate(equipmentId, { isActive: false });
    return { message: "Equipment deleted successfully" };
  };

  static updateOperatingHours = async (equipmentId, operatingHours) => {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    if (operatingHours < equipment.operatingHours) {
      throw new badRequestError(
        "Operating hours cannot be less than current value"
      );
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      equipmentId,
      { operatingHours },
      { new: true }
    );

    // Kiểm tra xem có cần bảo dưỡng không
    await this.checkMaintenanceDue(updatedEquipment);

    return updatedEquipment;
  };

  static getEquipmentsDueForMaintenance = async (queryParams) => {
    const { page = 1, limit = 10, type, urgency = "all" } = queryParams;

    const currentDate = new Date();
    const filters = { isActive: true };

    if (type) filters.type = type;

    // Lọc theo mức độ khẩn cấp
    if (urgency === "overdue") {
      filters["maintenance.nextMaintenanceDate"] = { $lt: currentDate };
    } else if (urgency === "due_soon") {
      const nextWeek = new Date();
      nextWeek.setDate(currentDate.getDate() + 7);
      filters["maintenance.nextMaintenanceDate"] = {
        $gte: currentDate,
        $lte: nextWeek,
      };
    } else if (urgency !== "all") {
      filters["maintenance.nextMaintenanceDate"] = { $lte: currentDate };
    }

    const populate = [{ path: "assignedTo", select: "username email" }];

    return await paginate({
      model: Equipment,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      populate,
      options: { sort: { "maintenance.nextMaintenanceDate": 1 } },
    });
  };

  static getEquipmentStatistics = async () => {
    const totalEquipments = await Equipment.countDocuments({ isActive: true });

    const statusStats = await Equipment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const typeStats = await Equipment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Thiết bị cần bảo dưỡng
    const currentDate = new Date();
    const maintenanceDue = await Equipment.countDocuments({
      isActive: true,
      "maintenance.nextMaintenanceDate": { $lte: currentDate },
    });

    const maintenanceOverdue = await Equipment.countDocuments({
      isActive: true,
      "maintenance.nextMaintenanceDate": { $lt: currentDate },
    });

    return {
      totalEquipments,
      statusStats,
      typeStats,
      maintenanceDue,
      maintenanceOverdue,
    };
  };

  static getMaintenanceHistory = async (equipmentId, queryParams) => {
    const { page = 1, limit = 10, status, fromDate, toDate } = queryParams;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    const filters = { equipment: equipmentId };

    if (status) filters.status = status;
    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.$gte = new Date(fromDate);
      if (toDate) filters.createdAt.$lte = new Date(toDate);
    }

    const populate = [
      { path: "requestedBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
      { path: "maintenanceLevel", select: "name intervalHours" },
    ];

    return await paginate({
      model: MaintenanceTicket,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      populate,
      options: { sort: { createdAt: -1 } },
    });
  };

  static getRepairHistory = async (equipmentId, queryParams) => {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      fromDate,
      toDate,
    } = queryParams;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    const filters = { equipment: equipmentId };

    if (status) filters.status = status;
    if (type) filters.type = type;
    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.$gte = new Date(fromDate);
      if (toDate) filters.createdAt.$lte = new Date(toDate);
    }

    const populate = [
      { path: "requestedBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
    ];

    return await paginate({
      model: RepairTicket,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      populate,
      options: { sort: { createdAt: -1 } },
    });
  };

  // Helper method để kiểm tra bảo dưỡng định kỳ
  static checkMaintenanceDue = async (equipment) => {
    const { operatingHours, maintenance } = equipment;

    // Kiểm tra bảo dưỡng 60h
    if (
      maintenance.maintenanceInterval60h &&
      operatingHours % 60 === 0 &&
      operatingHours > 0
    ) {
      // Tạo thông báo hoặc phiếu bảo dưỡng tự động
      console.log(
        `Equipment ${equipment.equipmentCode} needs 60h maintenance at ${operatingHours} hours`
      );
    }

    // Kiểm tra bảo dưỡng 120h
    if (
      maintenance.maintenanceInterval120h &&
      operatingHours % 120 === 0 &&
      operatingHours > 0
    ) {
      // Tạo thông báo hoặc phiếu bảo dưỡng tự động
      console.log(
        `Equipment ${equipment.equipmentCode} needs 120h maintenance at ${operatingHours} hours`
      );
    }
  };
}

module.exports = { EquipmentService };
