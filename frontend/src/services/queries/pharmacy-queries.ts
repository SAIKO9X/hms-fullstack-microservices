import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PharmacyService } from "@/services";
import type {
  DirectSaleFormData,
  InventoryFormData,
  MedicineFormData,
} from "@/services/pharmacy";
import type { Medicine } from "@/types/medicine.types";

// Hook para adicionar um novo medicamento
export const useAddMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineData: MedicineFormData) =>
      PharmacyService.addMedicine(medicineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

// Hook para atualizar um medicamento existente
export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineFormData }) =>
      PharmacyService.updateMedicine(id, data),
    onSuccess: (updatedMedicine) => {
      queryClient.setQueryData(
        ["medicines"],
        (oldData: Medicine[] | undefined) =>
          oldData
            ? oldData.map((m) =>
                m.id === updatedMedicine.id ? updatedMedicine : m
              )
            : []
      );
    },
  });
};

// Hook para buscar todos os medicamentos
export const useMedicines = () => {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: PharmacyService.getAllMedicines,
  });
};

// Hook para buscar todos os itens do inventário
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: PharmacyService.getAllInventory,
  });
};

// Hook para adicionar um novo item ao inventário
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

// Hook para atualizar um item do inventário
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

// Hook para deletar um item do inventário
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

// Hook para criar uma venda direta
export const useCreateDirectSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DirectSaleFormData) =>
      PharmacyService.createDirectSale(data),
    onSuccess: () => {
      // Invalida os caches relacionados
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

// Hook para criar venda a partir de prescrição
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

// Hook para buscar todas as vendas
export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: PharmacyService.getAllSales,
  });
};
