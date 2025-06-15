"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const materialController = require("../controllers/material.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

router.get("/", authentication, asyncHandler(materialController.getMaterials));
router.get(
  "/statistics",
  authentication,
  asyncHandler(materialController.getMaterialStatistics)
);
router.get(
  "/low-stock",
  authentication,
  asyncHandler(materialController.getLowStockMaterials)
);
router.get(
  "/expiring",
  authentication,
  asyncHandler(materialController.getExpiringMaterials)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(materialController.getMaterialById)
);
router.get(
  "/:id/transactions",
  authentication,
  asyncHandler(materialController.getMaterialTransactions)
);

// Admin routes
router.post(
  "/",
  adminAuthentication,
  asyncHandler(materialController.createMaterial)
);
router.put(
  "/:id",
  adminAuthentication,
  asyncHandler(materialController.updateMaterial)
);
router.delete(
  "/:id",
  adminAuthentication,
  asyncHandler(materialController.deleteMaterial)
);
router.patch(
  "/:id/stock",
  authentication,
  asyncHandler(materialController.updateStock)
);

module.exports = router;
