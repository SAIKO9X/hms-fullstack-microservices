import api from "@/lib/interceptor/AxiosInterceptor";
import type {
  Medicine,
  MedicineInventory,
  PharmacySale,
} from "@/types/medicine.types";

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

// Buscar todos os medicamentos
export const getAllMedicines = async (): Promise<Medicine[]> => {
  const { data } = await api.get("/pharmacy/medicines");
  return data;
};

// Adicionar um novo medicamento
export const addMedicine = async (
  medicineData: MedicineFormData
): Promise<Medicine> => {
  const { data } = await api.post("/pharmacy/medicines", medicineData);
  return data;
};

// Atualizar um medicamento existente
export const updateMedicine = async (
  id: number,
  medicineData: MedicineFormData
): Promise<Medicine> => {
  const { data } = await api.put(`/pharmacy/medicines/${id}`, medicineData);
  return data;
};

// Buscar todos os itens do inventário
export const getAllInventory = async (): Promise<MedicineInventory[]> => {
  const { data } = await api.get("/pharmacy/inventory");
  return data;
};

// Adicionar um novo item ao inventário
export const addInventoryItem = async (
  inventoryData: InventoryFormData
): Promise<MedicineInventory> => {
  const { data } = await api.post("/pharmacy/inventory", inventoryData);
  return data;
};

// Atualizar um item do inventário
export const updateInventoryItem = async (
  id: number,
  inventoryData: InventoryFormData
): Promise<MedicineInventory> => {
  const { data } = await api.put(`/pharmacy/inventory/${id}`, inventoryData);
  return data;
};

// Deletar um item do inventário
export const deleteInventoryItem = async (id: number): Promise<void> => {
  await api.delete(`/pharmacy/inventory/${id}`);
};

// Buscar todas as vendas
export const getAllSales = async (): Promise<PharmacySale[]> => {
  const { data } = await api.get("/pharmacy/sales");
  return data;
};

// Função para criar uma venda direta
export const createDirectSale = async (
  saleData: DirectSaleFormData
): Promise<PharmacySale> => {
  // Recebe um ID de prescrição nulo ou inválido
  const requestData = { ...saleData, originalPrescriptionId: null };
  const { data } = await api.post("/pharmacy/sales/direct", requestData);
  return data;
};

// Criar venda a partir de uma prescrição
export const createSaleFromPrescription = async (
  prescriptionId: number
): Promise<PharmacySale> => {
  const { data } = await api.post(
    "/pharmacy/sales/from-prescription",
    prescriptionId,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};
