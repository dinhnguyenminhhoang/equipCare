"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const accessController = require("../controller/access.controller");
const { authentication } = require("../auth/authUtils");
const router = express.Router();
// signUp
router.post("/register", asynchandler(accessController.singUp));

//signIn
router.post("/login", asynchandler(accessController.login));
router.post("/forgot-password", asynchandler(accessController.forgotPassword));
router.post(
  "/confirm-account",
  authentication,
  asynchandler(accessController.confirmAccount)
);
router.post(
  "/reset-password",
  authentication,
  asynchandler(accessController.resetPassword)
);

module.exports = router;
