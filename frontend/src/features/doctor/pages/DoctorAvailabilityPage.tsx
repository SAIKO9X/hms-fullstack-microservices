import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, Save, Trash2, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import {
  getDoctorAvailability,
  addDoctorAvailability,
  deleteDoctorAvailability,
} from "@/services/appointment";
import type { AvailabilitySlot } from "@/types/doctor.types";
import { DAYS_OF_WEEK } from "@/data/daysOfWeek";

export const DoctorAvailabilityPage = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "17:00",
  });

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user?.id]);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const data = await getDoctorAvailability(Number(user?.id));
      setSlots(data);
    } catch (error) {
      toast.error("Erro ao carregar horários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("O horário de fim deve ser após o horário de início.");
      return;
    }

    const hasConflict = slots.some(
      (s) =>
        s.dayOfWeek === newSlot.dayOfWeek &&
        newSlot.startTime < s.endTime &&
        newSlot.endTime > s.startTime
    );

    if (hasConflict) {
      toast.error("Este horário conflita com um existente.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = { ...newSlot, isAvailable: true };

      const createdSlot = await addDoctorAvailability(
        Number(user?.id),
        payload
      );
      setSlots([...slots, createdSlot]);
      toast.success("Horário adicionado!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao salvar horário.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSlot = async (id: number | undefined, index: number) => {
    if (!id) return;
    try {
      await deleteDoctorAvailability(id);
      const newSlots = [...slots];
      newSlots.splice(index, 1);
      setSlots(newSlots);
      toast.success("Horário removido");
    } catch (error) {
      toast.error("Erro ao remover horário");
    }
  };

  const getDayLabel = (val: string) =>
    DAYS_OF_WEEK.find((d) => d.value === val)?.label || val;

  const sortedSlots = [...slots].sort((a, b) => {
    const dayOrder = DAYS_OF_WEEK.map((d) => d.value);
    const diffDay =
      dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (diffDay !== 0) return diffDay;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Meus Horários de Atendimento
        </h1>
        <p className="text-muted-foreground">
          Gerencie sua agenda semanal recorrente. Consultas fora destes horários
          serão bloqueadas.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Para configurar horários de almoço, basta criar dois blocos separados.
          Ex: <strong>08:00 às 12:00</strong> e <strong>13:00 às 18:00</strong>.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Novo Bloco de Horário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dia da Semana</label>
              <Select
                value={newSlot.dayOfWeek}
                onValueChange={(val) =>
                  setNewSlot({ ...newSlot, dayOfWeek: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Início</label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fim</label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleAddSlot}
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Adicionar Horário
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda Semanal Configurada</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/20 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : sortedSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                <Clock className="h-8 w-8 mb-2 opacity-50" />
                <p>Nenhum horário configurado.</p>
                <p className="text-xs">
                  Sua agenda aparece como disponível 24h.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {sortedSlots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary font-bold text-xs w-10 h-10 flex items-center justify-center">
                        {getDayLabel(slot.dayOfWeek)
                          .substring(0, 3)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {getDayLabel(slot.dayOfWeek)}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {slot.startTime.substring(0, 5)} -{" "}
                          {slot.endTime.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100"
                      onClick={() => handleRemoveSlot(slot.id, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
