"use strict";

const { RepairTicket } = require("../models/repairTicket.model");
const { Equipment } = require("../models/equipment.model");
const { Material } = require("../models/material.model");
const {
  InventoryTransaction,
} = require("../models/inventoryTransaction.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");

class RepairTicketService {
  static createRepairTicket = async (payload, user) => {
    const {
      equipment,
      type = "CORRECTIVE",
      priority = "MEDIUM",
      problemDescription,
      symptomDetails,
      failureType,
      severity = "MODERATE",
      assignedTo,
      scheduledDate,
    } = payload;

    // Kiểm tra thiết bị tồn tại
    const equipmentExists = await Equipment.findById(equipment);
    if (!equipmentExists) {
      throw new NotFoundError("Equipment not found");
    }

    // Tạo số phiếu
    const ticketNumber = await this.generateTicketNumber("RT");

    // Lấy giờ hiện tại của thiết bị khi bị hỏng
    const equipmentHoursAtFailure = equipmentExists.operatingHours;

    const repairTicket = await RepairTicket.create({
      ticketNumber,
      equipment,
      type,
      priority,
      requestedBy: user.userId,
      assignedTo,
      reportedDate: new Date(),
      scheduledDate,
      problemDescription,
      symptomDetails,
      failureType,
      severity,
      equipmentHoursAtFailure,
    });

    return await this.getRepairTicketById(repairTicket._id);
  };

  static getRepairTickets = async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      type,
      equipment,
      assignedTo,
      failureType,
      severity,
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
    if (failureType) filters.failureType = failureType;
    if (severity) filters.severity = severity;

    if (fromDate || toDate) {
      filters.reportedDate = {};
      if (fromDate) filters.reportedDate.$gte = new Date(fromDate);
      if (toDate) filters.reportedDate.$lte = new Date(toDate);
    }

    const searchFields = [
      "ticketNumber",
      "problemDescription",
      "symptomDetails",
    ];

    const populate = [
      { path: "equipment", select: "equipmentCode name type status" },
      { path: "requestedBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
      { path: "approvedBy", select: "username email" },
    ];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    return await paginate({
      model: RepairTicket,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      populate,
      options,
    });
  };

  static getRepairTicketById = async (ticketId) => {
    const ticket = await RepairTicket.findById(ticketId)
      .populate("equipment", "equipmentCode name type status operatingHours")
      .populate("requestedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("approvedBy", "username email")
      .populate("materialsUsed.material", "materialCode name unit unitPrice")
      .populate("materialsUsed.issuedBy", "username email")
      .lean();

    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    return ticket;
  };

  static updateRepairTicket = async (ticketId, payload, user) => {
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    // Kiểm tra quyền cập nhật
    if (
      ticket.status !== "PENDING" &&
      ticket.requestedBy.toString() !== user.userId &&
      ticket.assignedTo?.toString() !== user.userId &&
      !user.role?.includes("ADMIN")
    ) {
      throw new badRequestError("Cannot update this repair ticket");
    }

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
      ticketId,
      { ...payload },
      { new: true, runValidators: true }
    );

    return await this.getRepairTicketById(updatedTicket._id);
  };

  static deleteRepairTicket = async (ticketId) => {
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    if (ticket.status !== "PENDING") {
      throw new badRequestError(
        "Cannot delete repair ticket that is not pending"
      );
    }

    await RepairTicket.findByIdAndUpdate(ticketId, { isActive: false });
    return { message: "Repair ticket deleted successfully" };
  };

  static approveRepairTicket = async (ticketId, user) => {
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    if (ticket.status !== "PENDING") {
      throw new badRequestError("Only pending tickets can be approved");
    }

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "APPROVED",
        approvedBy: user.userId,
        approvedDate: new Date(),
      },
      { new: true }
    );

    return await this.getRepairTicketById(updatedTicket._id);
  };

  static diagnoseIssue = async (ticketId, payload, user) => {
    const { rootCause, diagnosisDetails, solutionDescription } = payload;

    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    if (ticket.status !== "PENDING" && ticket.status !== "APPROVED") {
      throw new badRequestError("Cannot diagnose ticket in current status");
    }

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "DIAGNOSED",
        rootCause,
        diagnosisDetails,
        solutionDescription,
      },
      { new: true }
    );

    return await this.getRepairTicketById(updatedTicket._id);
  };

  static startRepair = async (ticketId, payload, user) => {
    const { equipmentHoursAtFailure } = payload;

    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    if (!["PENDING", "APPROVED", "DIAGNOSED"].includes(ticket.status)) {
      throw new badRequestError("Cannot start repair for this ticket");
    }

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "IN_PROGRESS",
        actualStartDate: new Date(),
        equipmentHoursAtFailure:
          equipmentHoursAtFailure || ticket.equipmentHoursAtFailure,
      },
      { new: true }
    );

    // Cập nhật trạng thái thiết bị
    await Equipment.findByIdAndUpdate(ticket.equipment, {
      status: "REPAIR",
    });

    return await this.getRepairTicketById(updatedTicket._id);
  };

  static completeRepair = async (ticketId, payload, user) => {
    const {
      equipmentHoursAtCompletion,
      workPerformed,
      completionNotes,
      followUpRequired = false,
      followUpDate,
      followUpNotes,
      preventiveMeasures = [],
    } = payload;

    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    if (ticket.status !== "IN_PROGRESS") {
      throw new badRequestError(
        "Cannot complete repair that is not in progress"
      );
    }

    // Tính toán chi phí
    const materialCost = ticket.materialsUsed.reduce((total, material) => {
      return total + (material.totalCost || 0);
    }, 0);

    const externalServiceCost = ticket.externalServices.reduce(
      (total, service) => {
        return total + (service.cost || 0);
      },
      0
    );

    const totalCost = materialCost + externalServiceCost;

    // Tính downtime
    const downtime = ticket.actualStartDate
      ? (new Date() - new Date(ticket.actualStartDate)) / (1000 * 60 * 60)
      : 0;

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
      ticketId,
      {
        status: "COMPLETED",
        actualEndDate: new Date(),
        equipmentHoursAtCompletion,
        workPerformed,
        completionNotes,
        followUpRequired,
        followUpDate,
        followUpNotes,
        preventiveMeasures,
        "costs.materialCost": materialCost,
        "costs.externalServiceCost": externalServiceCost,
        "costs.totalCost": totalCost,
        "downtime.totalDowntime": downtime,
      },
      { new: true }
    );

    // Cập nhật thiết bị
    const equipment = await Equipment.findById(ticket.equipment);
    await Equipment.findByIdAndUpdate(ticket.equipment, {
      status: "ACTIVE",
      operatingHours: equipmentHoursAtCompletion || equipment.operatingHours,
    });

    return await this.getRepairTicketById(updatedTicket._id);
  };

  static updateRepairTask = async (ticketId, taskId, payload, user) => {
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
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
    return await this.getRepairTicketById(ticketId);
  };

  static addMaterialToRepair = async (ticketId, payload, user) => {
    const { materialId, quantityUsed, isWarrantyItem = false } = payload;

    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    if (!isWarrantyItem && material.currentStock < quantityUsed) {
      throw new badRequestError("Insufficient material stock");
    }

    if (!isWarrantyItem) {
      await Material.findByIdAndUpdate(materialId, {
        $inc: { currentStock: -quantityUsed },
      });
    }

    const materialUsed = {
      material: materialId,
      quantityUsed,
      unitPrice: isWarrantyItem ? 0 : material.unitPrice,
      totalCost: isWarrantyItem ? 0 : material.unitPrice * quantityUsed,
      issuedBy: user.userId,
      issuedDate: new Date(),
      isWarrantyItem,
    };

    await RepairTicket.findByIdAndUpdate(ticketId, {
      $push: { materialsUsed: materialUsed },
    });

    if (!isWarrantyItem) {
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
          ticketType: "REPAIR",
          ticketId: ticketId,
        },
        performedBy: user.userId,
      });
    }

    return await this.getRepairTicketById(ticketId);
  };

  static addExternalService = async (ticketId, payload, user) => {
    const { serviceName, provider, cost, description, serviceDate } = payload;

    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Repair ticket not found");
    }

    const externalService = {
      serviceName,
      provider,
      cost,
      description,
      serviceDate: serviceDate || new Date(),
    };

    await RepairTicket.findByIdAndUpdate(ticketId, {
      $push: { externalServices: externalService },
    });

    return await this.getRepairTicketById(ticketId);
  };

  static getRepairStatistics = async (queryParams) => {
    const { fromDate, toDate, equipment, failureType } = queryParams;

    const matchConditions = { isActive: true };

    if (fromDate || toDate) {
      matchConditions.reportedDate = {};
      if (fromDate) matchConditions.reportedDate.$gte = new Date(fromDate);
      if (toDate) matchConditions.reportedDate.$lte = new Date(toDate);
    }

    if (equipment) matchConditions.equipment = equipment;
    if (failureType) matchConditions.failureType = failureType;

    const [
      statusStats,
      priorityStats,
      failureTypeStats,
      severityStats,
      monthlyStats,
      totalCosts,
      downtimeStats,
    ] = await Promise.all([
      // Thống kê theo trạng thái
      RepairTicket.aggregate([
        { $match: matchConditions },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Thống kê theo mức độ ưu tiên
      RepairTicket.aggregate([
        { $match: matchConditions },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      // Thống kê theo loại hỏng hóc
      RepairTicket.aggregate([
        { $match: matchConditions },
        { $group: { _id: "$failureType", count: { $sum: 1 } } },
      ]),

      // Thống kê theo mức độ nghiêm trọng
      RepairTicket.aggregate([
        { $match: matchConditions },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),

      // Thống kê theo tháng
      RepairTicket.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: {
              year: { $year: "$reportedDate" },
              month: { $month: "$reportedDate" },
            },
            count: { $sum: 1 },
            totalCost: { $sum: "$costs.totalCost" },
            totalDowntime: { $sum: "$downtime.totalDowntime" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Tổng chi phí
      RepairTicket.aggregate([
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

      // Thống kê downtime
      RepairTicket.aggregate([
        { $match: { ...matchConditions, status: "COMPLETED" } },
        {
          $group: {
            _id: null,
            totalDowntime: { $sum: "$downtime.totalDowntime" },
            averageDowntime: { $avg: "$downtime.totalDowntime" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      statusStats,
      priorityStats,
      failureTypeStats,
      severityStats,
      monthlyStats,
      totalCosts: totalCosts[0] || { totalCost: 0, averageCost: 0, count: 0 },
      downtimeStats: downtimeStats[0] || {
        totalDowntime: 0,
        averageDowntime: 0,
        count: 0,
      },
    };
  };

  static exportRepairReport = async (queryParams) => {
    const { fromDate, toDate, status, equipment, failureType } = queryParams;

    const filters = { isActive: true };
    if (status) filters.status = status;
    if (equipment) filters.equipment = equipment;
    if (failureType) filters.failureType = failureType;
    if (fromDate || toDate) {
      filters.reportedDate = {};
      if (fromDate) filters.reportedDate.$gte = new Date(fromDate);
      if (toDate) filters.reportedDate.$lte = new Date(toDate);
    }

    const tickets = await RepairTicket.find(filters)
      .populate("equipment", "equipmentCode name type")
      .populate("requestedBy", "username")
      .populate("assignedTo", "username")
      .sort({ reportedDate: -1 })
      .lean();

    // Format dữ liệu cho export
    const reportData = tickets.map((ticket) => ({
      ticketNumber: ticket.ticketNumber,
      equipmentCode: ticket.equipment?.equipmentCode,
      equipmentName: ticket.equipment?.name,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      failureType: ticket.failureType,
      severity: ticket.severity,
      requestedBy: ticket.requestedBy?.username,
      assignedTo: ticket.assignedTo?.username,
      problemDescription: ticket.problemDescription,
      rootCause: ticket.rootCause,
      reportedDate: ticket.reportedDate,
      actualStartDate: ticket.actualStartDate,
      actualEndDate: ticket.actualEndDate,
      totalCost: ticket.costs?.totalCost || 0,
      downtime: ticket.downtime?.totalDowntime || 0,
    }));

    return {
      data: reportData,
      summary: {
        totalTickets: tickets.length,
        totalCost: tickets.reduce(
          (sum, t) => sum + (t.costs?.totalCost || 0),
          0
        ),
        totalDowntime: tickets.reduce(
          (sum, t) => sum + (t.downtime?.totalDowntime || 0),
          0
        ),
        statusBreakdown: tickets.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {}),
        failureTypeBreakdown: tickets.reduce((acc, t) => {
          acc[t.failureType] = (acc[t.failureType] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  };

  static getFailureAnalysis = async (queryParams) => {
    const { fromDate, toDate, equipment } = queryParams;

    const matchConditions = { isActive: true, status: "COMPLETED" };

    if (fromDate || toDate) {
      matchConditions.reportedDate = {};
      if (fromDate) matchConditions.reportedDate.$gte = new Date(fromDate);
      if (toDate) matchConditions.reportedDate.$lte = new Date(toDate);
    }

    if (equipment) matchConditions.equipment = equipment;

    const [failureFrequency, mtbfAnalysis, costAnalysis, downtimeAnalysis] =
      await Promise.all([
        // Tần suất hỏng hóc theo thiết bị
        RepairTicket.aggregate([
          { $match: matchConditions },
          {
            $lookup: {
              from: "equipments",
              localField: "equipment",
              foreignField: "_id",
              as: "equipmentInfo",
            },
          },
          { $unwind: "$equipmentInfo" },
          {
            $group: {
              _id: {
                equipment: "$equipment",
                equipmentCode: "$equipmentInfo.equipmentCode",
                failureType: "$failureType",
              },
              count: { $sum: 1 },
              totalCost: { $sum: "$costs.totalCost" },
              totalDowntime: { $sum: "$downtime.totalDowntime" },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Phân tích MTBF (Mean Time Between Failures)
        RepairTicket.aggregate([
          { $match: matchConditions },
          {
            $lookup: {
              from: "equipments",
              localField: "equipment",
              foreignField: "_id",
              as: "equipmentInfo",
            },
          },
          { $unwind: "$equipmentInfo" },
          {
            $group: {
              _id: "$equipment",
              equipmentCode: { $first: "$equipmentInfo.equipmentCode" },
              failureCount: { $sum: 1 },
              totalOperatingHours: { $first: "$equipmentInfo.operatingHours" },
              avgTimeBetweenFailures: {
                $avg: {
                  $subtract: ["$equipmentHoursAtFailure", 0],
                },
              },
            },
          },
          {
            $addFields: {
              mtbf: {
                $cond: {
                  if: { $gt: ["$failureCount", 0] },
                  then: { $divide: ["$totalOperatingHours", "$failureCount"] },
                  else: "$totalOperatingHours",
                },
              },
            },
          },
          { $sort: { mtbf: 1 } },
        ]),

        // Phân tích chi phí
        RepairTicket.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: "$failureType",
              count: { $sum: 1 },
              totalCost: { $sum: "$costs.totalCost" },
              averageCost: { $avg: "$costs.totalCost" },
              minCost: { $min: "$costs.totalCost" },
              maxCost: { $max: "$costs.totalCost" },
            },
          },
          { $sort: { totalCost: -1 } },
        ]),

        // Phân tích thời gian downtime
        RepairTicket.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: "$failureType",
              count: { $sum: 1 },
              totalDowntime: { $sum: "$downtime.totalDowntime" },
              averageDowntime: { $avg: "$downtime.totalDowntime" },
              minDowntime: { $min: "$downtime.totalDowntime" },
              maxDowntime: { $max: "$downtime.totalDowntime" },
            },
          },
          { $sort: { totalDowntime: -1 } },
        ]),
      ]);

    return {
      failureFrequency,
      mtbfAnalysis,
      costAnalysis,
      downtimeAnalysis,
    };
  };

  // Helper methods
  static generateTicketNumber = async (prefix) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    const ticketPrefix = `${prefix}${year}${month}`;

    const lastTicket = await RepairTicket.findOne(
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

module.exports = RepairTicketService;
