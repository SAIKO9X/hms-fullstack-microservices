import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicineFormSchema,
  type MedicineFormData,
} from "@/lib/schemas/medicine.schema";
import {
  useAddMedicine,
  useUpdateMedicine,
} from "@/services/queries/pharmacy-queries";
import type { Medicine } from "@/types/medicine.types";
import { FormDialog } from "@/components/shared/FormDialog";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

const categoryOptions = [
  { value: "ANTIBIOTIC", label: "Antibiótico" },
  { value: "ANALGESIC", label: "Analgésico" },
  { value: "ANTIHISTAMINE", label: "Anti-histamínico" },
  { value: "ANTISEPTIC", label: "Antisséptico" },
  { value: "VITAMIN", label: "Vitamina" },
  { value: "MINERAL", label: "Mineral" },
  { value: "HERBAL", label: "Fitoterápico" },
  { value: "HOMEOPATHIC", label: "Homeopático" },
  { value: "OTHER", label: "Outro" },
];

const typeOptions = [
  { value: "TABLET", label: "Comprimido" },
  { value: "CAPSULE", label: "Cápsula" },
  { value: "SYRUP", label: "Xarope" },
  { value: "INJECTION", label: "Injeção" },
  { value: "OINTMENT", label: "Pomada" },
  { value: "DROPS", label: "Gotas" },
  { value: "INHALER", label: "Inalador" },
  { value: "OTHER", label: "Outro" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export const AddEditMedicineDialog = ({
  open,
  onOpenChange,
  medicine,
}: Props) => {
  const isEditing = !!medicine;

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(MedicineFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      category: undefined,
      type: undefined,
      manufacturer: "",
      unitPrice: undefined,
    },
  });

  const addMutation = useAddMedicine();
  const updateMutation = useUpdateMedicine();

  useEffect(() => {
    if (open) {
      if (isEditing && medicine) {
        form.reset(medicine);
      } else {
        form.reset({
          name: "",
          dosage: "",
          category: undefined,
          type: undefined,
          manufacturer: "",
          unitPrice: undefined,
        });
      }
    }
  }, [medicine, open, form, isEditing]);

  const onSubmit = async (data: MedicineFormData) => {
    try {
      if (isEditing && medicine) {
        await updateMutation.mutateAsync({ id: medicine.id, data });
      } else {
        await addMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Falha ao salvar medicamento:", error);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const error = addMutation.error || updateMutation.error;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Medicamento" : "Adicionar Novo Medicamento"}
      description={
        isEditing
          ? "Atualize as informações do medicamento"
          : "Preencha os dados do novo medicamento"
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      submitLabel={
        isEditing ? "Atualizar Medicamento" : "Adicionar Medicamento"
      }
      className="sm:max-w-3xl max-h-[90vh]"
    >
      {error && (
        <div className="mb-4">
          <CustomNotification variant="error" title={error.message} />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInput
            name="name"
            control={form.control}
            label="Nome do Medicamento"
            placeholder="Ex: Paracetamol"
            className="h-11"
          />

          <FormInput
            name="dosage"
            control={form.control}
            label="Dosagem"
            placeholder="Ex: 500mg, 10ml, 250mg/5ml"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Classificação
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSelect
            name="category"
            control={form.control}
            label="Categoria"
            placeholder="Selecione a categoria"
            options={categoryOptions}
            className="h-11"
          />

          <FormSelect
            name="type"
            control={form.control}
            label="Tipo/Forma"
            placeholder="Selecione o tipo"
            options={typeOptions}
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Dados Comerciais
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInput
            name="manufacturer"
            control={form.control}
            label="Fabricante"
            placeholder="Ex: Medley, EMS, Sanofi"
            className="h-11"
          />

          <FormInput
            name="unitPrice"
            control={form.control}
            label="Preço Unitário (R$)"
            type="number"
            placeholder="0,00"
            className="h-11"
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              form.setValue("unitPrice", value as any);
            }}
          />
        </div>
      </div>
    </FormDialog>
  );
};
