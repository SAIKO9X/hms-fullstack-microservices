import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInventoryItem,
  addMedicine,
<<<<<<< HEAD
  createDirectSale,
=======
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
  deleteInventoryItem,
  getAllInventory,
  getAllSales,
  updateInventoryItem,
  updateMedicine,
<<<<<<< HEAD
  type DirectSaleFormData,
=======
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
  type InventoryFormData,
  type MedicineFormData,
} from "@/services/pharmacyService";
import type { Medicine } from "@/types/medicine.types";

// Hook para adicionar um novo medicamento
export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (medicineData: MedicineFormData) => addMedicine(medicineData),
    onSuccess: () => {
      // Quando a mutação for bem-sucedida, invalida a query "medicines"
      // para que a tabela seja atualizada automaticamente com os novos dados.
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

// Hook para atualizar um medicamento existente
export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineFormData }) =>
      updateMedicine(id, data),
    onSuccess: (updatedMedicine) => {
      // Atualiza a lista de medicamentos em cache com os dados atualizados
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

// Hook para buscar todos os itens do inventário
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getAllInventory,
  });
};

// Hook para adicionar um novo item ao inventário
export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryFormData) => addInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] }); // Invalida medicines para atualizar o totalStock
    },
  });
};

// Hook para atualizar um item do inventário
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryFormData }) =>
      updateInventoryItem(id, data),
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
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

<<<<<<< HEAD
// Hook para criar uma venda direta
export const useCreateDirectSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DirectSaleFormData) => createDirectSale(data),
    onSuccess: () => {
      // Invalida as queries de vendas e inventário para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};

=======
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: getAllSales,
  });
};
