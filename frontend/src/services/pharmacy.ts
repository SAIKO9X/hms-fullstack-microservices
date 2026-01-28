import api from "@/config/axios";
import type {
  Medicine,
  MedicineInventory,
  PharmacySale,
} from "@/types/medicine.types";
import type { Page } from "@/types/pagination.types";
import type { PharmacyFinancialStats } from "@/types/stats.types";

export type MedicineFormData = Omit<Medicine, "id" | "createdAt">;

export type InventoryFormData = {
  medicineId: number;
  batchNo: string;
  quantity: number;
  expiryDate: Date;
};

export type DirectSaleFormData = {
  patientId: number;
  items: {
    medicineId: number;
    quantity: number;
  }[];
};

// MEDICINES
export const getAllMedicines = async (
  page = 0,
  size = 10,
): Promise<Page<Medicine>> => {
  const { data } = await api.get(
    `/pharmacy/medicines?page=${page}&size=${size}`,
  );
  return data;
};

export const addMedicine = async (
  medicineData: MedicineFormData,
): Promise<Medicine> => {
  const { data } = await api.post("/pharmacy/medicines", medicineData);
  return data;
};

export const updateMedicine = async (
  id: number,
  medicineData: MedicineFormData,
): Promise<Medicine> => {
  const { data } = await api.put(`/pharmacy/medicines/${id}`, medicineData);
  return data;
};

// INVENTORY
export const getAllInventory = async (
  page = 0,
  size = 10,
): Promise<Page<MedicineInventory>> => {
  const { data } = await api.get(
    `/pharmacy/inventory?page=${page}&size=${size}`,
  );
  return data;
};

export const addInventoryItem = async (
  inventoryData: InventoryFormData,
): Promise<MedicineInventory> => {
  const { data } = await api.post("/pharmacy/inventory", inventoryData);
  return data;
};

export const updateInventoryItem = async (
  id: number,
  inventoryData: InventoryFormData,
): Promise<MedicineInventory> => {
  const { data } = await api.put(`/pharmacy/inventory/${id}`, inventoryData);
  return data;
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await api.delete(`/pharmacy/inventory/${id}`);
};

// SALES
export const getAllSales = async (
  page = 0,
  size = 10,
): Promise<Page<PharmacySale>> => {
  const { data } = await api.get(`/pharmacy/sales?page=${page}&size=${size}`);
  return data;
};

export const createDirectSale = async (
  saleData: DirectSaleFormData,
): Promise<PharmacySale> => {
  const { data } = await api.post("/pharmacy/sales/direct", saleData);
  return data;
};

export const createSaleFromPrescription = async (
  prescriptionId: number,
): Promise<PharmacySale> => {
  const { data } = await api.post(
    "/pharmacy/sales/from-prescription",
    prescriptionId,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return data;
};

// STATISTICS
export const getPharmacyStats = async (): Promise<PharmacyFinancialStats> => {
  const { data } = await api.get("/pharmacy/sales/stats/financial");
  return data;
};
