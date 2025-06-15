"use strict";

const { Material } = require("../models/material.model");
const {
  InventoryTransaction,
} = require("../models/inventoryTransaction.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");

class MaterialService {
  static createMaterial = async (payload) => {
    const {
      materialCode,
      name,
      description,
      category,
      unit,
      unitPrice,
      minStockLevel,
      maxStockLevel,
      currentStock = 0,
      supplier,
      storageLocation,
      expiryDate,
      barcode,
      isPerishable = false,
    } = payload;

    // Kiểm tra mã vật tư đã tồn tại
    const existingMaterial = await Material.findOne({ materialCode });
    if (existingMaterial) {
      throw new badRequestError("Material code already exists");
    }

    const material = await Material.create({
      materialCode: materialCode.toUpperCase(),
      name,
      description,
      category,
      unit,
      unitPrice,
      minStockLevel,
      maxStockLevel,
      currentStock,
      supplier,
      storageLocation,
      expiryDate,
      barcode,
      isPerishable,
    });

    return material;
  };

  static getMaterials = async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      unit,
      lowStock = false,
      expiring = false,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = { isActive: true };

    if (category) filters.category = category;
    if (unit) filters.unit = unit;

    // Lọc vật tư sắp hết hàng
    if (lowStock === "true") {
      filters.$expr = {
        $lte: ["$currentStock", "$minStockLevel"],
      };
    }

    // Lọc vật tư sắp hết hạn (trong vòng 30 ngày)
    if (expiring === "true") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filters.expiryDate = {
        $exists: true,
        $lte: thirtyDaysFromNow,
        $gte: new Date(),
      };
    }

    const searchFields = ["materialCode", "name", "description", "barcode"];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    return await paginate({
      model: Material,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      options,
    });
  };

  static getMaterialById = async (materialId) => {
    const material = await Material.findById(materialId).lean();

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    return material;
  };

  static updateMaterial = async (materialId, payload) => {
    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    // Kiểm tra mã vật tư nếu có thay đổi
    if (
      payload.materialCode &&
      payload.materialCode !== material.materialCode
    ) {
      const existingMaterial = await Material.findOne({
        materialCode: payload.materialCode.toUpperCase(),
        _id: { $ne: materialId },
      });
      if (existingMaterial) {
        throw new badRequestError("Material code already exists");
      }
      payload.materialCode = payload.materialCode.toUpperCase();
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
      materialId,
      { ...payload },
      { new: true, runValidators: true }
    );

    return updatedMaterial;
  };

  static deleteMaterial = async (materialId) => {
    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    await Material.findByIdAndUpdate(materialId, { isActive: false });
    return { message: "Material deleted successfully" };
  };

  static updateStock = async (materialId, payload) => {
    const { quantity, type, reason, performedBy } = payload;

    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    const previousStock = material.currentStock;
    let newStock;

    if (type === "INCREASE") {
      newStock = previousStock + quantity;
    } else if (type === "DECREASE") {
      if (previousStock < quantity) {
        throw new badRequestError("Insufficient stock");
      }
      newStock = previousStock - quantity;
    } else {
      throw new badRequestError("Invalid transaction type");
    }

    // Cập nhật tồn kho
    await Material.findByIdAndUpdate(materialId, { currentStock: newStock });

    // Tạo transaction log
    const transactionNumber = await this.generateTransactionNumber();
    await InventoryTransaction.create({
      transactionNumber,
      material: materialId,
      transactionType: type === "INCREASE" ? "INBOUND" : "OUTBOUND",
      quantity: type === "INCREASE" ? quantity : -quantity,
      unitPrice: material.unitPrice,
      totalValue: material.unitPrice * Math.abs(quantity),
      previousStock,
      newStock,
      performedBy,
      notes: reason,
    });

    return {
      materialId,
      previousStock,
      newStock,
      quantity: type === "INCREASE" ? quantity : -quantity,
    };
  };

  static getLowStockMaterials = async (queryParams) => {
    const { page = 1, limit = 10, category } = queryParams;

    const filters = {
      isActive: true,
      $expr: {
        $lte: ["$currentStock", "$minStockLevel"],
      },
    };

    if (category) filters.category = category;

    return await paginate({
      model: Material,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      options: { sort: { currentStock: 1 } },
    });
  };

  static getExpiringMaterials = async (queryParams) => {
    const { page = 1, limit = 10, days = 30 } = queryParams;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(days));

    const filters = {
      isActive: true,
      isPerishable: true,
      expiryDate: {
        $exists: true,
        $lte: targetDate,
        $gte: new Date(),
      },
    };

    return await paginate({
      model: Material,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      options: { sort: { expiryDate: 1 } },
    });
  };

  static getMaterialStatistics = async () => {
    const totalMaterials = await Material.countDocuments({ isActive: true });

    const categoryStats = await Material.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const unitStats = await Material.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$unit", count: { $sum: 1 } } },
    ]);

    // Vật tư sắp hết hàng
    const lowStockCount = await Material.countDocuments({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    });

    // Vật tư sắp hết hạn (30 ngày)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCount = await Material.countDocuments({
      isActive: true,
      isPerishable: true,
      expiryDate: {
        $exists: true,
        $lte: thirtyDaysFromNow,
        $gte: new Date(),
      },
    });

    // Tổng giá trị tồn kho
    const totalStockValue = await Material.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$currentStock", "$unitPrice"] },
          },
        },
      },
    ]);

    return {
      totalMaterials,
      categoryStats,
      unitStats,
      lowStockCount,
      expiringCount,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
    };
  };

  static getMaterialTransactions = async (materialId, queryParams) => {
    const {
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      transactionType,
    } = queryParams;

    const material = await Material.findById(materialId);
    if (!material) {
      throw new NotFoundError("Material not found");
    }

    const filters = { material: materialId };

    if (transactionType) filters.transactionType = transactionType;
    if (fromDate || toDate) {
      filters.transactionDate = {};
      if (fromDate) filters.transactionDate.$gte = new Date(fromDate);
      if (toDate) filters.transactionDate.$lte = new Date(toDate);
    }

    const populate = [
      { path: "performedBy", select: "username email" },
      { path: "approvedBy", select: "username email" },
    ];

    return await paginate({
      model: InventoryTransaction,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      populate,
      options: { sort: { transactionDate: -1 } },
    });
  };

  // Helper method để tạo số transaction
  static generateTransactionNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const prefix = `TXN${year}${month}${day}`;

    const lastTransaction = await InventoryTransaction.findOne(
      { transactionNumber: { $regex: `^${prefix}` } },
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

    return `${prefix}${String(sequence).padStart(4, "0")}`;
  };
}

module.exports = MaterialService;
