import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPrescriptionsByPatientId } from "@/services/appointment";
import type { Prescription } from "@/types/record.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePatientsDropdown } from "@/services/queries/profile-queries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/utils";

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
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data: patients = [], isLoading: isLoadingPatients } =
    usePatientsDropdown();

  const { data: prescriptionsPage, isLoading: isLoadingPrescriptions } =
    useQuery({
      queryKey: ["prescriptionsForPatient", selectedPatientId],
      queryFn: () => getPrescriptionsByPatientId(selectedPatientId!, 0, 20),
      enabled: !!selectedPatientId,
    });

  const prescriptions = prescriptionsPage?.content || [];

  const handleImport = (prescription: Prescription) => {
    onSuccess(prescription);
  };

  const selectedPatient = patients.find((p) => p.userId === selectedPatientId);

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
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente</label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  disabled={isLoadingPatients}
                  className={cn(
                    "w-full justify-between font-normal",
                    !selectedPatientId && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedPatient?.name ||
                      (isLoadingPatients
                        ? "Carregando pacientes..."
                        : "Selecione um paciente")}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar paciente pelo nome..." />
                  <CommandList>
                    <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {patients.map((patient) => (
                        <CommandItem
                          key={patient.userId}
                          value={patient.name}
                          onSelect={() => {
                            setSelectedPatientId(patient.userId);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPatientId === patient.userId
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {patient.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {isLoadingPrescriptions && (
            <p className="text-sm text-muted-foreground text-center">
              Carregando prescrições...
            </p>
          )}

          {!isLoadingPrescriptions && prescriptionsPage && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma prescrição encontrada para este paciente.
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
                      <p className="text-xs text-muted-foreground">
                        {p.medicines.length} medicamento(s)
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
