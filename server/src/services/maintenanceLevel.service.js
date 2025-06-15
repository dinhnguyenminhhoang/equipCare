"use strict";

const { MaintenanceLevel } = require("../models/maintenanceLevel.model");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { paginate } = require("../utils/paginate");

class MaintenanceLevelService {
  static createMaintenanceLevel = async (payload) => {
    const {
      levelCode,
      name,
      description,
      intervalHours,
      equipmentTypes,
      requiredTasks,
      requiredMaterials,
      estimatedCost,
      estimatedDuration,
      priority,
      safetyRequirements,
    } = payload;

    // Kiểm tra mã cấp bảo dưỡng đã tồn tại
    const existingLevel = await MaintenanceLevel.findOne({ levelCode });
    if (existingLevel) {
      throw new badRequestError("Maintenance level code already exists");
    }

    const maintenanceLevel = await MaintenanceLevel.create({
      levelCode: levelCode.toUpperCase(),
      name,
      description,
      intervalHours,
      equipmentTypes,
      requiredTasks,
      requiredMaterials,
      estimatedCost,
      estimatedDuration,
      priority,
      safetyRequirements,
    });

    return maintenanceLevel;
  };

  static getMaintenanceLevels = async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      intervalHours,
      equipmentType,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filters = { isActive: true };

    if (intervalHours) filters.intervalHours = intervalHours;
    if (equipmentType) filters.equipmentTypes = { $in: [equipmentType] };
    if (priority) filters.priority = priority;

    const searchFields = ["levelCode", "name", "description"];

    const options = {};
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const populate = [
      {
        path: "requiredMaterials.material",
        select: "materialCode name unit unitPrice",
      },
    ];

    return await paginate({
      model: MaintenanceLevel,
      query: filters,
      limit: parseInt(limit),
      page: parseInt(page),
      searchText: search,
      searchFields,
      populate,
      options,
    });
  };

  static getMaintenanceLevelById = async (levelId) => {
    const level = await MaintenanceLevel.findById(levelId)
      .populate(
        "requiredMaterials.material",
        "materialCode name unit unitPrice currentStock"
      )
      .lean();

    if (!level) {
      throw new NotFoundError("Maintenance level not found");
    }

    return level;
  };

  static updateMaintenanceLevel = async (levelId, payload) => {
    const level = await MaintenanceLevel.findById(levelId);
    if (!level) {
      throw new NotFoundError("Maintenance level not found");
    }

    // Kiểm tra mã cấp bảo dưỡng nếu có thay đổi
    if (payload.levelCode && payload.levelCode !== level.levelCode) {
      const existingLevel = await MaintenanceLevel.findOne({
        levelCode: payload.levelCode.toUpperCase(),
        _id: { $ne: levelId },
      });
      if (existingLevel) {
        throw new badRequestError("Maintenance level code already exists");
      }
      payload.levelCode = payload.levelCode.toUpperCase();
    }

    const updatedLevel = await MaintenanceLevel.findByIdAndUpdate(
      levelId,
      { ...payload },
      { new: true, runValidators: true }
    ).populate(
      "requiredMaterials.material",
      "materialCode name unit unitPrice"
    );

    return updatedLevel;
  };

  static deleteMaintenanceLevel = async (levelId) => {
    const level = await MaintenanceLevel.findById(levelId);
    if (!level) {
      throw new NotFoundError("Maintenance level not found");
    }

    await MaintenanceLevel.findByIdAndUpdate(levelId, { isActive: false });
    return { message: "Maintenance level deleted successfully" };
  };
}

module.exports = MaintenanceLevelService;
