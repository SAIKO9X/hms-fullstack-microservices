import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPrescriptionsByPatientId } from "@/services/appointmentService";
import type { Prescription } from "@/types/record.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePatientsDropdown } from "@/hooks/profile-queries";

interface ImportPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (prescription: Prescription) => void;
}

export const ImportPrescriptionDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: ImportPrescriptionDialogProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );

  const { data: patients = [], isLoading: isLoadingPatients } =
    usePatientsDropdown();

  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["prescriptionsForPatient", selectedPatientId],
    queryFn: () => getPrescriptionsByPatientId(selectedPatientId!),
    enabled: !!selectedPatientId,
  });

  const handleImport = (prescription: Prescription) => {
    onSuccess(prescription);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Prescrição</DialogTitle>
          <DialogDescription>
            Selecione um paciente para ver e importar suas prescrições.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select
            onValueChange={(value) => setSelectedPatientId(Number(value))}
            disabled={isLoadingPatients}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingPatients
                    ? "Carregando pacientes..."
                    : "Selecione um paciente"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.userId} value={String(p.userId)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLoadingPrescriptions && <p>Carregando prescrições...</p>}

          {prescriptions && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma prescrição encontrada.
                </p>
              ) : (
                prescriptions.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">Prescrição #{p.id}</p>
                      <p className="text-xs text-muted-foreground">
                        Data:{" "}
                        {format(new Date(p.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleImport(p)}>
                      Importar
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
