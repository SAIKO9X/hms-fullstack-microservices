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

export interface PharmacySaleItem {
  medicineName: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PharmacySale {
  id: number;
  originalPrescriptionId: number;
  patientId: number;
  buyerName: string;
  buyerContact: string;
  saleDate: string;
  totalAmount: number;
  items: PharmacySaleItem[];
}
