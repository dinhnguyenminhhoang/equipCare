"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const { asyncHandler } = require("../helpers/asynchandler");
const maintenanceTicketController = require("../controllers/maintenanceTicket.controller");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/maintenance-tickets",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceTickets)
);
router.get(
  "/maintenance-tickets/statistics",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceStatistics)
);
router.get(
  "/maintenance-tickets/export",
  authentication,
  asyncHandler(maintenanceTicketController.exportMaintenanceReport)
);
router.get(
  "/maintenance-tickets/:id",
  authentication,
  asyncHandler(maintenanceTicketController.getMaintenanceTicketById)
);

// Create and update routes
router.post(
  "/maintenance-tickets",
  authentication,
  asyncHandler(maintenanceTicketController.createMaintenanceTicket)
);
router.put(
  "/maintenance-tickets/:id",
  authentication,
  asyncHandler(maintenanceTicketController.updateMaintenanceTicket)
);
router.delete(
  "/maintenance-tickets/:id",
  authentication,
  asyncHandler(maintenanceTicketController.deleteMaintenanceTicket)
);

// Workflow routes
router.patch(
  "/maintenance-tickets/:id/approve",
  adminAuthentication,
  asyncHandler(maintenanceTicketController.approveMaintenanceTicket)
);
router.patch(
  "/maintenance-tickets/:id/start",
  authentication,
  asyncHandler(maintenanceTicketController.startMaintenance)
);
router.patch(
  "/maintenance-tickets/:id/complete",
  authentication,
  asyncHandler(maintenanceTicketController.completeMaintenance)
);

// Task and material routes
router.patch(
  "/maintenance-tickets/:id/tasks/:taskId",
  authentication,
  asyncHandler(maintenanceTicketController.updateMaintenanceTask)
);
router.post(
  "/maintenance-tickets/:id/materials",
  authentication,
  asyncHandler(maintenanceTicketController.addMaterialToMaintenance)
);

module.exports = router;
