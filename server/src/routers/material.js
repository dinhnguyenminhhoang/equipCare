"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const materialController = require("../controllers/material.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

router.get(
  "/materials",
  authentication,
  asyncHandler(materialController.getMaterials)
);
router.get(
  "/materials/statistics",
  authentication,
  asyncHandler(materialController.getMaterialStatistics)
);
router.get(
  "/materials/low-stock",
  authentication,
  asyncHandler(materialController.getLowStockMaterials)
);
router.get(
  "/materials/expiring",
  authentication,
  asyncHandler(materialController.getExpiringMaterials)
);
router.get(
  "/materials/:id",
  authentication,
  asyncHandler(materialController.getMaterialById)
);
router.get(
  "/materials/:id/transactions",
  authentication,
  asyncHandler(materialController.getMaterialTransactions)
);

// Admin routes
router.post(
  "/materials",
  adminAuthentication,
  asyncHandler(materialController.createMaterial)
);
router.put(
  "/materials/:id",
  adminAuthentication,
  asyncHandler(materialController.updateMaterial)
);
router.delete(
  "/materials/:id",
  adminAuthentication,
  asyncHandler(materialController.deleteMaterial)
);
router.patch(
  "/materials/:id/stock",
  authentication,
  asyncHandler(materialController.updateStock)
);

module.exports = router;
