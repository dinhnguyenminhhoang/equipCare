"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const { asyncHandler } = require("../helpers/asynchandler");
const EquipmentService = require("../services/equipment.service");

class EquipmentController {
  // Tạo thiết bị mới
  createEquipment = asyncHandler(async (req, res, next) => {
    new CREATED({
      message: "Equipment created successfully!",
      data: await EquipmentService.createEquipment(req.body),
    }).send(res);
  });

  // Lấy danh sách thiết bị với phân trang và tìm kiếm
  getEquipments = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipments successfully!",
      data: await EquipmentService.getEquipments(req.query),
    }).send(res);
  });

  // Lấy thiết bị theo ID
  getEquipmentById = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipment successfully!",
      data: await EquipmentService.getEquipmentById(req.params.id),
    }).send(res);
  });

  // Cập nhật thiết bị
  updateEquipment = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Equipment updated successfully!",
      data: await EquipmentService.updateEquipment(req.params.id, req.body),
    }).send(res);
  });

  // Xóa thiết bị (soft delete)
  deleteEquipment = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Equipment deleted successfully!",
      data: await EquipmentService.deleteEquipment(req.params.id),
    }).send(res);
  });

  // Cập nhật số giờ hoạt động
  updateOperatingHours = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Operating hours updated successfully!",
      data: await EquipmentService.updateOperatingHours(
        req.params.id,
        req.body.operatingHours
      ),
    }).send(res);
  });

  // Lấy thiết bị cần bảo dưỡng
  getEquipmentsDueForMaintenance = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipments due for maintenance successfully!",
      data: await EquipmentService.getEquipmentsDueForMaintenance(req.query),
    }).send(res);
  });

  // Thống kê thiết bị
  getEquipmentStatistics = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipment statistics successfully!",
      data: await EquipmentService.getEquipmentStatistics(),
    }).send(res);
  });

  // Lấy lịch sử bảo dưỡng của thiết bị
  getMaintenanceHistory = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance history successfully!",
      data: await EquipmentService.getMaintenanceHistory(
        req.params.id,
        req.query
      ),
    }).send(res);
  });

  // Lấy lịch sử sửa chữa của thiết bị
  getRepairHistory = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair history successfully!",
      data: await EquipmentService.getRepairHistory(req.params.id, req.query),
    }).send(res);
  });
}

module.exports = new EquipmentController();
