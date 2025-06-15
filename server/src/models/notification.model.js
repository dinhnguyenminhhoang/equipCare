const { Schema, model } = require("mongoose");

const NOTIFICATION_DOCUMENT_NAME = "Notification";
const NOTIFICATION_COLLECTION_NAME = "Notifications";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "MAINTENANCE_DUE",
        "MAINTENANCE_OVERDUE",
        "REPAIR_REQUEST",
        "TASK_ASSIGNED",
        "TASK_COMPLETED",
        "APPROVAL_REQUIRED",
        "APPROVAL_GRANTED",
        "APPROVAL_REJECTED",
        "STOCK_LOW",
        "STOCK_OUT",
        "MATERIAL_EXPIRED",
        "EQUIPMENT_DOWN",
        "SYSTEM_ALERT",
        "REMINDER",
        "OTHER",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["UNREAD", "READ", "ACKNOWLEDGED", "DISMISSED"],
      default: "UNREAD",
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: [
          "EQUIPMENT",
          "MAINTENANCE_TICKET",
          "REPAIR_TICKET",
          "MATERIAL",
          "USER",
          "WORK_ORDER",
        ],
      },
      entityId: {
        type: Schema.Types.ObjectId,
        refPath:
          'relatedEntity.entityType === "EQUIPMENT" ? "Equipment" : ' +
          'relatedEntity.entityType === "MAINTENANCE_TICKET" ? "MaintenanceTicket" : ' +
          'relatedEntity.entityType === "REPAIR_TICKET" ? "RepairTicket" : ' +
          'relatedEntity.entityType === "MATERIAL" ? "Material" : ' +
          'relatedEntity.entityType === "USER" ? "User" : "WorkOrder"',
      },
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    readDate: {
      type: Date,
    },
    acknowledgedDate: {
      type: Date,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    deliveryMethod: [
      {
        type: String,
        enum: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        default: ["IN_APP"],
      },
    ],
    deliveryStatus: {
      inApp: {
        status: {
          type: String,
          enum: ["PENDING", "DELIVERED", "FAILED"],
          default: "PENDING",
        },
        deliveredAt: Date,
      },
      email: {
        status: {
          type: String,
          enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
        },
        sentAt: Date,
        deliveredAt: Date,
      },
      sms: {
        status: {
          type: String,
          enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
        },
        sentAt: Date,
        deliveredAt: Date,
      },
      push: {
        status: {
          type: String,
          enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
        },
        sentAt: Date,
        deliveredAt: Date,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: NOTIFICATION_COLLECTION_NAME }
);

// Indexes for optimization
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledDate: 1 });
notificationSchema.index({ expiryDate: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ isActive: 1 });

// Compound indexes
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ scheduledDate: 1, status: 1 });

module.exports = {
  Notification: model(NOTIFICATION_DOCUMENT_NAME, notificationSchema),
  NOTIFICATION_DOCUMENT_NAME,
  NOTIFICATION_COLLECTION_NAME,
};
