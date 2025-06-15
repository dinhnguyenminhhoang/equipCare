"use strict";
const express = require("express");
const { authentication } = require("../auth/authUtils");
const accessController = require("../controllers/access.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();
router.post("/register", asyncHandler(accessController.singUp));

router.post("/login", asyncHandler(accessController.login));
router.post("/forgot-password", asyncHandler(accessController.forgotPassword));
router.post(
  "/confirm-account",
  authentication,
  asyncHandler(accessController.confirmAccount)
);
router.post(
  "/reset-password",
  authentication,
  asyncHandler(accessController.resetPassword)
);

module.exports = router;
