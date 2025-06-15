const { Schema, model } = require("mongoose");

const EQUIPMENT_DOCUMENT_NAME = "Equipment";
const EQUIPMENT_COLLECTION_NAME = "Equipments";

const equipmentSchema = new Schema(
  {
    equipmentCode: {
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
    type: {
      type: String,
      required: true,
      enum: ["CRANE", "FORKLIFT", "TRACTOR", "TRUCK", "EXCAVATOR", "OTHER"],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    suppliedDate: {
      type: Date,
      required: true,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    currentValue: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "MAINTENANCE", "REPAIR", "INACTIVE", "SCRAPPED"],
      default: "ACTIVE",
    },
    operatingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    specifications: {
      capacity: {
        type: Number,
        min: 0,
      },
      fuelType: {
        type: String,
        enum: ["DIESEL", "ELECTRIC", "GASOLINE", "HYBRID"],
      },
      enginePower: {
        type: Number,
        min: 0,
      },
      maxLiftHeight: {
        type: Number,
        min: 0,
      },
    },
    maintenance: {
      lastMaintenanceDate: Date,
      nextMaintenanceDate: Date,
      maintenanceInterval60h: {
        type: Boolean,
        default: true,
      },
      maintenanceInterval120h: {
        type: Boolean,
        default: true,
      },
    },
    warrantyInfo: {
      warrantyStartDate: Date,
      warrantyEndDate: Date,
      warrantyProvider: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: EQUIPMENT_COLLECTION_NAME }
);

// Indexes for optimization
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ suppliedDate: 1 });
equipmentSchema.index({ operatingHours: 1 });
equipmentSchema.index({ "maintenance.nextMaintenanceDate": 1 });
equipmentSchema.index({ assignedTo: 1 });
equipmentSchema.index({ isActive: 1 });

module.exports = {
  Equipment: model(EQUIPMENT_DOCUMENT_NAME, equipmentSchema),
  EQUIPMENT_DOCUMENT_NAME,
  EQUIPMENT_COLLECTION_NAME,
};
