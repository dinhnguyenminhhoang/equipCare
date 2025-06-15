"use strict";

const { MaintenanceTicket } = require("../models/maintenanceTicket.model");
const { Equipment } = require("../models/equipment.model");
const { MaintenanceLevel } = require("../models/maintenanceLevel.model");
const { Material } = require("../models/material.model");
const {
  InventoryTransaction,
} = require("../models/inventoryTransaction.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");

class MaintenanceTicketService {
  static createMaintenanceTicket = async (payload, user) => {
    const {
      equipment,
      maintenanceLevel,
      type = "PREVENTIVE",
      priority = "MEDIUM",
      scheduledDate,
      description,
      assignedTo,
    } = payload;

    // Kiểm tra thiết bị tồn tại
    const equipmentExists = await Equipment.findById(equipment);
    if (!equipmentExists) {
      throw new NotFoundError("Equipment not found");
    }

    // Kiểm tra cấp bảo dưỡng
    const maintenanceLevelExists = await MaintenanceLevel.findById(
      maintenanceLevel
    );
    if (!maintenanceLevelExists) {
      throw new NotFoundError("Maintenance level not found");
    }

    // Tạo số phiếu
    const ticketNumber = await this.generateTicketNumber("MT");

    // Lấy giờ hiện tại của thiết bị
    const equipmentHoursAtStart = equipmentExists.operatingHours;

    // Tạo danh sách công việc từ maintenance level
    const tasks = maintenanceLevelExists.requiredTasks.map((task) => ({
      taskCode: task.taskCode,
      taskName: task.taskName,
      description: task.description,
      status: "PENDING",
    }));

    const maintenanceTicket = await MaintenanceTicket.create({
      ticketNumber,
      equipment,
      maintenanceLevel,
      type,
      priority,
      requestedBy: user.userId,
      assignedTo,
      scheduledDate,
      description,
      equipmentHoursAtStart,
      tasks,
    });

    return await this.getMaintenanceTicketById(maintenanceTicket._id);
  };

  static getMaintenanceTickets = async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      type,
      equipment,
      assignedTo,
      fromDate,
      toDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = { isActive: true };

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (type) filters.type = type;
    if (equipment) filters.equipment = equipment;
    if (assignedTo) filters.assignedTo = assignedTo;

    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.$gte = new Date(fromDate);
      if (toDate) filters.createdAt.$lte = new Date(toDate);
    }

    const searchFields = ["ticketNumber", "description"];

    const populate = [
      { path: "equipment", select: "equipmentCode name type status" },
      { path: "maintenanceLevel", select: "name intervalHours" },
      { path: "requestedBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
      { path: "approvedBy", select: "username email" },
    ];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    return await paginate({
      model: MaintenanceTicket,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      populate,
      options,
    });
  };

  static getMaintenanceTicketById = async (ticketId) => {
    const ticket = await MaintenanceTicket.findById(ticketId)
      .populate("equipment", "equipmentCode name type status operatingHours")
      .populate(
        "maintenanceLevel",
        "name intervalHours requiredTasks estimatedCost"
      )
      .populate("requestedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("approvedBy", "username email")
      .populate("materialsUsed.material", "materialCode name unit unitPrice")
      .populate("materialsUsed.issuedBy", "username email")
      .lean();

    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    return ticket;
  };

  static updateMaintenanceTicket = async (ticketId, payload, user) => {
    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    // Chỉ cho phép cập nhật nếu trạng thái PENDING hoặc người tạo/được giao
    if (
      ticket.status !== "PENDING" &&
      ticket.requestedBy.toString() !== user.userId &&
      ticket.assignedTo?.toString() !== user.userId &&
      !user.role?.includes("ADMIN")
    ) {
      throw new badRequestError("Cannot update this maintenance ticket");
    }

    const updatedTicket = await MaintenanceTicket.findByIdAndUpdate(
      ticketId,
      { ...payload },
      { new: true, runValidators: true }
    );

    return await this.getMaintenanceTicketById(updatedTicket._id);
  };

  static deleteMaintenanceTicket = async (ticketId) => {
    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    if (ticket.status !== "PENDING") {
      throw new badRequestError(
        "Cannot delete maintenance ticket that is not pending"
      );
    }

    await MaintenanceTicket.findByIdAndUpdate(ticketId, { isActive: false });
    return { message: "Maintenance ticket deleted successfully" };
  };

  static approveMaintenanceTicket = async (ticketId, user) => {
    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    if (ticket.status !== "PENDING") {
      throw new badRequestError("Only pending tickets can be approved");
    }

    const updatedTicket = await MaintenanceTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "APPROVED",
        approvedBy: user.userId,
        approvedDate: new Date(),
      },
      { new: true }
    );

    return await this.getMaintenanceTicketById(updatedTicket._id);
  };

  static startMaintenance = async (ticketId, payload, user) => {
    const { equipmentHoursAtStart } = payload;

    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    if (ticket.status !== "PENDING" && ticket.status !== "APPROVED") {
      throw new badRequestError("Cannot start maintenance for this ticket");
    }

    const updatedTicket = await MaintenanceTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "IN_PROGRESS",
        actualStartDate: new Date(),
        equipmentHoursAtStart:
          equipmentHoursAtStart || ticket.equipmentHoursAtStart,
      },
      { new: true }
    );

    // Cập nhật trạng thái thiết bị
    await Equipment.findByIdAndUpdate(ticket.equipment, {
      status: "MAINTENANCE",
    });

    return await this.getMaintenanceTicketById(updatedTicket._id);
  };

  static completeMaintenance = async (ticketId, payload, user) => {
    const { equipmentHoursAtEnd, completionNotes, nextMaintenanceDue } =
      payload;

    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    if (ticket.status !== "IN_PROGRESS") {
      throw new badRequestError(
        "Cannot complete maintenance that is not in progress"
      );
    }

    // Tính toán chi phí
    const materialCost = ticket.materialsUsed.reduce((total, material) => {
      return total + (material.totalCost || 0);
    }, 0);

    const updatedTicket = await MaintenanceTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "COMPLETED",
        actualEndDate: new Date(),
        equipmentHoursAtEnd,
        completionNotes,
        nextMaintenanceDue,
        "costs.materialCost": materialCost,
        "costs.totalCost": materialCost,
      },
      { new: true }
    );

    // Cập nhật thiết bị
    const equipment = await Equipment.findById(ticket.equipment);
    await Equipment.findByIdAndUpdate(ticket.equipment, {
      status: "ACTIVE",
      operatingHours: equipmentHoursAtEnd || equipment.operatingHours,
      "maintenance.lastMaintenanceDate": new Date(),
      "maintenance.nextMaintenanceDate": nextMaintenanceDue,
    });

    return await this.getMaintenanceTicketById(updatedTicket._id);
  };

  static updateMaintenanceTask = async (ticketId, taskId, payload, user) => {
    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    const taskIndex = ticket.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );
    if (taskIndex === -1) {
      throw new NotFoundError("Task not found");
    }

    // Cập nhật task
    ticket.tasks[taskIndex] = { ...ticket.tasks[taskIndex], ...payload };

    if (payload.status === "COMPLETED") {
      ticket.tasks[taskIndex].isCompleted = true;
      ticket.tasks[taskIndex].endTime = new Date();
    }

    await ticket.save();
    return await this.getMaintenanceTicketById(ticketId);
  };

  static addMaterialToMaintenance = async (ticketId, payload, user) => {
    const { materialId, quantityUsed } = payload;

    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Maintenance ticket not found");
    }

    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    if (material.currentStock < quantityUsed) {
      throw new badRequestError("Insufficient material stock");
    }

    // Cập nhật tồn kho vật tư
    await Material.findByIdAndUpdate(materialId, {
      $inc: { currentStock: -quantityUsed },
    });

    // Thêm vật tư vào phiếu
    const materialUsed = {
      material: materialId,
      quantityUsed,
      unitPrice: material.unitPrice,
      totalCost: material.unitPrice * quantityUsed,
      issuedBy: user.userId,
      issuedDate: new Date(),
    };

    await MaintenanceTicket.findByIdAndUpdate(ticketId, {
      $push: { materialsUsed: materialUsed },
    });

    // Tạo transaction log
    const transactionNumber = await this.generateTransactionNumber("TXN");
    await InventoryTransaction.create({
      transactionNumber,
      material: materialId,
      transactionType: "OUTBOUND",
      quantity: -quantityUsed,
      unitPrice: material.unitPrice,
      totalValue: material.unitPrice * quantityUsed,
      previousStock: material.currentStock + quantityUsed,
      newStock: material.currentStock,
      relatedTicket: {
        ticketType: "MAINTENANCE",
        ticketId: ticketId,
      },
      performedBy: user.userId,
    });

    return await this.getMaintenanceTicketById(ticketId);
  };

  static getMaintenanceStatistics = async (queryParams) => {
    const { fromDate, toDate, equipment, type } = queryParams;

    const matchConditions = { isActive: true };

    if (fromDate || toDate) {
      matchConditions.createdAt = {};
      if (fromDate) matchConditions.createdAt.$gte = new Date(fromDate);
      if (toDate) matchConditions.createdAt.$lte = new Date(toDate);
    }

    if (equipment) matchConditions.equipment = equipment;
    if (type) matchConditions.type = type;

    const [statusStats, priorityStats, typeStats, monthlyStats, totalCosts] =
      await Promise.all([
        // Thống kê theo trạng thái
        MaintenanceTicket.aggregate([
          { $match: matchConditions },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Thống kê theo mức độ ưu tiên
        MaintenanceTicket.aggregate([
          { $match: matchConditions },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),

        // Thống kê theo loại
        MaintenanceTicket.aggregate([
          { $match: matchConditions },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),

        // Thống kê theo tháng
        MaintenanceTicket.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
              totalCost: { $sum: "$costs.totalCost" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // Tổng chi phí
        MaintenanceTicket.aggregate([
          { $match: { ...matchConditions, status: "COMPLETED" } },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$costs.totalCost" },
              averageCost: { $avg: "$costs.totalCost" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    return {
      statusStats,
      priorityStats,
      typeStats,
      monthlyStats,
      totalCosts: totalCosts[0] || { totalCost: 0, averageCost: 0, count: 0 },
    };
  };

  static exportMaintenanceReport = async (queryParams) => {
    const { fromDate, toDate, status, equipment } = queryParams;

    const filters = { isActive: true };
    if (status) filters.status = status;
    if (equipment) filters.equipment = equipment;
    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.$gte = new Date(fromDate);
      if (toDate) filters.createdAt.$lte = new Date(toDate);
    }

    const tickets = await MaintenanceTicket.find(filters)
      .populate("equipment", "equipmentCode name type")
      .populate("maintenanceLevel", "name intervalHours")
      .populate("requestedBy", "username")
      .populate("assignedTo", "username")
      .sort({ createdAt: -1 })
      .lean();

    // Format dữ liệu cho export
    const reportData = tickets.map((ticket) => ({
      ticketNumber: ticket.ticketNumber,
      equipmentCode: ticket.equipment?.equipmentCode,
      equipmentName: ticket.equipment?.name,
      maintenanceLevel: ticket.maintenanceLevel?.name,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      requestedBy: ticket.requestedBy?.username,
      assignedTo: ticket.assignedTo?.username,
      scheduledDate: ticket.scheduledDate,
      actualStartDate: ticket.actualStartDate,
      actualEndDate: ticket.actualEndDate,
      totalCost: ticket.costs?.totalCost || 0,
      createdAt: ticket.createdAt,
    }));

    return {
      data: reportData,
      summary: {
        totalTickets: tickets.length,
        totalCost: tickets.reduce(
          (sum, t) => sum + (t.costs?.totalCost || 0),
          0
        ),
        statusBreakdown: tickets.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  };

  // Helper methods
  static generateTicketNumber = async (prefix) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    const ticketPrefix = `${prefix}${year}${month}`;

    const lastTicket = await MaintenanceTicket.findOne(
      { ticketNumber: { $regex: `^${ticketPrefix}` } },
      {},
      { sort: { ticketNumber: -1 } }
    );

    let sequence = 1;
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.substr(-4));
      sequence = lastSequence + 1;
    }

    return `${ticketPrefix}${String(sequence).padStart(4, "0")}`;
  };

  static generateTransactionNumber = async (prefix) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const txnPrefix = `${prefix}${year}${month}${day}`;

    const lastTransaction = await InventoryTransaction.findOne(
      { transactionNumber: { $regex: `^${txnPrefix}` } },
      {},
      { sort: { transactionNumber: -1 } }
    );

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(
        lastTransaction.transactionNumber.substr(-4)
      );
      sequence = lastSequence + 1;
    }

    return `${txnPrefix}${String(sequence).padStart(4, "0")}`;
  };
}

module.exports = MaintenanceTicketService;
