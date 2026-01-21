import { useState } from "react";
import {
  useGetDoctorUnavailability,
  useCreateDoctorUnavailability,
  useDeleteDoctorUnavailability,
} from "@/services/queries/appointment-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, CalendarOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CustomNotification } from "@/components/notifications/CustomNotification";

interface Props {
  doctorId: number;
}

interface NotificationState {
  type: "success" | "error";
  message: string;
}

export function DoctorUnavailabilityManager({ doctorId }: Props) {
  const { data: unavailabilityList, isLoading } =
    useGetDoctorUnavailability(doctorId);
  const createMutation = useCreateDoctorUnavailability();
  const deleteMutation = useDeleteDoctorUnavailability();
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  const [formData, setFormData] = useState({
    startDateTime: "",
    endDateTime: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    if (!formData.startDateTime || !formData.endDateTime) return;

    createMutation.mutate(
      {
        doctorId,
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: new Date(formData.endDateTime).toISOString(),
        reason: formData.reason,
      },
      {
        onSuccess: () => {
          setFormData({ startDateTime: "", endDateTime: "", reason: "" });
          setNotification({
            type: "success",
            message: "Bloqueio de agenda criado com sucesso!",
          });
        },
        onError: (error: any) => {
          setNotification({
            type: "error",
            message:
              error.response?.data?.message ||
              "Erro ao criar bloqueio de agenda.",
          });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este bloqueio?")) {
      setNotification(null);
      deleteMutation.mutate(id, {
        onSuccess: () => {
          setNotification({
            type: "success",
            message: "Bloqueio removido com sucesso!",
          });
        },
        onError: () => {
          setNotification({
            type: "error",
            message: "Erro ao remover bloqueio.",
          });
        },
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {notification && (
        <CustomNotification
          variant={notification.type === "success" ? "success" : "error"}
          title={notification.type === "success" ? "Sucesso" : "Erro"}
          description={notification.message}
          onDismiss={() => setNotification(null)}
          autoHide
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarOff className="w-5 h-5" />
            Registrar Ausência / Bloqueio
          </CardTitle>
          <CardDescription>
            Bloqueie sua agenda para férias, congressos ou imprevistos. O
            sistema impedirá novos agendamentos neste período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-4 items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.startDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, startDateTime: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, endDateTime: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (Opcional)</Label>
              <Input
                id="reason"
                placeholder="Ex: Férias, Médico..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Bloquear Agenda"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bloqueios Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {!unavailabilityList || unavailabilityList.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhum bloqueio registrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unavailabilityList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(
                        new Date(item.startDateTime),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.endDateTime), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{item.reason || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
