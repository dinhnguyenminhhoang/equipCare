"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api`, require("./access"));
router.use(`/v1/api`, require("./dashboard"));
router.use(`/v1/api`, require("./equipment"));
router.use(`/v1/api`, require("./maintenanceTicket"));
router.use(`/v1/api`, require("./maintenanceLevel"));
router.use(`/v1/api`, require("./user"));
router.use(`/v1/api`, require("./repairTicket"));
router.use(`/v1/api`, require("./notification"));
router.use(`/v1/api`, require("./material"));

module.exports = router;
