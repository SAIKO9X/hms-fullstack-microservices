import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { getAllMedicines } from "@/services/pharmacyService";
import { useCreateDirectSale } from "@/hooks/pharmacy-queries";
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
import { Trash, Plus, FileInput } from "lucide-react";
import { useNavigate } from "react-router";
import { usePatientsDropdown } from "@/hooks/profile-queries";
import { useState } from "react";
import { ImportPrescriptionDialog } from "@/components/admin/sales/ImportPrescriptionDialog";
import type { Prescription } from "@/types/record.types";
import { saleFormSchema, type SaleFormData } from "@/lib/schemas/sale.schema";

export const AdminNewSalePage = () => {
  const navigate = useNavigate();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
  });
  const { data: patients = [] } = usePatientsDropdown();

  const createSaleMutation = useCreateDirectSale();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      patientId: undefined,
      items: [{ medicineId: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleImportSuccess = (prescription: Prescription) => {
    setIsImportOpen(false);

    form.setValue("patientId", prescription.patientId);

    // Mapeia os medicamentos da prescrição para os do estoque
    const saleItems = prescription.medicines
      .map((med) => {
        const stockMedicine = medicines.find(
          (stockMed) =>
            stockMed.name.toLowerCase() === med.name.toLowerCase() &&
            stockMed.dosage.toLowerCase() === med.dosage.toLowerCase()
        );
        return {
          medicineId: stockMedicine?.id || 0, // 0 se não encontrar
          quantity: 1, // Quantidade padrão, pode ser ajustada pelo usuário
        };
      })
      .filter((item) => item.medicineId !== 0);

    if (saleItems.length > 0) {
      replace(saleItems);
    } else {
      console.warn(
        "Nenhum medicamento da prescrição foi encontrado no estoque."
      );
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    // Transforma o patientId para garantir que é número antes de enviar
    const payload = {
      ...data,
      patientId: Number(data.patientId),
    };
    await createSaleMutation.mutateAsync(payload, {
      onSuccess: () => navigate("/admin/sales"),
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-4xl mx-auto"
        >
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

          {/* Seção de Informações do Comprador */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprador (Paciente)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : ""}
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

          {/* Seção de Medicamentos */}
          <div className="space-y-4">
            <FormLabel>Medicamentos</FormLabel>
            {fields.map((field, index) => {
              const selectedMedicineId = form.watch(
                `items.${index}.medicineId`
              );
              const selectedMedicine = medicines.find(
                (m) => m.id === selectedMedicineId
              );

              return (
                <div
                  key={field.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.medicineId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o medicamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {medicines.map((med) => (
                              <SelectItem key={med.id} value={String(med.id)}>
                                {med.name} - {med.dosage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground">
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
