"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const maintenanceTicketController = require("../controllers/maintenanceTicket.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceTickets)
);
router.get(
  "/statistics",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceStatistics)
);
router.get(
  "/export",
  authentication,
  asyncHandler(maintenanceTicketController.exportMaintenanceReport)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceTicketById)
);

// Create and update routes
router.post(
  "/",
  authentication,
  asyncHandler(maintenanceTicketController.createMaintenanceTicket)
);
router.put(
  "/:id",
  authentication,
  asyncHandler(maintenanceTicketController.updateMaintenanceTicket)
);
router.delete(
  "/:id",
  authentication,
  asyncHandler(maintenanceTicketController.deleteMaintenanceTicket)
);

// Workflow routes
router.patch(
  "/:id/approve",
  adminAuthentication,
  asyncHandler(maintenanceTicketController.approveMaintenanceTicket)
);
router.patch(
  "/:id/start",
  authentication,
  asyncHandler(maintenanceTicketController.startMaintenance)
);
router.patch(
  "/:id/complete",
  authentication,
  asyncHandler(maintenanceTicketController.completeMaintenance)
);

// Task and material routes
router.patch(
  "/:id/tasks/:taskId",
  authentication,
  asyncHandler(maintenanceTicketController.updateMaintenanceTask)
);
router.post(
  "/:id/materials",
  authentication,
  asyncHandler(maintenanceTicketController.addMaterialToMaintenance)
);

module.exports = router;
