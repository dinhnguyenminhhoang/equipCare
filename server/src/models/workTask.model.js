const WORK_TASK_DOCUMENT_NAME = "WorkTask";
const WORK_TASK_COLLECTION_NAME = "WorkTasks";

const workTaskSchema = new Schema(
  {
    taskCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    taskType: {
      type: String,
      enum: ["maintenance", "repair"],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    estimatedDuration: {
      type: Number, // in hours
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      Material: model(MATERIAL_DOCUMENT_NAME, materialSchema),
      MaintenanceLevel: model(
        MAINTENANCE_LEVEL_DOCUMENT_NAME,
        maintenanceLevelSchema
      ),
      WorkTask: model(WORK_TASK_DOCUMENT_NAME, workTaskSchema),
      MaintenanceTicket: model(
        MAINTENANCE_TICKET_DOCUMENT_NAME,
        maintenanceTicketSchema
      ),
      RepairTicket: model(REPAIR_TICKET_DOCUMENT_NAME, repairTicketSchema),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: WORK_TASK_COLLECTION_NAME }
);
module.exports = {
  WorkTask: model(WORK_TASK_DOCUMENT_NAME, workTaskSchema),
};
