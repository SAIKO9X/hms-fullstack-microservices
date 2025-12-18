import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PharmacyService } from "@/services";
import type {
  DirectSaleFormData,
  InventoryFormData,
  MedicineFormData,
} from "@/services/pharmacy";
import { keepPreviousData } from "@tanstack/react-query";

export const pharmacyKeys = {
  medicines: (page?: number, size?: number) =>
    ["medicines", { page, size }] as const,
  inventory: (page?: number, size?: number) =>
    ["inventory", { page, size }] as const,
  sales: (page?: number, size?: number) => ["sales", { page, size }] as const,
  stats: ["pharmacyStats"] as const,
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineData: MedicineFormData) =>
      PharmacyService.addMedicine(medicineData),
    onSuccess: () => {
      // Invalida todas as queries de medicines, independente da página
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineFormData }) =>
      PharmacyService.updateMedicine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useMedicines = (page = 0, size = 10) => {
  return useQuery({
    queryKey: pharmacyKeys.medicines(page, size),
    queryFn: () => PharmacyService.getAllMedicines(page, size),
    placeholderData: keepPreviousData, // Mantém os dados antigos enquanto carrega a próxima página
  });
};

export const useInventory = (page = 0, size = 10) => {
  return useQuery({
    queryKey: pharmacyKeys.inventory(page, size),
    queryFn: () => PharmacyService.getAllInventory(page, size),
    placeholderData: keepPreviousData,
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InventoryFormData) =>
      PharmacyService.addInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryFormData }) =>
      PharmacyService.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PharmacyService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useCreateDirectSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DirectSaleFormData) =>
      PharmacyService.createDirectSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useCreateSaleFromPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescriptionId: number) =>
      PharmacyService.createSaleFromPrescription(prescriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

export const useSales = (page = 0, size = 10) => {
  return useQuery({
    queryKey: pharmacyKeys.sales(page, size),
    queryFn: () => PharmacyService.getAllSales(page, size),
    placeholderData: keepPreviousData,
  });
};

export const usePharmacyStats = () => {
  return useQuery({
    queryKey: pharmacyKeys.stats,
    queryFn: PharmacyService.getPharmacyStats,
    staleTime: 5 * 60 * 1000,
  });
};
