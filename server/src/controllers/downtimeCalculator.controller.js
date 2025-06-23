"use strict";
class DowntimeCalculatorController {
  static calculateTotalDowntime(actualStartDate, actualEndDate) {
    if (!actualStartDate || !actualEndDate) return 0;

    const startTime = new Date(actualStartDate);
    const endTime = new Date(actualEndDate);

    // Tính hiệu số thời gian (milliseconds -> minutes)
    const downtimeMinutes = (endTime - startTime) / (1000 * 60);

    return Math.max(0, Math.round(downtimeMinutes));
  }

  // Định nghĩa productivity rates cho từng loại thiết bị
  static getEquipmentProductivityRate(equipmentType) {
    const productivityRates = {
      EXCAVATOR: {
        unitsPerHour: 20, // 20 m³ đất/giờ
        valuePerUnit: 50000, // 50k VNĐ/m³
        unit: "m³",
        description: "Khối lượng đất đào",
      },
      CRANE: {
        unitsPerHour: 15, // 15 tấn/giờ
        valuePerUnit: 30000, // 30k VNĐ/tấn
        unit: "tấn",
        description: "Khối lượng hàng nâng",
      },
      BULLDOZER: {
        unitsPerHour: 25, // 25 m³/giờ
        valuePerUnit: 40000, // 40k VNĐ/m³
        unit: "m³",
        description: "Khối lượng đất san",
      },
      LOADER: {
        unitsPerHour: 30, // 30 m³/giờ
        valuePerUnit: 35000, // 35k VNĐ/m³
        unit: "m³",
        description: "Khối lượng vật liệu chuyển",
      },
      GENERATOR: {
        unitsPerHour: 100, // 100 kWh/giờ
        valuePerUnit: 3000, // 3k VNĐ/kWh
        unit: "kWh",
        description: "Điện năng sản xuất",
      },
      COMPRESSOR: {
        unitsPerHour: 50, // 50 m³ khí/giờ
        valuePerUnit: 5000, // 5k VNĐ/m³
        unit: "m³",
        description: "Khí nén sản xuất",
      },
      TRUCK: {
        unitsPerHour: 10, // 10 chuyến/giờ
        valuePerUnit: 200000, // 200k VNĐ/chuyến
        unit: "chuyến",
        description: "Chuyến vận chuyển",
      },
      DEFAULT: {
        unitsPerHour: 10,
        valuePerUnit: 100000, // 100k VNĐ/giờ
        unit: "giờ",
        description: "Giá trị sản xuất chung",
      },
    };

    return productivityRates[equipmentType] || productivityRates["DEFAULT"];
  }

  // Tính thiệt hại sản xuất
  static calculateProductionLoss(downtimeMinutes, equipmentType) {
    const rate = this.getEquipmentProductivityRate(equipmentType);

    // Tính số đơn vị sản xuất bị mất
    const lostUnits = (downtimeMinutes / 60) * rate.unitsPerHour;

    // Tính thiệt hại tiền tệ
    const productionLoss = lostUnits * rate.valuePerUnit;

    return {
      lostUnits: Math.round(lostUnits * 100) / 100, // Làm tròn 2 chữ số thập phân
      productionLoss: Math.round(productionLoss),
      unit: rate.unit,
      description: rate.description,
    };
  }

  // Điều chỉnh downtime theo loại bảo dưỡng
  static getMaintenanceImpactMultiplier(maintenanceType) {
    const multipliers = {
      PREVENTIVE: {
        multiplier: 0.7, // Giảm 30% do có kế hoạch trước
        reason: "Bảo dưỡng định kỳ - có thể lên kế hoạch để giảm thiệt hại",
      },
      SCHEDULED: {
        multiplier: 0.8, // Giảm 20% do có lịch trình
        reason: "Bảo dưỡng theo lịch - ít ảnh hưởng đến sản xuất",
      },
      CORRECTIVE: {
        multiplier: 1.2, // Tăng 20% do đột xuất
        reason: "Sửa chữa khắc phục - ảnh hưởng trung bình đến sản xuất",
      },
      EMERGENCY: {
        multiplier: 1.5, // Tăng 50% do bất ngờ
        reason: "Sửa chữa khẩn cấp - gián đoạn nghiêm trọng sản xuất",
      },
    };

    return (
      multipliers[maintenanceType] || {
        multiplier: 1,
        reason: "Loại bảo dưỡng chung",
      }
    );
  }

  // Tính toán downtime tổng hợp
  static calculateComprehensiveDowntime(
    actualStartDate,
    actualEndDate,
    equipmentType,
    maintenanceType
  ) {
    // Tính downtime cơ bản
    const totalDowntimeMinutes = this.calculateTotalDowntime(
      actualStartDate,
      actualEndDate
    );

    if (totalDowntimeMinutes === 0) {
      return {
        totalDowntime: 0,
        productionLoss: 0,
        adjustedDowntime: 0,
        lostUnits: 0,
        unit: "",
        impactMultiplier: 1,
        impactReason: "",
      };
    }

    // Tính thiệt hại sản xuất
    const productionImpact = this.calculateProductionLoss(
      totalDowntimeMinutes,
      equipmentType
    );

    // Điều chỉnh theo loại bảo dưỡng
    const impactData = this.getMaintenanceImpactMultiplier(maintenanceType);

    const adjustedDowntime = Math.round(
      totalDowntimeMinutes * impactData.multiplier
    );
    const adjustedProductionLoss = Math.round(
      productionImpact.productionLoss * impactData.multiplier
    );
    const adjustedLostUnits =
      Math.round(productionImpact.lostUnits * impactData.multiplier * 100) /
      100;

    return {
      totalDowntime: adjustedDowntime, // Thời gian downtime đã điều chỉnh (phút)
      productionLoss: adjustedProductionLoss, // Thiệt hại sản xuất (VNĐ)
      adjustedDowntime: adjustedDowntime, // Backup field
      lostUnits: adjustedLostUnits, // Số đơn vị sản xuất bị mất
      unit: productionImpact.unit,
      impactMultiplier: impactData.multiplier,
      impactReason: impactData.reason,
      rawDowntime: totalDowntimeMinutes, // Downtime gốc chưa điều chỉnh
      rawProductionLoss: productionImpact.productionLoss, // Thiệt hại gốc chưa điều chỉnh
    };
  }
}
module.exports = DowntimeCalculatorController;
