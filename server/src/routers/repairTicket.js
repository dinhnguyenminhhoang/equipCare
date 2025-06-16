"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const repairTicketController = require("../controllers/repairTicket.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/repair-tickets",
  authentication,
  asyncHandler(repairTicketController.getRepairTickets)
);
router.get(
  "/repair-tickets/statistics",
  authentication,
  asyncHandler(repairTicketController.getRepairStatistics)
);
router.get(
  "/repair-tickets/export",
  authentication,
  asyncHandler(repairTicketController.exportRepairReport)
);
router.get(
  "/repair-tickets/failure-analysis",
  authentication,
  asyncHandler(repairTicketController.getFailureAnalysis)
);
router.get(
  "/repair-tickets/:id",
  authentication,
  asyncHandler(repairTicketController.getRepairTicketById)
);

// Create and update routes
router.post(
  "/repair-tickets",
  authentication,
  asyncHandler(repairTicketController.createRepairTicket)
);
router.put(
  "/repair-tickets/:id",
  authentication,
  asyncHandler(repairTicketController.updateRepairTicket)
);
router.delete(
  "/repair-tickets/:id",
  authentication,
  asyncHandler(repairTicketController.deleteRepairTicket)
);

// Workflow routes
router.patch(
  "/repair-tickets/:id/approve",
  adminAuthentication,
  asyncHandler(repairTicketController.approveRepairTicket)
);
router.patch(
  "/repair-tickets/:id/diagnose",
  authentication,
  asyncHandler(repairTicketController.diagnoseIssue)
);
router.patch(
  "/repair-tickets/:id/start",
  authentication,
  asyncHandler(repairTicketController.startRepair)
);
router.patch(
  "/repair-tickets/:id/complete",
  authentication,
  asyncHandler(repairTicketController.completeRepair)
);

// Task, material and service routes
router.patch(
  "/repair-tickets/:id/tasks/:taskId",
  authentication,
  asyncHandler(repairTicketController.updateRepairTask)
);
router.post(
  "/repair-tickets/:id/materials",
  authentication,
  asyncHandler(repairTicketController.addMaterialToRepair)
);
router.post(
  "/repair-tickets/:id/external-services",
  authentication,
  asyncHandler(repairTicketController.addExternalService)
);

module.exports = router;
