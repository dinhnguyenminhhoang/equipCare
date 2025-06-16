"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const { asyncHandler } = require("../helpers/asynchandler");
const equipmentController = require("../controllers/equipment.controller");
const router = express.Router();
router.get(
  "/equipment",
  authentication,
  asyncHandler(equipmentController.getEquipments)
);
router.get(
  "/equipment/statistics",
  authentication,
  asyncHandler(equipmentController.getEquipmentStatistics)
);
router.get(
  "/equipment/due-maintenance",
  authentication,
  asyncHandler(equipmentController.getEquipmentsDueForMaintenance)
);
router.get(
  "/equipment/:id",
  authentication,
  asyncHandler(equipmentController.getEquipmentById)
);
router.get(
  "/equipment/:id/maintenance-history",
  authentication,
  asyncHandler(equipmentController.getMaintenanceHistory)
);
router.get(
  "/equipment/:id/repair-history",
  authentication,
  asyncHandler(equipmentController.getRepairHistory)
);

// Admin routes
router.post(
  "/equipment",
  adminAuthentication,
  asyncHandler(equipmentController.createEquipment)
);
router.put(
  "/equipment/:id",
  adminAuthentication,
  asyncHandler(equipmentController.updateEquipment)
);
router.delete(
  "/equipment/:id",
  adminAuthentication,
  asyncHandler(equipmentController.deleteEquipment)
);
router.patch(
  "/equipment/:id/operating-hours",
  authentication,
  asyncHandler(equipmentController.updateOperatingHours)
);

module.exports = router;
