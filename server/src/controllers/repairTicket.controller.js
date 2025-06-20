"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const RepairTicketService = require("../services/repairTicket.service");

class RepairTicketController {
  // Tạo phiếu sửa chữa mới
  createRepairTicket = async (req, res, next) => {
    new CREATED({
      message: "Repair ticket created successfully!",
      data: await RepairTicketService.createRepairTicket(req.body, req.user),
    }).send(res);
  };

  // Lấy danh sách phiếu sửa chữa
  getRepairTickets = async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair tickets successfully!",
      data: await RepairTicketService.getRepairTickets(req.query),
    }).send(res);
  };

  // Lấy phiếu sửa chữa theo ID
  getRepairTicketById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair ticket successfully!",
      data: await RepairTicketService.getRepairTicketById(req.params.id),
    }).send(res);
  };

  // Cập nhật phiếu sửa chữa
  updateRepairTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair ticket updated successfully!",
      data: await RepairTicketService.updateRepairTicket(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Xóa phiếu sửa chữa
  deleteRepairTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair ticket deleted successfully!",
      data: await RepairTicketService.deleteRepairTicket(req.params.id),
    }).send(res);
  };

  // Phê duyệt phiếu sửa chữa
  approveRepairTicket = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair ticket approved successfully!",
      data: await RepairTicketService.approveRepairTicket(
        req.params.id,
        req.user
      ),
    }).send(res);
  };

  // Chẩn đoán sự cố
  diagnoseIssue = async (req, res, next) => {
    new SuccessResponse({
      message: "Issue diagnosed successfully!",
      data: await RepairTicketService.diagnoseIssue(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Bắt đầu sửa chữa
  startRepair = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair started successfully!",
      data: await RepairTicketService.startRepair(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Hoàn thành sửa chữa
  completeRepair = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair completed successfully!",
      data: await RepairTicketService.completeRepair(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Cập nhật task trong phiếu sửa chữa
  updateRepairTask = async (req, res, next) => {
    new SuccessResponse({
      message: "Repair task updated successfully!",
      data: await RepairTicketService.updateRepairTask(
        req.params.id,
        req.params.taskId,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Thêm vật tư vào phiếu sửa chữa
  addMaterialToRepair = async (req, res, next) => {
    new SuccessResponse({
      message: "Material added to repair successfully!",
      data: await RepairTicketService.addMaterialToRepair(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Thêm dịch vụ bên ngoài
  addExternalService = async (req, res, next) => {
    new SuccessResponse({
      message: "External service added successfully!",
      data: await RepairTicketService.addExternalService(
        req.params.id,
        req.body,
        req.user
      ),
    }).send(res);
  };

  // Thống kê phiếu sửa chữa
  getRepairStatistics = async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair statistics successfully!",
      data: await RepairTicketService.getRepairStatistics(req.query),
    }).send(res);
  };

  // Xuất báo cáo sửa chữa
  exportRepairReport = async (req, res, next) => {
    new SuccessResponse({
      message: "Export repair report successfully!",
      data: await RepairTicketService.exportRepairReport(req.query),
    }).send(res);
  };

  // Lấy phân tích nguyên nhân hỏng hóc
  getFailureAnalysis = async (req, res, next) => {
    new SuccessResponse({
      message: "Get failure analysis successfully!",
      data: await RepairTicketService.getFailureAnalysis(req.query),
    }).send(res);
  };
}

module.exports = new RepairTicketController();
