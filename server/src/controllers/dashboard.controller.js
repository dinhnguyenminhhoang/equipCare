"use strict";

const { SuccessResponse } = require("../core/success.response");
const { DashboardService } = require("../services/dashboard.service");

class DashboardController {
  // Tổng quan hệ thống
  getOverview = async (req, res, next) => {
    new SuccessResponse({
      message: "Get dashboard overview successfully!",
      data: await DashboardService.getOverview(),
    }).send(res);
  };

  // Tóm tắt bảo dưỡng
  getMaintenanceSummary = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance summary successfully!",
      data: await DashboardService.getMaintenanceSummary(req.query),
    }).send(res);
  };

  // Tóm tắt sửa chữa
  getRepairSummary = async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair summary successfully!",
      data: await DashboardService.getRepairSummary(req.query),
    }).send(res);
  };

  // Trạng thái thiết bị
  getEquipmentStatus = async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipment status successfully!",
      data: await DashboardService.getEquipmentStatus(),
    }).send(res);
  };

  // Cảnh báo vật tư
  getMaterialAlerts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get material alerts successfully!",
      data: await DashboardService.getMaterialAlerts(),
    }).send(res);
  };

  // Hoạt động gần đây
  getRecentActivities = async (req, res, next) => {
    new SuccessResponse({
      message: "Get recent activities successfully!",
      data: await DashboardService.getRecentActivities(req.query),
    }).send(res);
  };

  // Thống kê hiệu suất
  getPerformanceMetrics = async (req, res, next) => {
    new SuccessResponse({
      message: "Get performance metrics successfully!",
      data: await DashboardService.getPerformanceMetrics(req.query),
    }).send(res);
  };

  // Báo cáo tài chính
  getFinancialReport = async (req, res, next) => {
    new SuccessResponse({
      message: "Get financial report successfully!",
      data: await DashboardService.getFinancialReport(req.query),
    }).send(res);
  };

  // Xu hướng theo thời gian
  getTrends = async (req, res, next) => {
    new SuccessResponse({
      message: "Get trends successfully!",
      data: await DashboardService.getTrends(req.query),
    }).send(res);
  };

  getProblematicEquipments = async (req, res, next) => {
    new SuccessResponse({
      message: "Get problematic equipments successfully!",
      data: await DashboardService.getProblematicEquipments(req.query),
    }).send(res);
  };
}

module.exports = new DashboardController();
