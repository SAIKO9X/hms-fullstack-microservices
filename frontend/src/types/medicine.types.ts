export type MedicineCategory =
  | "ANTIBIOTIC"
  | "ANALGESIC"
  | "ANTIHISTAMINE"
  | "ANTISEPTIC"
  | "VITAMIN"
  | "MINERAL"
  | "HERBAL"
  | "HOMEOPATHIC"
  | "OTHER";

export type MedicineType =
  | "TABLET"
  | "CAPSULE"
  | "SYRUP"
  | "INJECTION"
  | "OINTMENT"
  | "DROPS"
  | "INHALER"
  | "OTHER";

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  category: MedicineCategory;
  type: MedicineType;
  manufacturer: string;
  unitPrice: number;
  totalStock?: number;
  createdAt: string;
}

export interface MedicineInventory {
  id: number;
  medicineId: number;
  medicineName: string;
  batchNo: string;
  quantity: number;
  expiryDate: string;
  addedDate: string;
}
