"use strict";

const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const uploadController = require("../controller/upload.controller");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer để lưu tệp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Sử dụng đường dẫn tuyệt đối
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Tên file được lưu
  },
});

const upload = multer({ storage: storage });

// Serve static files từ thư mục uploads
router.use("/uploads", express.static(uploadsDir));

// Endpoint upload file
router.post(
  "/upload",
  adminAuthentication, // Xác thực trước
  upload.array("file", 10), // Cho phép upload tối đa 10 file
  asynchandler(uploadController.uploadProduct)
);

module.exports = router;
