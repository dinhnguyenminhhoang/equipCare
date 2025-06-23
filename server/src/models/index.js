// models/index.js
// Tập hợp tất cả các models và export chúng

const {
  User,
  USERS_DOCUMENT_NAME,
  USERS_COLLECTION_NAME,
} = require("./user.model");
const {
  Equipment,
  EQUIPMENT_DOCUMENT_NAME,
  EQUIPMENT_COLLECTION_NAME,
} = require("./equipment.model");
const {
  Material,
  MATERIAL_DOCUMENT_NAME,
  MATERIAL_COLLECTION_NAME,
} = require("./material.model");
const {
  MaintenanceLevel,
  MAINTENANCE_LEVEL_DOCUMENT_NAME,
  MAINTENANCE_LEVEL_COLLECTION_NAME,
} = require("./maintenanceLevel.model");
const {
  MaintenanceTicket,
  MAINTENANCE_TICKET_DOCUMENT_NAME,
  MAINTENANCE_TICKET_COLLECTION_NAME,
} = require("./maintenanceTicket.model");
const {
  RepairTicket,
  REPAIR_TICKET_DOCUMENT_NAME,
  REPAIR_TICKET_COLLECTION_NAME,
} = require("./repairTicket.model");
const {
  WorkOrder,
  WORK_ORDER_DOCUMENT_NAME,
  WORK_ORDER_COLLECTION_NAME,
} = require("./workOrder.model");
const {
  InventoryTransaction,
  INVENTORY_TRANSACTION_DOCUMENT_NAME,
  INVENTORY_TRANSACTION_COLLECTION_NAME,
} = require("./inventoryTransaction.model");
const {
  Notification,
  NOTIFICATION_DOCUMENT_NAME,
  NOTIFICATION_COLLECTION_NAME,
} = require("./notification.model");

// Export tất cả models
module.exports = {
  // Models
  User,
  Equipment,
  Material,
  MaintenanceLevel,
  MaintenanceTicket,
  RepairTicket,
  WorkOrder,
  InventoryTransaction,
  Notification,

  // Document Names
  USERS_DOCUMENT_NAME,
  EQUIPMENT_DOCUMENT_NAME,
  MATERIAL_DOCUMENT_NAME,
  MAINTENANCE_LEVEL_DOCUMENT_NAME,
  MAINTENANCE_TICKET_DOCUMENT_NAME,
  REPAIR_TICKET_DOCUMENT_NAME,
  WORK_ORDER_DOCUMENT_NAME,
  INVENTORY_TRANSACTION_DOCUMENT_NAME,
  NOTIFICATION_DOCUMENT_NAME,

  // Collection Names
  USERS_COLLECTION_NAME,
  EQUIPMENT_COLLECTION_NAME,
  MATERIAL_COLLECTION_NAME,
  MAINTENANCE_LEVEL_COLLECTION_NAME,
  MAINTENANCE_TICKET_COLLECTION_NAME,
  REPAIR_TICKET_COLLECTION_NAME,
  WORK_ORDER_COLLECTION_NAME,
  INVENTORY_TRANSACTION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_NAME,
};

// Utility function để lấy model theo tên
const getModel = (modelName) => {
  const models = {
    User,
    Equipment,
    Material,
    MaintenanceLevel,
    MaintenanceTicket,
    RepairTicket,
    WorkOrder,
    InventoryTransaction,
    Notification,
    Settings,
    AuditLog,
  };

  return models[modelName] || null;
};

// Export utility function
module.exports.getModel = getModel;
