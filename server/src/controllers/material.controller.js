"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const { asyncHandler } = require("../helpers/asynchandler");
const MaterialService = require("../services/meterial.service");

class MaterialController {
  // Tạo vật tư mới
  createMaterial = asyncHandler(async (req, res, next) => {
    new CREATED({
      message: "Material created successfully!",
      data: await MaterialService.createMaterial(req.body),
    }).send(res);
  });

  // Lấy danh sách vật tư
  getMaterials = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get materials successfully!",
      data: await MaterialService.getMaterials(req.query),
    }).send(res);
  });

  // Lấy vật tư theo ID
  getMaterialById = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get material successfully!",
      data: await MaterialService.getMaterialById(req.params.id),
    }).send(res);
  });

  // Cập nhật vật tư
  updateMaterial = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Material updated successfully!",
      data: await MaterialService.updateMaterial(req.params.id, req.body),
    }).send(res);
  });

  // Xóa vật tư
  deleteMaterial = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Material deleted successfully!",
      data: await MaterialService.deleteMaterial(req.params.id),
    }).send(res);
  });

  // Cập nhật tồn kho
  updateStock = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Stock updated successfully!",
      data: await MaterialService.updateStock(req.params.id, req.body),
    }).send(res);
  });

  // Lấy vật tư sắp hết hàng
  getLowStockMaterials = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get low stock materials successfully!",
      data: await MaterialService.getLowStockMaterials(req.query),
    }).send(res);
  });

  // Lấy vật tú sắp hết hạn
  getExpiringMaterials = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get expiring materials successfully!",
      data: await MaterialService.getExpiringMaterials(req.query),
    }).send(res);
  });

  // Thống kê vật tư
  getMaterialStatistics = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get material statistics successfully!",
      data: await MaterialService.getMaterialStatistics(),
    }).send(res);
  });

  // Xuất nhập tồn theo vật tư
  getMaterialTransactions = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get material transactions successfully!",
      data: await MaterialService.getMaterialTransactions(
        req.params.id,
        req.query
      ),
    }).send(res);
  });
}

module.exports = new MaterialController();
