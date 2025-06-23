const { Schema, model } = require("mongoose");

const MAINTENANCE_TICKET_DOCUMENT_NAME = "MaintenanceTicket";
const MAINTENANCE_TICKET_COLLECTION_NAME = "MaintenanceTickets";

const maintenanceTicketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    equipment: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    maintenanceLevel: {
      type: Schema.Types.ObjectId,
      ref: "MaintenanceLevel",
      required: true,
    },
    type: {
      type: String,
      enum: ["PREVENTIVE", "CORRECTIVE", "EMERGENCY", "SCHEDULED"],
      default: "PREVENTIVE",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD"],
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    scheduledDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    actualStartDate: {
      type: Date,
    },
    actualEndDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    workDescription: {
      type: String,
      trim: true,
    },
    equipmentHoursAtStart: {
      type: Number,
      min: 0,
    },
    equipmentHoursAtEnd: {
      type: Number,
      min: 0,
    },
    tasks: [
      {
        taskCode: {
          type: String,
          required: true,
          trim: true,
        },
        taskName: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"],
          default: "PENDING",
        },
        assignedTo: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        startTime: Date,
        endTime: Date,
        actualDuration: Number, // in minutes
        notes: String,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    materialsUsed: [
      {
        material: {
          type: Schema.Types.ObjectId,
          ref: "Material",
          required: true,
        },
        quantityUsed: {
          type: Number,
          required: true,
          min: 0,
        },
        unitPrice: {
          type: Number,
          min: 0,
        },
        totalCost: {
          type: Number,
          min: 0,
        },
        issuedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        issuedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    costs: {
      laborCost: {
        type: Number,
        min: 0,
        default: 0,
      },
      materialCost: {
        type: Number,
        min: 0,
        default: 0,
      },
      overheadCost: {
        type: Number,
        min: 0,
        default: 0,
      },
      totalCost: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    downtime: {
      totalDowntime: {
        type: Number,
        min: 0,
        default: 0,
      },
      productionLoss: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    quality: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: {
        type: String,
        trim: true,
      },
      ratedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      ratedDate: Date,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completionNotes: {
      type: String,
      trim: true,
    },
    nextMaintenanceDue: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: MAINTENANCE_TICKET_COLLECTION_NAME }
);

// Indexes for optimization
maintenanceTicketSchema.index({ equipment: 1 });
maintenanceTicketSchema.index({ status: 1 });
maintenanceTicketSchema.index({ priority: 1 });
maintenanceTicketSchema.index({ type: 1 });
maintenanceTicketSchema.index({ requestedBy: 1 });
maintenanceTicketSchema.index({ assignedTo: 1 });
maintenanceTicketSchema.index({ scheduledDate: 1 });
maintenanceTicketSchema.index({ startDate: 1 });
maintenanceTicketSchema.index({ endDate: 1 });
maintenanceTicketSchema.index({ isActive: 1 });

// Compound indexes
maintenanceTicketSchema.index({ equipment: 1, status: 1 });
maintenanceTicketSchema.index({ assignedTo: 1, status: 1 });
maintenanceTicketSchema.index({ scheduledDate: 1, status: 1 });

module.exports = {
  MaintenanceTicket: model(
    MAINTENANCE_TICKET_DOCUMENT_NAME,
    maintenanceTicketSchema
  ),
  MAINTENANCE_TICKET_DOCUMENT_NAME,
  MAINTENANCE_TICKET_COLLECTION_NAME,
};
