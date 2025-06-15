const { Schema, model } = require("mongoose");

const REPAIR_TICKET_DOCUMENT_NAME = "RepairTicket";
const REPAIR_TICKET_COLLECTION_NAME = "RepairTickets";

const repairTicketSchema = new Schema(
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
    type: {
      type: String,
      enum: ["BREAKDOWN", "CORRECTIVE", "EMERGENCY", "WARRANTY", "OVERHAUL"],
      default: "CORRECTIVE",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "DIAGNOSED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "ON_HOLD",
      ],
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
    reportedDate: {
      type: Date,
      default: Date.now,
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
    problemDescription: {
      type: String,
      required: true,
      trim: true,
    },
    symptomDetails: {
      type: String,
      trim: true,
    },
    rootCause: {
      type: String,
      trim: true,
    },
    diagnosisDetails: {
      type: String,
      trim: true,
    },
    solutionDescription: {
      type: String,
      trim: true,
    },
    workPerformed: {
      type: String,
      trim: true,
    },
    equipmentHoursAtFailure: {
      type: Number,
      min: 0,
    },
    equipmentHoursAtCompletion: {
      type: Number,
      min: 0,
    },
    failureType: {
      type: String,
      enum: [
        "MECHANICAL",
        "ELECTRICAL",
        "HYDRAULIC",
        "ENGINE",
        "TRANSMISSION",
        "BRAKE_SYSTEM",
        "COOLING_SYSTEM",
        "FUEL_SYSTEM",
        "COMPUTER_SYSTEM",
        "OTHER",
      ],
    },
    severity: {
      type: String,
      enum: ["MINOR", "MODERATE", "MAJOR", "CRITICAL"],
      default: "MODERATE",
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
        isWarrantyItem: {
          type: Boolean,
          default: false,
        },
      },
    ],
    externalServices: [
      {
        serviceName: {
          type: String,
          required: true,
          trim: true,
        },
        provider: {
          type: String,
          trim: true,
        },
        cost: {
          type: Number,
          min: 0,
        },
        description: {
          type: String,
          trim: true,
        },
        serviceDate: Date,
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
      externalServiceCost: {
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
        type: Number, // in hours
        min: 0,
        default: 0,
      },
      productionLoss: {
        type: Number,
        min: 0,
        default: 0,
      },
      impactDescription: {
        type: String,
        trim: true,
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
    preventiveMeasures: [
      {
        measure: {
          type: String,
          required: true,
          trim: true,
        },
        implementationDate: Date,
        responsiblePerson: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["PLANNED", "IN_PROGRESS", "COMPLETED"],
          default: "PLANNED",
        },
      },
    ],
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      trim: true,
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
    isRecurring: {
      type: Boolean,
      default: false,
    },
    relatedTickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "RepairTicket",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: REPAIR_TICKET_COLLECTION_NAME }
);

// Indexes for optimization
repairTicketSchema.index({ ticketNumber: 1 }, { unique: true });
repairTicketSchema.index({ equipment: 1 });
repairTicketSchema.index({ status: 1 });
repairTicketSchema.index({ priority: 1 });
repairTicketSchema.index({ type: 1 });
repairTicketSchema.index({ requestedBy: 1 });
repairTicketSchema.index({ assignedTo: 1 });
repairTicketSchema.index({ reportedDate: 1 });
repairTicketSchema.index({ scheduledDate: 1 });
repairTicketSchema.index({ failureType: 1 });
repairTicketSchema.index({ severity: 1 });
repairTicketSchema.index({ createdAt: 1 });
repairTicketSchema.index({ isActive: 1 });

// Compound indexes
repairTicketSchema.index({ equipment: 1, status: 1 });
repairTicketSchema.index({ assignedTo: 1, status: 1 });
repairTicketSchema.index({ reportedDate: 1, status: 1 });
repairTicketSchema.index({ equipment: 1, failureType: 1 });

module.exports = {
  RepairTicket: model(REPAIR_TICKET_DOCUMENT_NAME, repairTicketSchema),
  REPAIR_TICKET_DOCUMENT_NAME,
  REPAIR_TICKET_COLLECTION_NAME,
};
