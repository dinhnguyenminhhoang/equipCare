"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const MaintenanceLevelService = require("../services/maintenanceLevel.service");

class MaintenanceLevelController {
  createMaintenanceLevel = async (req, res, next) => {
    new CREATED({
      message: "Maintenance level created successfully!",
      data: await MaintenanceLevelService.createMaintenanceLevel(req.body),
    }).send(res);
  };

  getMaintenanceLevels = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance levels successfully!",
      data: await MaintenanceLevelService.getMaintenanceLevels(req.query),
    }).send(res);
  };

  getMaintenanceLevelById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance level successfully!",
      data: await MaintenanceLevelService.getMaintenanceLevelById(
        req.params.id
      ),
    }).send(res);
  };

  updateMaintenanceLevel = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance level updated successfully!",
      data: await MaintenanceLevelService.updateMaintenanceLevel(
        req.params.id,
        req.body
      ),
    }).send(res);
  };

  deleteMaintenanceLevel = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance level deleted successfully!",
      data: await MaintenanceLevelService.deleteMaintenanceLevel(req.params.id),
    }).send(res);
  };
}

module.exports = new MaintenanceLevelController();
