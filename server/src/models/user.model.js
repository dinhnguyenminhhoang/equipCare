const { Schema, model } = require("mongoose");

const USERS_DOCUMENT_NAME = "User";
const USERS_COLLECTION_NAME = "Users";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "USER", "TECHNICIAN", "MANAGER"],
      default: ["USER"],
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: USERS_COLLECTION_NAME }
);

// Indexes for optimization
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = {
  User: model(USERS_DOCUMENT_NAME, userSchema),
  USERS_DOCUMENT_NAME,
  USERS_COLLECTION_NAME,
};
