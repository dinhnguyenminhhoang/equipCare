const { Schema, model } = require("mongoose");

const AUDIT_LOG_DOCUMENT_NAME = "AuditLog";
const AUDIT_LOG_COLLECTION_NAME = "AuditLogs";

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "READ",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "APPROVE",
        "REJECT",
        "ASSIGN",
        "COMPLETE",
        "CANCEL",
        "EXPORT",
        "IMPORT",
        "BACKUP",
        "RESTORE",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        "USER",
        "EQUIPMENT",
        "MATERIAL",
        "MAINTENANCE_TICKET",
        "REPAIR_TICKET",
        "WORK_ORDER",
        "INVENTORY_TRANSACTION",
        "NOTIFICATION",
        "SETTINGS",
        "MAINTENANCE_LEVEL",
        "SYSTEM",
      ],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    entityName: {
      type: String,
      trim: true,
    },
    oldValues: {
      type: Schema.Types.Mixed,
    },
    newValues: {
      type: Schema.Types.Mixed,
    },
    changes: [
      {
        field: {
          type: String,
          required: true,
        },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    sessionId: {
      type: String,
      trim: true,
    },
    requestId: {
      type: String,
      trim: true,
    },
    module: {
      type: String,
      trim: true,
    },
    function: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "ERROR"],
      default: "SUCCESS",
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    executionTime: {
      type: Number, // in milliseconds
      min: 0,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    category: {
      type: String,
      enum: [
        "AUTHENTICATION",
        "AUTHORIZATION",
        "DATA_ACCESS",
        "DATA_MODIFICATION",
        "SYSTEM_CONFIGURATION",
        "BUSINESS_PROCESS",
        "SECURITY",
        "PERFORMANCE",
        "ERROR",
      ],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedDate: {
      type: Date,
    },
    retentionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: AUDIT_LOG_COLLECTION_NAME,
    // Tự động xóa các log cũ sau 2 năm
    expireAfterSeconds: 63072000, // 2 years in seconds
  }
);

// Indexes for optimization
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ category: 1 });
auditLogSchema.index({ isArchived: 1 });

// Compound indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1, isArchived: 1 });

// TTL index for automatic deletion of old logs
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

module.exports = {
  AuditLog: model(AUDIT_LOG_DOCUMENT_NAME, auditLogSchema),
  AUDIT_LOG_DOCUMENT_NAME,
  AUDIT_LOG_COLLECTION_NAME,
};
