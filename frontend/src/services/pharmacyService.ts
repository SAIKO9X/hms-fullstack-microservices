import api from "@/lib/interceptor/AxiosInterceptor";
import type { Medicine } from "@/types/medicine.types";

export type MedicineFormData = Omit<Medicine, "id" | "createdAt">;

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
