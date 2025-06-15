"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const repairTicketController = require("../controllers/repairTicket.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/",
  authentication,
  asyncHandler(repairTicketController.getRepairTickets)
);
router.get(
  "/statistics",
  authentication,
  asyncHandler(repairTicketController.getRepairStatistics)
);
router.get(
  "/export",
  authentication,
  asyncHandler(repairTicketController.exportRepairReport)
);
router.get(
  "/failure-analysis",
  authentication,
  asyncHandler(repairTicketController.getFailureAnalysis)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(repairTicketController.getRepairTicketById)
);

// Create and update routes
router.post(
  "/",
  authentication,
  asyncHandler(repairTicketController.createRepairTicket)
);
router.put(
  "/:id",
  authentication,
  asyncHandler(repairTicketController.updateRepairTicket)
);
router.delete(
  "/:id",
  authentication,
  asyncHandler(repairTicketController.deleteRepairTicket)
);

// Workflow routes
router.patch(
  "/:id/approve",
  adminAuthentication,
  asyncHandler(repairTicketController.approveRepairTicket)
);
router.patch(
  "/:id/diagnose",
  authentication,
  asyncHandler(repairTicketController.diagnoseIssue)
);
router.patch(
  "/:id/start",
  authentication,
  asyncHandler(repairTicketController.startRepair)
);
router.patch(
  "/:id/complete",
  authentication,
  asyncHandler(repairTicketController.completeRepair)
);

// Task, material and service routes
router.patch(
  "/:id/tasks/:taskId",
  authentication,
  asyncHandler(repairTicketController.updateRepairTask)
);
router.post(
  "/:id/materials",
  authentication,
  asyncHandler(repairTicketController.addMaterialToRepair)
);
router.post(
  "/:id/external-services",
  authentication,
  asyncHandler(repairTicketController.addExternalService)
);

module.exports = router;
