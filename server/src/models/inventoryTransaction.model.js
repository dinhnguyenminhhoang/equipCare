const { Schema, model } = require("mongoose");

const INVENTORY_TRANSACTION_DOCUMENT_NAME = "InventoryTransaction";
const INVENTORY_TRANSACTION_COLLECTION_NAME = "InventoryTransactions";

const inventoryTransactionSchema = new Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        "INBOUND", // Nhập kho
        "OUTBOUND", // Xuất kho
        "TRANSFER", // Chuyển kho
        "ADJUSTMENT", // Điều chỉnh
        "RETURN", // Trả hàng
        "DAMAGED", // Hỏng hóc
        "EXPIRED", // Hết hạn
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    relatedTicket: {
      ticketType: {
        type: String,
        enum: ["MAINTENANCE", "REPAIR"],
      },
      ticketId: {
        type: Schema.Types.ObjectId,
        refPath:
          'relatedTicket.ticketType === "MAINTENANCE" ? "MaintenanceTicket" : "RepairTicket"',
      },
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
      invoiceNumber: {
        type: String,
        trim: true,
      },
      deliveryDate: Date,
    },
    warehouse: {
      location: {
        type: String,
        trim: true,
      },
      section: {
        type: String,
        trim: true,
      },
      bin: {
        type: String,
        trim: true,
      },
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    lotNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    qualityStatus: {
      type: String,
      enum: ["GOOD", "DAMAGED", "EXPIRED", "QUARANTINE"],
      default: "GOOD",
    },
    notes: {
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
    isReversed: {
      type: Boolean,
      default: false,
    },
    reversedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reversedDate: {
      type: Date,
    },
    reversalReason: {
      type: String,
      trim: true,
    },
    originalTransaction: {
      type: Schema.Types.ObjectId,
      ref: "InventoryTransaction",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: INVENTORY_TRANSACTION_COLLECTION_NAME }
);

// Indexes for optimization
inventoryTransactionSchema.index({ material: 1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ transactionDate: 1 });
inventoryTransactionSchema.index({ performedBy: 1 });
inventoryTransactionSchema.index({ "relatedTicket.ticketId": 1 });
inventoryTransactionSchema.index({ qualityStatus: 1 });
inventoryTransactionSchema.index({ expiryDate: 1 });
inventoryTransactionSchema.index({ isActive: 1 });

// Compound indexes
inventoryTransactionSchema.index({ material: 1, transactionDate: 1 });
inventoryTransactionSchema.index({ material: 1, transactionType: 1 });
inventoryTransactionSchema.index({ transactionDate: 1, transactionType: 1 });

module.exports = {
  InventoryTransaction: model(
    INVENTORY_TRANSACTION_DOCUMENT_NAME,
    inventoryTransactionSchema
  ),
  INVENTORY_TRANSACTION_DOCUMENT_NAME,
  INVENTORY_TRANSACTION_COLLECTION_NAME,
};
