const { Schema, model } = require("mongoose");

const WORK_ORDER_DOCUMENT_NAME = "WorkOrder";
const WORK_ORDER_COLLECTION_NAME = "WorkOrders";

const workOrderSchema = new Schema(
  {
    workOrderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "INSPECTION",
        "CLEANING",
        "LUBRICATION",
        "ADJUSTMENT",
        "REPLACEMENT",
        "TESTING",
        "CALIBRATION",
        "OVERHAUL",
        "SAFETY_CHECK",
        "OTHER",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["MAINTENANCE", "REPAIR"],
      required: true,
    },
    skillLevel: {
      type: String,
      enum: ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      default: "BASIC",
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    instructions: [
      {
        stepNumber: {
          type: Number,
          required: true,
          min: 1,
        },
        instruction: {
          type: String,
          required: true,
          trim: true,
        },
        safetyNote: {
          type: String,
          trim: true,
        },
        tools: [
          {
            type: String,
            trim: true,
          },
        ],
        estimatedTime: {
          type: Number, // in minutes
          min: 0,
        },
      },
    ],
    requiredTools: [
      {
        toolName: {
          type: String,
          required: true,
          trim: true,
        },
        toolCode: {
          type: String,
          trim: true,
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    requiredSkills: [
      {
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"],
          default: "BASIC",
        },
      },
    ],
    safetyRequirements: [
      {
        requirement: {
          type: String,
          required: true,
          trim: true,
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    applicableEquipmentTypes: [
      {
        type: String,
        enum: ["CRANE", "FORKLIFT", "TRACTOR", "TRUCK", "EXCAVATOR", "OTHER"],
      },
    ],
    frequency: {
      type: String,
      enum: [
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "QUARTERLY",
        "SEMI_ANNUALLY",
        "ANNUALLY",
        "AS_NEEDED",
      ],
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    checklistItems: [
      {
        itemNumber: {
          type: Number,
          required: true,
          min: 1,
        },
        checkItem: {
          type: String,
          required: true,
          trim: true,
        },
        expectedResult: {
          type: String,
          trim: true,
        },
        measurementUnit: {
          type: String,
          trim: true,
        },
        minValue: {
          type: Number,
        },
        maxValue: {
          type: Number,
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    qualityStandards: [
      {
        standard: {
          type: String,
          required: true,
          trim: true,
        },
        specification: {
          type: String,
          trim: true,
        },
        testMethod: {
          type: String,
          trim: true,
        },
      },
    ],
    version: {
      type: String,
      default: "1.0",
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    isStandard: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: WORK_ORDER_COLLECTION_NAME }
);

// Indexes for optimization
workOrderSchema.index({ category: 1 });
workOrderSchema.index({ type: 1 });
workOrderSchema.index({ skillLevel: 1 });
workOrderSchema.index({ applicableEquipmentTypes: 1 });
workOrderSchema.index({ frequency: 1 });
workOrderSchema.index({ priority: 1 });
workOrderSchema.index({ name: "text", description: "text" });
workOrderSchema.index({ isActive: 1 });

// Compound indexes
workOrderSchema.index({ type: 1, category: 1 });
workOrderSchema.index({ applicableEquipmentTypes: 1, type: 1 });

module.exports = {
  WorkOrder: model(WORK_ORDER_DOCUMENT_NAME, workOrderSchema),
  WORK_ORDER_DOCUMENT_NAME,
  WORK_ORDER_COLLECTION_NAME,
};
