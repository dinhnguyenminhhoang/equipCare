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
equipmentSchema.methods.calculateNextMaintenance = function () {
  const { operatingHours, maintenance } = this;
  const lastMaintenanceHours = maintenance?.lastMaintenanceHours || 0;
  const intervals = maintenance?.maintenanceIntervals || [
    60, 120, 240, 480, 960,
  ];

  for (let interval of intervals) {
    const nextMilestone =
      Math.ceil((lastMaintenanceHours + interval) / interval) * interval;
    if (nextMilestone > operatingHours) {
      this.maintenance.nextMaintenanceHours = nextMilestone;

      // Ước tính ngày bảo dưỡng (giả sử 8h/ngày làm việc)
      const hoursRemaining = nextMilestone - operatingHours;
      const daysRemaining = Math.ceil(hoursRemaining / 8);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysRemaining);
      this.maintenance.nextMaintenanceDate = nextDate;
      break;
    }
  }
};
equipmentSchema.pre("save", function (next) {
  if (
    this.isModified("operatingHours") ||
    this.isModified("maintenance.lastMaintenanceHours")
  ) {
    this.calculateNextMaintenance();
  }
  next();
});

// Virtual để kiểm tra có cần bảo dưỡng không
equipmentSchema.virtual("isMaintenanceDue").get(function () {
  const { operatingHours, maintenance } = this;
  const lastMaintenanceHours = maintenance?.lastMaintenanceHours || 0;
  const nextMaintenanceHours = maintenance?.nextMaintenanceHours;

  if (lastMaintenanceHours && operatingHours >= nextMaintenanceHours) {
    return true;
  }

  // Kiểm tra theo ngày
  if (maintenance?.nextMaintenanceDate) {
    return new Date() >= new Date(maintenance.nextMaintenanceDate);
  }

  return false;
});

// Virtual để tính mức độ khẩn cấp
equipmentSchema.virtual("maintenanceUrgency").get(function () {
  if (!this.isMaintenanceDue) return "normal";

  const { operatingHours, maintenance } = this;
  const nextMaintenanceHours = maintenance?.nextMaintenanceHours || 0;
  const overdueHours = operatingHours - nextMaintenanceHours;

  if (overdueHours > 48) return "critical";
  if (overdueHours > 24) return "high";
  if (overdueHours > 0) return "medium";

  // Kiểm tra theo ngày
  if (maintenance?.nextMaintenanceDate) {
    const overdueDays = Math.ceil(
      (new Date() - new Date(maintenance.nextMaintenanceDate)) /
        (1000 * 60 * 60 * 24)
    );
    if (overdueDays > 7) return "critical";
    if (overdueDays > 3) return "high";
    if (overdueDays > 0) return "medium";
  }

  return "low";
});

// Indexes for optimization
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ suppliedDate: 1 });
equipmentSchema.index({ operatingHours: 1 });
equipmentSchema.index({ assignedTo: 1 });
equipmentSchema.index({ isActive: 1 });

module.exports = {
  Equipment: model(EQUIPMENT_DOCUMENT_NAME, equipmentSchema),
  EQUIPMENT_DOCUMENT_NAME,
  EQUIPMENT_COLLECTION_NAME,
};
