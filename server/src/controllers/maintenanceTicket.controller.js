"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const MaintenanceTicketService = require("../services/maintenanceTicket.service");
const { asyncHandler } = require("../helpers/asynchandler");

class MaintenanceTicketController {
  // Tạo phiếu bảo dưỡng mới
  createMaintenanceTicket = asyncHandler(async (req, res, next) => {
    new CREATED({
      message: "Maintenance ticket created successfully!",
      data: await MaintenanceTicketService.createMaintenanceTicket(
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Lấy danh sách phiếu bảo dưỡng
  getMaintenanceTickets = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance tickets successfully!",
      data: await MaintenanceTicketService.getMaintenanceTickets(req.query),
    }).send(res);
  });

  // Lấy phiếu bảo dưỡng theo ID
  getMaintenanceTicketById = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance ticket successfully!",
      data: await MaintenanceTicketService.getMaintenanceTicketById(
        req.params.id
      ),
    }).send(res);
  });

  // Cập nhật phiếu bảo dưỡng
  updateMaintenanceTicket = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket updated successfully!",
      data: await MaintenanceTicketService.updateMaintenanceTicket(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Xóa phiếu bảo dưỡng
  deleteMaintenanceTicket = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket deleted successfully!",
      data: await MaintenanceTicketService.deleteMaintenanceTicket(
        req.params.id
      ),
    }).send(res);
  });

  // Phê duyệt phiếu bảo dưỡng
  approveMaintenanceTicket = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket approved successfully!",
      data: await MaintenanceTicketService.approveMaintenanceTicket(
        req.params.id,
        req.user
      ),
    }).send(res);
  });

  // Bắt đầu thực hiện bảo dưỡng
  startMaintenance = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance started successfully!",
      data: await MaintenanceTicketService.startMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Hoàn thành bảo dưỡng
  completeMaintenance = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance completed successfully!",
      data: await MaintenanceTicketService.completeMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Cập nhật task trong phiếu bảo dưỡng
  updateMaintenanceTask = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance task updated successfully!",
      data: await MaintenanceTicketService.updateMaintenanceTask(
        req.params.id,
        req.params.taskId,
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Thêm vật tư vào phiếu bảo dưỡng
  addMaterialToMaintenance = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Material added to maintenance successfully!",
      data: await MaintenanceTicketService.addMaterialToMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  });

  // Thống kê phiếu bảo dưỡng
  getMaintenanceStatistics = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance statistics successfully!",
      data: await MaintenanceTicketService.getMaintenanceStatistics(req.query),
    }).send(res);
  });

  // Xuất báo cáo bảo dưỡng
  exportMaintenanceReport = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Export maintenance report successfully!",
      data: await MaintenanceTicketService.exportMaintenanceReport(req.query),
    }).send(res);
  });
}

module.exports = new MaintenanceTicketController();
