// server/src/services/dashboard.service.js
"use strict";

const { Equipment } = require("../models/equipment.model");
const { Material } = require("../models/material.model");
const { MaintenanceTicket } = require("../models/maintenanceTicket.model");
const { RepairTicket } = require("../models/repairTicket.model");
const { User } = require("../models/user.model");
const {
  InventoryTransaction,
} = require("../models/inventoryTransaction.model");

class DashboardService {
  static getOverview = async () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      totalEquipments,
      activeEquipments,
      maintenanceEquipments,
      repairEquipments,
      totalUsers,
      activeUsers,
      totalMaterials,
      lowStockMaterials,
      maintenanceThisMonth,
      repairThisMonth,
      maintenanceLastMonth,
      repairLastMonth,
      overdueMaintenances,
      pendingApprovals,
      equipmentsByStatus,
      totalStockValue,
    ] = await Promise.all([
      Equipment.countDocuments({ isActive: true }),
      Equipment.countDocuments({ isActive: true, status: "ACTIVE" }),
      Equipment.countDocuments({ isActive: true, status: "MAINTENANCE" }),
      Equipment.countDocuments({ isActive: true, status: "REPAIR" }),
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Material.countDocuments({ isActive: true }),
      Material.countDocuments({
        isActive: true,
        $expr: { $lte: ["$currentStock", "$minStockLevel"] },
      }),
      MaintenanceTicket.countDocuments({
        isActive: true,
        createdAt: { $gte: thisMonth },
      }),
      RepairTicket.countDocuments({
        isActive: true,
        reportedDate: { $gte: thisMonth },
      }),
      MaintenanceTicket.countDocuments({
        isActive: true,
        createdAt: { $gte: lastMonth, $lt: thisMonth },
      }),
      RepairTicket.countDocuments({
        isActive: true,
        reportedDate: { $gte: lastMonth, $lt: thisMonth },
      }),
      Equipment.countDocuments({
        isActive: true,// Replace with actual data
        "maintenance.nextMaintenanceDate": { $lt: today },
      }),
      MaintenanceTicket.countDocuments({
        isActive: true,
        status: "PENDING",
      }),
      RepairTicket.countDocuments({
        isActive: true,
        status: "PENDING",
      }),
      Equipment.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Material.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: ["$currentStock", "$unitPrice"] },
            },
          },
        },
      ]),
    ]);

    return {
      summary: {
        totalEquipments,
        activeEquipments,
        maintenanceEquipments,
        repairEquipments,
        totalUsers,
        activeUsers,
        totalMaterials,
        lowStockMaterials,
        overdueMaintenances,
        pendingApprovals,
        totalStockValue: totalStockValue[0]?.totalValue || 0,
      },
      trends: {
        maintenanceThisMonth,
        repairThisMonth,
        maintenanceGrowth:
          maintenanceLastMonth > 0
            ? (
                ((maintenanceThisMonth - maintenanceLastMonth) /
                  maintenanceLastMonth) *
                100
              ).toFixed(1)
            : 0,
        repairGrowth:
          repairLastMonth > 0
            ? (
                ((repairThisMonth - repairLastMonth) / repairLastMonth) *
                100
              ).toFixed(1)
            : 0,
      },
      equipmentsByStatus,
    };
  };

  static getMaintenanceSummary = async (queryParams) => {
    const { period = "month" } = queryParams;

    let dateRange = {};
    const today = new Date();

    switch (period) {
      case "week":
        dateRange = {
          $gte: new Date(today.setDate(today.getDate() - 7)),
        };
        break;
      case "month":
        dateRange = {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
        };
        break;
      case "year":
        dateRange = {
          $gte: new Date(today.getFullYear(), 0, 1),
        };
        break;
    }

    const [statusStats, priorityStats, typeStats, costStats, completionRate] =
      await Promise.all([
        MaintenanceTicket.aggregate([
          { $match: { isActive: true, createdAt: dateRange } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        MaintenanceTicket.aggregate([
          { $match: { isActive: true, createdAt: dateRange } },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        MaintenanceTicket.aggregate([
          { $match: { isActive: true, createdAt: dateRange } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        MaintenanceTicket.aggregate([
          {
            $match: {
              isActive: true,
              status: "COMPLETED",
              createdAt: dateRange,
            },
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$costs.totalCost" },
              averageCost: { $avg: "$costs.totalCost" },
              count: { $sum: 1 },
            },
          },
        ]),
        MaintenanceTicket.aggregate([
          { $match: { isActive: true, createdAt: dateRange } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
                },
              },
            },
          },
        ]),
      ]);

    const completionRateData = completionRate[0] || { total: 0, completed: 0 };
    const completionPercentage =
      completionRateData.total > 0
        ? (
            (completionRateData.completed / completionRateData.total) *
            100
          ).toFixed(1)
        : 0;

    return {
      statusStats,
      priorityStats,
      typeStats,
      costStats: costStats[0] || { totalCost: 0, averageCost: 0, count: 0 },
      completionRate: completionPercentage,
    };
  };

  static getRepairSummary = async (queryParams) => {
    const { period = "month" } = queryParams;

    let dateRange = {};
    const today = new Date();

    switch (period) {
      case "week":
        dateRange = {
          $gte: new Date(today.setDate(today.getDate() - 7)),
        };
        break;
      case "month":
        dateRange = {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
        };
        break;
      case "year":
        dateRange = {
          $gte: new Date(today.getFullYear(), 0, 1),
        };
        break;
    }

    const [
      statusStats,
      failureTypeStats,
      severityStats,
      costStats,
      downtimeStats,
      mttr,
    ] = await Promise.all([
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: dateRange } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: dateRange } },
        { $group: { _id: "$failureType", count: { $sum: 1 } } },
      ]),
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: dateRange } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      RepairTicket.aggregate([
        {
          $match: {
            isActive: true,
            status: "COMPLETED",
            reportedDate: dateRange,
          },
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: "$costs.totalCost" },
            averageCost: { $avg: "$costs.totalCost" },
            count: { $sum: 1 },
          },
        },
      ]),
      RepairTicket.aggregate([
        {
          $match: {
            isActive: true,
            status: "COMPLETED",
            reportedDate: dateRange,
          },
        },
        {
          $group: {
            _id: null,
            totalDowntime: { $sum: "$downtime.totalDowntime" },
            averageDowntime: { $avg: "$downtime.totalDowntime" },
            count: { $sum: 1 },
          },
        },
      ]),
      RepairTicket.aggregate([
        {
          $match: {
            isActive: true,
            status: "COMPLETED",
            reportedDate: dateRange,
            actualStartDate: { $exists: true },
            actualEndDate: { $exists: true },
          },
        },
        {
          $addFields: {
            repairTime: {
              $divide: [
                { $subtract: ["$actualEndDate", "$actualStartDate"] },
                1000 * 60 * 60, // Convert to hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageRepairTime: { $avg: "$repairTime" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      statusStats,
      failureTypeStats,
      severityStats,
      costStats: costStats[0] || { totalCost: 0, averageCost: 0, count: 0 },
      downtimeStats: downtimeStats[0] || {
        totalDowntime: 0,
        averageDowntime: 0,
        count: 0,
      },
      mttr: mttr[0]?.averageRepairTime || 0, // Mean Time To Repair
    };
  };

  static getEquipmentStatus = async () => {
    const [
      statusDistribution,
      typeDistribution,
      maintenanceDue,
      operatingHoursStats,
      utilizationRate,
    ] = await Promise.all([
      Equipment.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Equipment.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Equipment.find({
        isActive: true,
        "maintenance.nextMaintenanceDate": { $lte: new Date() },
      })
        .select(
          "equipmentCode name maintenance.nextMaintenanceDate operatingHours"
        )
        .populate("assignedTo", "username")
        .limit(10)
        .sort({ "maintenance.nextMaintenanceDate": 1 }),
      Equipment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalOperatingHours: { $sum: "$operatingHours" },
            averageOperatingHours: { $avg: "$operatingHours" },
            maxOperatingHours: { $max: "$operatingHours" },
            minOperatingHours: { $min: "$operatingHours" },
            count: { $sum: 1 },
          },
        },
      ]),
      Equipment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalEquipments: { $sum: 1 },
            activeEquipments: {
              $sum: {
                $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const utilizationData = utilizationRate[0] || {
      totalEquipments: 0,
      activeEquipments: 0,
    };
    const utilizationPercentage =
      utilizationData.totalEquipments > 0
        ? (
            (utilizationData.activeEquipments /
              utilizationData.totalEquipments) *
            100
          ).toFixed(1)
        : 0;

    return {
      statusDistribution,
      typeDistribution,
      maintenanceDue,
      operatingHoursStats: operatingHoursStats[0] || {
        totalOperatingHours: 0,
        averageOperatingHours: 0,
        maxOperatingHours: 0,
        minOperatingHours: 0,
        count: 0,
      },
      utilizationRate: utilizationPercentage,
    };
  };

  static getMaterialAlerts = async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [lowStockMaterials, expiringMaterials, outOfStockMaterials] =
      await Promise.all([
        Material.find({
          isActive: true,
          $expr: {
            $and: [
              { $lte: ["$currentStock", "$minStockLevel"] },
              { $gt: ["$currentStock", 0] },
            ],
          },
        })
          .select("materialCode name currentStock minStockLevel unit category")
          .limit(10),
        Material.find({
          isActive: true,
          isPerishable: true,
          expiryDate: {
            $exists: true,
            $lte: thirtyDaysFromNow,
            $gte: new Date(),
          },
        })
          .select("materialCode name expiryDate currentStock unit category")
          .sort({ expiryDate: 1 })
          .limit(10),
        Material.find({
          isActive: true,
          currentStock: 0,
        })
          .select("materialCode name unit category")
          .limit(10),
      ]);

    return {
      lowStockMaterials,
      expiringMaterials,
      outOfStockMaterials,
      summary: {
        lowStockCount: lowStockMaterials.length,
        expiringCount: expiringMaterials.length,
        outOfStockCount: outOfStockMaterials.length,
      },
    };
  };

  static getRecentActivities = async (queryParams) => {
    const { limit = 20 } = queryParams;

    const [recentMaintenances, recentRepairs, recentTransactions] =
      await Promise.all([
        MaintenanceTicket.find({ isActive: true })
          .populate("equipment", "equipmentCode name")
          .populate("requestedBy", "username")
          .select(
            "ticketNumber equipment status createdAt requestedBy priority"
          )
          .sort({ createdAt: -1 })
          .limit(Math.ceil(parseInt(limit) / 3)),
        RepairTicket.find({ isActive: true })
          .populate("equipment", "equipmentCode name")
          .populate("requestedBy", "username")
          .select(
            "ticketNumber equipment status reportedDate requestedBy priority failureType"
          )
          .sort({ reportedDate: -1 })
          .limit(Math.ceil(parseInt(limit) / 3)),
        InventoryTransaction.find({ isActive: true })
          .populate("material", "materialCode name")
          .populate("performedBy", "username")
          .select(
            "transactionNumber transactionType quantity material performedBy transactionDate"
          )
          .sort({ transactionDate: -1 })
          .limit(Math.ceil(parseInt(limit) / 3)),
      ]);

    // Kết hợp và sắp xếp theo thời gian
    const activities = [
      ...recentMaintenances.map((item) => ({
        type: "MAINTENANCE",
        id: item._id,
        ticketNumber: item.ticketNumber,
        equipment: item.equipment,
        status: item.status,
        priority: item.priority,
        performedBy: item.requestedBy,
        date: item.createdAt,
      })),
      ...recentRepairs.map((item) => ({
        type: "REPAIR",
        id: item._id,
        ticketNumber: item.ticketNumber,
        equipment: item.equipment,
        status: item.status,
        priority: item.priority,
        failureType: item.failureType,
        performedBy: item.requestedBy,
        date: item.reportedDate,
      })),
      ...recentTransactions.map((item) => ({
        type: "INVENTORY",
        id: item._id,
        transactionNumber: item.transactionNumber,
        transactionType: item.transactionType,
        quantity: item.quantity,
        material: item.material,
        performedBy: item.performedBy,
        date: item.transactionDate,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    return activities;
  };

  static getPerformanceMetrics = async (queryParams) => {
    const { period = "month" } = queryParams;

    let dateRange = {};
    const today = new Date();

    switch (period) {
      case "week":
        dateRange = {
          $gte: new Date(today.setDate(today.getDate() - 7)),
        };
        break;
      case "month":
        dateRange = {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
        };
        break;
      case "year":
        dateRange = {
          $gte: new Date(today.getFullYear(), 0, 1),
        };
        break;
    }

    const [
      equipmentAvailability,
      maintenanceEfficiency,
      repairEfficiency,
      costPerEquipment,
    ] = await Promise.all([
      Equipment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalEquipments: { $sum: 1 },
            availableEquipments: {
              $sum: {
                $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0],
              },
            },
          },
        },
      ]),
      MaintenanceTicket.aggregate([
        { $match: { isActive: true, createdAt: dateRange } },
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            completedTickets: {
              $sum: {
                $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
              },
            },
            averageCompletionTime: {
              $avg: {
                $cond: [
                  { $eq: ["$status", "COMPLETED"] },
                  {
                    $divide: [
                      { $subtract: ["$actualEndDate", "$actualStartDate"] },
                      1000 * 60 * 60 * 24, // Convert to days
                    ],
                  },
                  null,
                ],
              },
            },
          },
        },
      ]),
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: dateRange } },
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            completedTickets: {
              $sum: {
                $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
              },
            },
            averageRepairTime: {
              $avg: {
                $cond: [
                  { $eq: ["$status", "COMPLETED"] },
                  {
                    $divide: [
                      { $subtract: ["$actualEndDate", "$actualStartDate"] },
                      1000 * 60 * 60, // Convert to hours
                    ],
                  },
                  null,
                ],
              },
            },
          },
        },
      ]),
      Equipment.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: "maintenancetickets",
            localField: "_id",
            foreignField: "equipment",
            as: "maintenanceTickets",
          },
        },
        {
          $lookup: {
            from: "repairtickets",
            localField: "_id",
            foreignField: "equipment",
            as: "repairTickets",
          },
        },
        {
          $addFields: {
            totalMaintenanceCost: {
              $sum: "$maintenanceTickets.costs.totalCost",
            },
            totalRepairCost: {
              $sum: "$repairTickets.costs.totalCost",
            },
            totalCost: {
              $add: [
                { $sum: "$maintenanceTickets.costs.totalCost" },
                { $sum: "$repairTickets.costs.totalCost" },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageCostPerEquipment: { $avg: "$totalCost" },
            totalCost: { $sum: "$totalCost" },
            equipmentCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const availabilityData = equipmentAvailability[0] || {
      totalEquipments: 0,
      availableEquipments: 0,
    };
    const maintenanceData = maintenanceEfficiency[0] || {
      totalTickets: 0,
      completedTickets: 0,
      averageCompletionTime: 0,
    };
    const repairData = repairEfficiency[0] || {
      totalTickets: 0,
      completedTickets: 0,
      averageRepairTime: 0,
    };
    const costData = costPerEquipment[0] || {
      averageCostPerEquipment: 0,
      totalCost: 0,
      equipmentCount: 0,
    };

    return {
      equipmentAvailability:
        availabilityData.totalEquipments > 0
          ? (
              (availabilityData.availableEquipments /
                availabilityData.totalEquipments) *
              100
            ).toFixed(1)
          : 0,
      maintenanceCompletionRate:
        maintenanceData.totalTickets > 0
          ? (
              (maintenanceData.completedTickets /
                maintenanceData.totalTickets) *
              100
            ).toFixed(1)
          : 0,
      averageMaintenanceTime: maintenanceData.averageCompletionTime || 0,
      repairCompletionRate:
        repairData.totalTickets > 0
          ? (
              (repairData.completedTickets / repairData.totalTickets) *
              100
            ).toFixed(1)
          : 0,
      averageRepairTime: repairData.averageRepairTime || 0,
      averageCostPerEquipment: costData.averageCostPerEquipment || 0,
      totalMaintenanceCost: costData.totalCost || 0,
    };
  };

  static getFinancialReport = async (queryParams) => {
    const { period = "month", year = new Date().getFullYear() } = queryParams;

    let matchCondition = {};

    if (period === "year") {
      matchCondition = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      };
    } else {
      const currentDate = new Date();
      matchCondition = {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      };
    }

    const [maintenanceCosts, repairCosts, materialCosts, monthlyBreakdown] =
      await Promise.all([
        MaintenanceTicket.aggregate([
          {
            $match: {
              isActive: true,
              status: "COMPLETED",
              createdAt: matchCondition,
            },
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$costs.totalCost" },
              materialCost: { $sum: "$costs.materialCost" },
              laborCost: { $sum: "$costs.laborCost" },
              count: { $sum: 1 },
            },
          },
        ]),
        RepairTicket.aggregate([
          {
            $match: {
              isActive: true,
              status: "COMPLETED",
              reportedDate: matchCondition,
            },
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$costs.totalCost" },
              materialCost: { $sum: "$costs.materialCost" },
              laborCost: { $sum: "$costs.laborCost" },
              externalServiceCost: { $sum: "$costs.externalServiceCost" },
              count: { $sum: 1 },
            },
          },
        ]),
        InventoryTransaction.aggregate([
          {
            $match: {
              isActive: true,
              transactionType: "INBOUND",
              transactionDate: matchCondition,
            },
          },
          {
            $group: {
              _id: null,
              totalValue: { $sum: "$totalValue" },
              count: { $sum: 1 },
            },
          },
        ]),
        MaintenanceTicket.aggregate([
          {
            $match: {
              isActive: true,
              status: "COMPLETED",
              createdAt: matchCondition,
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              maintenanceCost: { $sum: "$costs.totalCost" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    const maintenanceData = maintenanceCosts[0] || {
      totalCost: 0,
      materialCost: 0,
      laborCost: 0,
      count: 0,
    };
    const repairData = repairCosts[0] || {
      totalCost: 0,
      materialCost: 0,
      laborCost: 0,
      externalServiceCost: 0,
      count: 0,
    };
    const materialData = materialCosts[0] || { totalValue: 0, count: 0 };

    return {
      summary: {
        totalMaintenanceCost: maintenanceData.totalCost,
        totalRepairCost: repairData.totalCost,
        totalMaterialPurchase: materialData.totalValue,
        totalCost:
          maintenanceData.totalCost +
          repairData.totalCost +
          materialData.totalValue,
      },
      breakdown: {
        maintenance: {
          total: maintenanceData.totalCost,
          material: maintenanceData.materialCost,
          labor: maintenanceData.laborCost,
          count: maintenanceData.count,
        },
        repair: {
          total: repairData.totalCost,
          material: repairData.materialCost,
          labor: repairData.laborCost,
          externalService: repairData.externalServiceCost,
          count: repairData.count,
        },
        materialPurchase: {
          total: materialData.totalValue,
          count: materialData.count,
        },
      },
      monthlyBreakdown,
    };
  };

  static getTrends = async (queryParams) => {
    const { period = "6months" } = queryParams;

    let monthsBack = 6;
    if (period === "12months") monthsBack = 12;
    if (period === "3months") monthsBack = 3;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const [maintenanceTrends, repairTrends, costTrends] = await Promise.all([
      MaintenanceTicket.aggregate([
        { $match: { isActive: true, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
              },
            },
            totalCost: { $sum: "$costs.totalCost" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$reportedDate" },
              month: { $month: "$reportedDate" },
            },
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
              },
            },
            totalCost: { $sum: "$costs.totalCost" },
            totalDowntime: { $sum: "$downtime.totalDowntime" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      InventoryTransaction.aggregate([
        { $match: { isActive: true, transactionDate: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$transactionDate" },
              month: { $month: "$transactionDate" },
              type: "$transactionType",
            },
            totalValue: { $sum: "$totalValue" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    return {
      maintenanceTrends,
      repairTrends,
      inventoryTrends: costTrends,
    };
  };
  static getProblematicEquipments = async (queryParams) => {
    const { limit = 10, period = "6months" } = queryParams;

    let monthsBack = 6;
    if (period === "12months") monthsBack = 12;
    if (period === "3months") monthsBack = 3;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const [
      frequentRepairEquipments,
      highCostEquipments,
      highDowntimeEquipments,
    ] = await Promise.all([
      RepairTicket.aggregate([
        { $match: { isActive: true, reportedDate: { $gte: startDate } } },
        {
          $group: {
            _id: "$equipment",
            repairCount: { $sum: 1 },
            totalCost: { $sum: "$costs.totalCost" },
            totalDowntime: { $sum: "$downtime.totalDowntime" },
            lastRepairDate: { $max: "$reportedDate" },
            avgSeverity: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$severity", "CRITICAL"] }, then: 4 },
                    { case: { $eq: ["$severity", "MAJOR"] }, then: 3 },
                    { case: { $eq: ["$severity", "MODERATE"] }, then: 2 },
                    { case: { $eq: ["$severity", "MINOR"] }, then: 1 },
                  ],
                  default: 1,
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "equipments",
            localField: "_id",
            foreignField: "_id",
            as: "equipment",
          },
        },
        { $unwind: "$equipment" },
        { $match: { "equipment.isActive": true } },
        { $sort: { repairCount: -1 } },
        { $limit: parseInt(limit) },
      ]),
      RepairTicket.aggregate([
        {
          $match: {
            isActive: true,
            reportedDate: { $gte: startDate },
            status: "COMPLETED",
          },
        },
        {
          $group: {
            _id: "$equipment",
            totalCost: { $sum: "$costs.totalCost" },
            repairCount: { $sum: 1 },
            avgCostPerRepair: { $avg: "$costs.totalCost" },
          },
        },
        {
          $lookup: {
            from: "equipments",
            localField: "_id",
            foreignField: "_id",
            as: "equipment",
          },
        },
        { $unwind: "$equipment" },
        { $match: { "equipment.isActive": true } },
        { $sort: { totalCost: -1 } },
        { $limit: parseInt(limit) },
      ]),
      RepairTicket.aggregate([
        {
          $match: {
            isActive: true,
            reportedDate: { $gte: startDate },
            status: "COMPLETED",
          },
        },
        {
          $group: {
            _id: "$equipment",
            totalDowntime: { $sum: "$downtime.totalDowntime" },
            repairCount: { $sum: 1 },
            avgDowntimePerRepair: { $avg: "$downtime.totalDowntime" },
          },
        },
        {
          $lookup: {
            from: "equipments",
            localField: "_id",
            foreignField: "_id",
            as: "equipment",
          },
        },
        { $unwind: "$equipment" },
        { $match: { "equipment.isActive": true } },
        { $sort: { totalDowntime: -1 } },
        { $limit: parseInt(limit) },
      ]),
    ]);

    return {
      frequentRepairEquipments: frequentRepairEquipments.map((item) => ({
        equipmentId: item._id,
        equipmentCode: item.equipment.equipmentCode,
        equipmentName: item.equipment.name,
        equipmentType: item.equipment.type,
        repairCount: item.repairCount,
        totalCost: item.totalCost || 0,
        totalDowntime: item.totalDowntime || 0,
        lastRepairDate: item.lastRepairDate,
        avgSeverity: item.avgSeverity || 1,
        status: item.equipment.status,
      })),
      highCostEquipments: highCostEquipments.map((item) => ({
        equipmentId: item._id,
        equipmentCode: item.equipment.equipmentCode,
        equipmentName: item.equipment.name,
        equipmentType: item.equipment.type,
        totalCost: item.totalCost || 0,
        repairCount: item.repairCount,
        avgCostPerRepair: item.avgCostPerRepair || 0,
        status: item.equipment.status,
      })),
      highDowntimeEquipments: highDowntimeEquipments.map((item) => ({
        equipmentId: item._id,
        equipmentCode: item.equipment.equipmentCode,
        equipmentName: item.equipment.name,
        equipmentType: item.equipment.type,
        totalDowntime: item.totalDowntime || 0,
        repairCount: item.repairCount,
        avgDowntimePerRepair: item.avgDowntimePerRepair || 0,
        status: item.equipment.status,
      })),
    };
  };
}

module.exports = { DashboardService };
