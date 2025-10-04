import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Trash, Plus, FileInput } from "lucide-react";
import { getAllMedicines } from "@/services/pharmacyService";
import { useCreateDirectSale } from "@/hooks/pharmacy-queries";
import { usePatientsDropdown } from "@/hooks/profile-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportPrescriptionDialog } from "@/components/admin/sales/ImportPrescriptionDialog";

import type { Prescription } from "@/types/record.types";
import { saleFormSchema, type SaleFormData } from "@/lib/schemas/sale.schema";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { Combobox } from "@/components/ui/combobox";

type NotificationState = {
  show: boolean;
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
} | null;

export const AdminNewSalePage = () => {
  const navigate = useNavigate();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);

  const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
  });
  const { data: patients = [] } = usePatientsDropdown();

  const createSaleMutation = useCreateDirectSale();

  const onSubmit = async (data: SaleFormData) => {
    console.log("Dados do formulário:", data);
    setNotification(null);

    // Validação do paciente
    if (!data.patientId || data.patientId === 0) {
      setNotification({
        show: true,
        variant: "error",
        title: "Paciente não selecionado",
        description: "Por favor, selecione um paciente.",
      });
      return;
    }

    // Validação dos medicamentos
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.medicineId || item.medicineId === 0) {
        setNotification({
          show: true,
          variant: "error",
          title: "Medicamento não selecionado",
          description: `Selecione um medicamento para o item ${i + 1}.`,
        });
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setNotification({
          show: true,
          variant: "error",
          title: "Quantidade inválida",
          description: `Informe uma quantidade válida para o item ${i + 1}.`,
        });
        return;
      }
    }

    try {
      const payload = {
        patientId: Number(data.patientId),
        items: data.items.map((item) => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
        })),
      };

      await createSaleMutation.mutateAsync(payload);

      setNotification({
        show: true,
        variant: "success",
        title: "Venda registrada com sucesso!",
        description: "Redirecionando...",
      });

      setTimeout(() => navigate("/admin/sales"), 1500);
    } catch (error: any) {
      setNotification({
        show: true,
        variant: "error",
        title: "Erro ao registrar venda",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Erro desconhecido",
      });
    }
  };

  const form = useForm<SaleFormData>({
    // REMOVA o resolver
    // resolver: zodResolver(saleFormSchema),
    defaultValues: { patientId: 0, items: [{ medicineId: 0, quantity: 1 }] },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const medicineOptions = medicines.map((med) => ({
    value: String(med.id),
    label: `${med.name} - ${med.dosage}`,
  }));

  const handleImportSuccess = (prescription: Prescription) => {
    setIsImportOpen(false);

    form.setValue("patientId", prescription.patientId);

    const saleItems = prescription.medicines
      .map((med) => {
        const stockMedicine = medicines.find(
          (stockMed) =>
            stockMed.name.toLowerCase() === med.name.toLowerCase() &&
            stockMed.dosage.toLowerCase() === med.dosage.toLowerCase()
        );
        return {
          medicineId: stockMedicine?.id || 0,
          quantity: 1,
        };
      })
      .filter((item) => item.medicineId !== 0);

    if (saleItems.length > 0) {
      replace(saleItems);
      setNotification({
        show: true,
        variant: "success",
        title: "Prescrição importada com sucesso",
        description: `${saleItems.length} medicamento(s) adicionado(s) à venda.`,
      });
    } else {
      setNotification({
        show: true,
        variant: "error",
        title: "Nenhum medicamento encontrado",
        description:
          "Os medicamentos da prescrição não estão disponíveis no estoque.",
      });
      replace([{ medicineId: 0, quantity: 1 }]);
    }
  };

  const onError = (errors: any) => {
    console.log("Erros de validação:", errors);

    let errorMessage = "Preencha todos os campos obrigatórios corretamente.";

    if (errors.patientId) {
      errorMessage = "Selecione um paciente antes de continuar.";
    } else if (errors.items) {
      const firstItemError = errors.items[0];
      if (firstItemError?.medicineId) {
        errorMessage = "Selecione um medicamento válido para todos os itens.";
      } else if (firstItemError?.quantity) {
        errorMessage =
          "Informe uma quantidade válida para todos os medicamentos.";
      } else {
        errorMessage = "Verifique os medicamentos e quantidades informados.";
      }
    }

    setNotification({
      show: true,
      variant: "error",
      title: "Formulário inválido",
      description: errorMessage,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-8 max-w-4xl mx-auto"
        >
          {notification?.show && (
            <CustomNotification
              variant={notification.variant}
              title={notification.title}
              description={notification.description}
              dismissible
              autoHide
              autoHideDelay={5000}
              onDismiss={() => setNotification(null)}
            />
          )}

          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Nova Venda Direta</h1>
              <p className="text-muted-foreground">
                Registre uma venda no balcão ou importe de uma prescrição.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
            >
              <FileInput className="mr-2 h-4 w-4" />
              Importar Prescrição
            </Button>
          </div>

          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprador (Paciente) *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={
                    field.value && field.value > 0 ? String(field.value) : ""
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.userId} value={String(p.userId)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Medicamentos *</FormLabel>
            {fields.map((item, index) => {
              const selectedMedicineId = form.watch(
                `items.${index}.medicineId`
              );
              const selectedMedicine = medicines.find(
                (m) => m.id === selectedMedicineId
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.medicineId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Combobox
                          options={medicineOptions}
                          value={field.value > 0 ? String(field.value) : ""}
                          onValueChange={(value) => {
                            const numValue = value ? Number(value) : 0;
                            field.onChange(numValue);
                          }}
                          placeholder="Selecione o medicamento"
                          searchPlaceholder="Buscar medicamento..."
                          emptyMessage="Nenhum medicamento encontrado."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Qtd."
                            className="w-24"
                            min="1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? parseInt(val, 10) : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground min-w-[100px]">
                    Estoque: {selectedMedicine?.totalStock ?? "N/A"}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ medicineId: 0, quantity: 1 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Medicamento
            </Button>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/admin/sales")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createSaleMutation.isPending}>
              {createSaleMutation.isPending
                ? "Registrando Venda..."
                : "Registrar Venda"}
            </Button>
          </div>
        </form>
      </Form>

      <ImportPrescriptionDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
