const { Schema, model } = require("mongoose");

const MATERIAL_DOCUMENT_NAME = "Material";
const MATERIAL_COLLECTION_NAME = "Materials";

const materialSchema = new Schema(
  {
    materialCode: {
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
    category: {
      type: String,
      required: true,
      enum: [
        "ENGINE_OIL",
        "HYDRAULIC_OIL",
        "FILTER",
        "BRAKE_PAD",
        "TIRE",
        "SPARE_PART",
        "LUBRICANT",
        "COOLANT",
        "BELT",
        "BATTERY",
        "OTHER",
      ],
    },
    unit: {
      type: String,
      required: true,
      enum: ["LITER", "PIECE", "KG", "METER", "BOX", "SET", "BOTTLE"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStockLevel: {
      type: Number,
      min: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      name: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    storageLocation: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    barcode: {
      type: String,
      trim: true,
    },
    isPerishable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: MATERIAL_COLLECTION_NAME }
);

// Indexes for optimization
materialSchema.index({ materialCode: 1 }, { unique: true });
materialSchema.index({ category: 1 });
materialSchema.index({ name: "text", description: "text" });
materialSchema.index({ currentStock: 1 });
materialSchema.index({ minStockLevel: 1 });
materialSchema.index({ expiryDate: 1 });
materialSchema.index({ isActive: 1 });

module.exports = {
  Material: model(MATERIAL_DOCUMENT_NAME, materialSchema),
  MATERIAL_DOCUMENT_NAME,
  MATERIAL_COLLECTION_NAME,
};
