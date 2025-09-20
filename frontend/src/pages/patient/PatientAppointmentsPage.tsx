import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useAppointmentsWithDoctorNames,
  useCreateAppointment,
} from "@/hooks/appointment-queries";
import { CreateAppointmentDialog } from "@/components/appointment/CreateAppointmentDialog";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/ui/columns";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import { CustomNotification } from "@/components/notifications/CustomNotification";

export const PatientAppointmentsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    variant: "success" | "error" | "info";
    title: string;
    description?: string;
  }>({
    show: false,
    variant: "info",
    title: "",
  });

  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useAppointmentsWithDoctorNames();
  const createAppointmentMutation = useCreateAppointment();

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      await createAppointmentMutation.mutateAsync(data);

      setNotification({
        show: true,
        variant: "success",
        title: "Consulta agendada com sucesso!",
        description:
          "Sua consulta foi agendada. Você receberá uma confirmação em breve.",
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      // Melhor tratamento de erros específicos
      let errorMessage =
        "Houve um problema ao agendar sua consulta. Tente novamente.";

      if (error?.response?.status === 409) {
        errorMessage = "Este horário já está ocupado. Escolha outro horário.";
      } else if (error?.response?.status === 404) {
        errorMessage =
          "Médico não encontrado. Atualize a página e tente novamente.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setNotification({
        show: true,
        variant: "error",
        title: "Erro ao agendar consulta",
        description: errorMessage,
      });
    }
  };

  const dismissNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded mt-6"></div>
            </div>
            <p className="text-muted-foreground mt-4">
              Carregando consultas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">
              Erro ao carregar consultas
            </div>
            <p className="text-muted-foreground">
              {error?.message || "Ocorreu um erro inesperado"}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Notification */}
      {notification.show && (
        <CustomNotification
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
          onDismiss={dismissNotification}
          autoHide
          autoHideDelay={5000}
        />
      )}

      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Minhas Consultas
          </h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe suas consultas médicas
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full md:w-auto text-secondary cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agendar Consulta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {appointments?.filter((a) => a.status === "SCHEDULED").length || 0}
          </div>
          <div className="text-sm text-muted-foreground">Agendadas</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {appointments?.filter((a) => a.status === "COMPLETED").length || 0}
          </div>
          <div className="text-sm text-muted-foreground">Concluídas</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {appointments?.filter((a) => a.status === "CANCELED").length || 0}
          </div>
          <div className="text-sm text-muted-foreground">Canceladas</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-zinc-400">
            {appointments?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <DataTable columns={columns} data={appointments || []} />
      </div>

      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateAppointment}
        isPending={createAppointmentMutation.isPending}
      />
    </div>
  );
};
