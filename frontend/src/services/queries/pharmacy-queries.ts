import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PharmacyService } from "@/services";
import type { Medicine } from "@/types/medicine.types";
import type {
  DirectSaleFormData,
  InventoryFormData,
  MedicineFormData,
} from "@/services/pharmacy";

export const pharmacyKeys = {
  medicines: ["medicines"] as const,
  inventory: ["inventory"] as const,
  sales: ["sales"] as const,
  stats: ["pharmacyStats"] as const,
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineData: MedicineFormData) =>
      PharmacyService.addMedicine(medicineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineFormData }) =>
      PharmacyService.updateMedicine(id, data),
    onSuccess: (updatedMedicine) => {
      queryClient.setQueryData(
        pharmacyKeys.medicines,
        (oldData: Medicine[] | undefined) =>
          oldData
            ? oldData.map((m) =>
                m.id === updatedMedicine.id ? updatedMedicine : m
              )
            : []
      );
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useMedicines = () => {
  return useQuery({
    queryKey: pharmacyKeys.medicines,
    queryFn: PharmacyService.getAllMedicines,
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: pharmacyKeys.inventory,
    queryFn: PharmacyService.getAllInventory,
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InventoryFormData) =>
      PharmacyService.addInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.inventory });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryFormData }) =>
      PharmacyService.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.inventory });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PharmacyService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.inventory });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useCreateDirectSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DirectSaleFormData) =>
      PharmacyService.createDirectSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.sales });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.inventory });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useCreateSaleFromPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescriptionId: number) =>
      PharmacyService.createSaleFromPrescription(prescriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.sales });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.inventory });
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.medicines });
    },
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: pharmacyKeys.sales,
    queryFn: PharmacyService.getAllSales,
  });
};

export const usePharmacyStats = () => {
  return useQuery({
    queryKey: pharmacyKeys.stats,
    queryFn: PharmacyService.getPharmacyStats,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos para não sobrecarregar o backend
  });
};
