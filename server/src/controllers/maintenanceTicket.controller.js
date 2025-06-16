"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const MaintenanceTicketService = require("../services/maintenanceTicket.service");

class MaintenanceTicketController {
  // Tạo phiếu bảo dưỡng mới
  createMaintenanceTicket = async (req, res, next) => {
    new CREATED({
      message: "Maintenance ticket created successfully!",
      data: await MaintenanceTicketService.createMaintenanceTicket(
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Lấy danh sách phiếu bảo dưỡng
  getMaintenanceTickets = async (req, res, next) => {
    console.log("Fetching maintenance tickets with query:", req.query);
    new SuccessResponse({
      message: "Get maintenance tickets successfully!",
      data: await MaintenanceTicketService.getMaintenanceTickets(req.query),
    }).send(res);
  };

  // Lấy phiếu bảo dưỡng theo ID
  getMaintenanceTicketById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance ticket successfully!",
      data: await MaintenanceTicketService.getMaintenanceTicketById(
        req.params.id
      ),
    }).send(res);
  };

  // Cập nhật phiếu bảo dưỡng
  updateMaintenanceTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket updated successfully!",
      data: await MaintenanceTicketService.updateMaintenanceTicket(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Xóa phiếu bảo dưỡng
  deleteMaintenanceTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket deleted successfully!",
      data: await MaintenanceTicketService.deleteMaintenanceTicket(
        req.params.id
      ),
    }).send(res);
  };

  // Phê duyệt phiếu bảo dưỡng
  approveMaintenanceTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance ticket approved successfully!",
      data: await MaintenanceTicketService.approveMaintenanceTicket(
        req.params.id,
        req.user
      ),
    }).send(res);
  };

  // Bắt đầu thực hiện bảo dưỡng
  startMaintenance = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance started successfully!",
      data: await MaintenanceTicketService.startMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Hoàn thành bảo dưỡng
  completeMaintenance = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance completed successfully!",
      data: await MaintenanceTicketService.completeMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Cập nhật task trong phiếu bảo dưỡng
  updateMaintenanceTask = async (req, res, next) => {
    new SuccessResponse({
      message: "Maintenance task updated successfully!",
      data: await MaintenanceTicketService.updateMaintenanceTask(
        req.params.id,
        req.params.taskId,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Thêm vật tư vào phiếu bảo dưỡng
  addMaterialToMaintenance = async (req, res, next) => {
    new SuccessResponse({
      message: "Material added to maintenance successfully!",
      data: await MaintenanceTicketService.addMaterialToMaintenance(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Thống kê phiếu bảo dưỡng
  getMaintenanceStatistics = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance statistics successfully!",
      data: await MaintenanceTicketService.getMaintenanceStatistics(req.query),
    }).send(res);
  };

  // Xuất báo cáo bảo dưỡng
  exportMaintenanceReport = async (req, res, next) => {
    new SuccessResponse({
      message: "Export maintenance report successfully!",
      data: await MaintenanceTicketService.exportMaintenanceReport(req.query),
    }).send(res);
  };
}

module.exports = new MaintenanceTicketController();
