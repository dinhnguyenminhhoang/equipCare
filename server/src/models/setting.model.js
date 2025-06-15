const { Schema, model } = require("mongoose");

const SETTINGS_DOCUMENT_NAME = "Settings";
const SETTINGS_COLLECTION_NAME = "Settings";

const settingsSchema = new Schema(
  {
    key: {
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
      enum: [
        "SYSTEM",
        "MAINTENANCE",
        "REPAIR",
        "INVENTORY",
        "NOTIFICATION",
        "SECURITY",
        "BACKUP",
        "REPORT",
        "EMAIL",
        "SMS",
        "GENERAL",
      ],
      required: true,
    },
    dataType: {
      type: String,
      enum: ["STRING", "NUMBER", "BOOLEAN", "DATE", "JSON", "ARRAY"],
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    defaultValue: {
      type: Schema.Types.Mixed,
    },
    validationRules: {
      required: {
        type: Boolean,
        default: false,
      },
      minValue: Number,
      maxValue: Number,
      minLength: Number,
      maxLength: Number,
      pattern: String,
      allowedValues: [Schema.Types.Mixed],
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    requiresRestart: {
      type: Boolean,
      default: false,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedDate: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      default: "1.0",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: SETTINGS_COLLECTION_NAME }
);

// Indexes for optimization
settingsSchema.index({ key: 1 }, { unique: true });
settingsSchema.index({ category: 1 });
settingsSchema.index({ isPublic: 1 });
settingsSchema.index({ isActive: 1 });

module.exports = {
  Settings: model(SETTINGS_DOCUMENT_NAME, settingsSchema),
  SETTINGS_DOCUMENT_NAME,
  SETTINGS_COLLECTION_NAME,
};
