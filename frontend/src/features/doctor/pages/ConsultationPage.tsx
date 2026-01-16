import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  History,
  Pill,
  Stethoscope,
  ArrowLeft,
  Activity,
  FilePlus,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { getAppointmentById } from "@/services/appointment";
import { getPatientById } from "@/services/patient";
import { AppointmentRecordForm } from "../components/AppointmentRecordForm";
import { PrescriptionForm } from "../components/PrescriptionForm";
import { MedicalHistoryTimeline } from "@/features/patient/components/MedicalHistoryTimeline";
import { AddDocumentDialog } from "@/features/patient/components/AddDocumentDialog";
import { LabOrderForm } from "../components/LabOrderForm";

export const ConsultationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  const { data: appointment, isLoading: isLoadingApp } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
    enabled: !!appointmentId,
  });

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", appointment?.patientId],
    queryFn: () => getPatientById(Number(appointment?.patientId)),
    enabled: !!appointment?.patientId,
  });

  const isLoading = isLoadingApp || isLoadingPatient;

  if (isLoading) {
    return <ConsultationSkeleton />;
  }

  if (!appointment || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-xl font-bold">Erro ao carregar consulta</h2>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Atendimento em Andamento
            </h1>
            <p className="text-sm text-muted-foreground">
              {appointment.appointmentDateTime &&
                new Date(appointment.appointmentDateTime).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={appointment.status === "COMPLETED" ? "default" : "outline"}
          >
            {appointment.status}
          </Badge>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Resumo Left */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 border-r bg-muted/10 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="text-center space-y-2">
                <div className="h-20 w-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                  {patient.profilePictureUrl ? (
                    <img
                      src={patient.profilePictureUrl}
                      alt={patient.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    patient.name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{patient.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    CPF: {patient.cpf}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {patient.dateOfBirth &&
                      new Date(patient.dateOfBirth).toLocaleDateString()}{" "}
                    • {patient.gender}
                  </p>
                </div>
              </div>

              <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Alergias e Condições
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {patient.allergies ? (
                    <p className="font-medium text-red-600 dark:text-red-300">
                      {patient.allergies}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Nenhuma alergia registrada.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" /> Histórico Clínico
                </h3>
                <div className="border rounded-lg bg-card p-2">
                  <MedicalHistoryTimeline patientId={patient.id} />
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Ação Right */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 bg-background flex flex-col overflow-hidden">
          <Tabs defaultValue="anamnesis" className="flex-1 flex flex-col">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-4">
                <TabsTrigger value="anamnesis" className="gap-2">
                  <FileText className="h-4 w-4" /> Anamnese
                </TabsTrigger>
                <TabsTrigger value="lab-orders" className="gap-2">
                  <FlaskConical className="h-4 w-4" /> Exames
                </TabsTrigger>
                <TabsTrigger value="prescription" className="gap-2">
                  <Pill className="h-4 w-4" /> Prescrição
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FilePlus className="h-4 w-4" /> Docs
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-muted/5 p-6 overflow-y-auto">
              <TabsContent value="anamnesis" className="mt-0 h-full space-y-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Registro Clínico</CardTitle>
                      <CardDescription>
                        Registre a queixa principal e evolução.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AppointmentRecordForm
                        appointmentId={appointmentId}
                        onSuccess={() => toast.success("Registro salvo!")}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="prescription" className="mt-0 h-full">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nova Receita Médica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PrescriptionForm
                        patientId={patient.id}
                        appointmentId={appointmentId}
                        onSuccess={() => toast.success("Receita emitida!")}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0 h-full">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Documentos Médicos</CardTitle>
                        <CardDescription>
                          Anexe resultados de exames.
                        </CardDescription>
                      </div>
                      <AddDocumentDialog
                        open={true}
                        onOpenChange={() => {}}
                        onSuccess={() => toast.success("Documento anexado.")}
                        patientId={patient.id}
                        initialAppointmentId={appointmentId}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Activity className="h-10 w-10 mb-2 opacity-20" />
                        <p>
                          Lista de documentos desta consulta aparecerá aqui.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="lab-orders" className="mt-0 h-full">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>Solicitação de Exames (SADT)</CardTitle>
                      <CardDescription>
                        Gera um pedido formal de exames laboratoriais ou de
                        imagem.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LabOrderForm
                        appointmentId={appointmentId}
                        patientId={patient.id}
                        onSuccess={() =>
                          toast.success("Pedido salvo no histórico.")
                        }
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

const ConsultationSkeleton = () => (
  <div className="h-screen w-full flex flex-col p-4 gap-4">
    <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
    <div className="flex-1 grid grid-cols-12 gap-4">
      <div className="col-span-3 bg-muted animate-pulse rounded-md" />
      <div className="col-span-9 bg-muted animate-pulse rounded-md" />
    </div>
  </div>
);
