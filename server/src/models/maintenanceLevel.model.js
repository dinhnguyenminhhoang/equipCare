const { Schema, model } = require("mongoose");

const MAINTENANCE_LEVEL_DOCUMENT_NAME = "MaintenanceLevel";
const MAINTENANCE_LEVEL_COLLECTION_NAME = "MaintenanceLevels";

const maintenanceLevelSchema = new Schema(
  {
    levelCode: {
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
      trim: true,
    },
    intervalHours: {
      type: Number,
      required: true,
      enum: [60, 120, 240, 480, 1000, 2000],
    },
    intervalType: {
      type: String,
      enum: ["HOURS", "DAYS", "MONTHS"],
      default: "HOURS",
    },
    equipmentTypes: [
      {
        type: String,
        enum: ["CRANE", "FORKLIFT", "TRACTOR", "TRUCK", "EXCAVATOR", "OTHER"],
      },
    ],
    requiredTasks: [
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
        estimatedDuration: {
          type: Number, // in minutes
          min: 0,
        },
        skillLevel: {
          type: String,
          enum: ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"],
          default: "BASIC",
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    requiredMaterials: [
      {
        material: {
          type: Schema.Types.ObjectId,
          ref: "Material",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        isOptional: {
          type: Boolean,
          default: false,
        },
      },
    ],
    estimatedCost: {
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
      totalCost: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    estimatedDuration: {
      type: Number, // in hours
      min: 0,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    safetyRequirements: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: MAINTENANCE_LEVEL_COLLECTION_NAME }
);

// Indexes for optimization
maintenanceLevelSchema.index({ intervalHours: 1 });
maintenanceLevelSchema.index({ equipmentTypes: 1 });
maintenanceLevelSchema.index({ priority: 1 });
maintenanceLevelSchema.index({ isActive: 1 });

module.exports = {
  MaintenanceLevel: model(
    MAINTENANCE_LEVEL_DOCUMENT_NAME,
    maintenanceLevelSchema
  ),
  MAINTENANCE_LEVEL_DOCUMENT_NAME,
  MAINTENANCE_LEVEL_COLLECTION_NAME,
};
