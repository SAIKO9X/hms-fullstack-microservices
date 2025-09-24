import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMedicine,
  updateMedicine,
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
