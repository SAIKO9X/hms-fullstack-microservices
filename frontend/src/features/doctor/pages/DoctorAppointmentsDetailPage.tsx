import { useParams, Link } from "react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Phone,
  User,
  FileText,
  TestTube,
  Stethoscope,
  Pill,
  Edit,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Eye,
  Download,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { AppointmentRecordForm } from "@/features/doctor/components/AppointmentRecordForm";
import { PrescriptionForm } from "@/features/doctor/components/PrescriptionForm";
import { RescheduleDialog } from "@/features/doctor/components/RescheduleDialog";
import { AddDocumentDialog } from "@/features/patient/components/AddDocumentDialog";
import {
  useDoctorAppointmentDetails,
  useAppointmentRecord,
  usePrescription,
  useRescheduleAppointment,
  useDocumentsByPatientId,
} from "@/services/queries/appointment-queries";
import type { AppointmentDetail } from "@/types/appointment.types";
import { ChatSheet } from "@/features/chat/components/ChatSheet";
import { LabOrdersManager } from "../components/LabOrdersManager";

const getStatusConfig = (status: string) => {
  const configs = {
    SCHEDULED: {
      label: "Agendada",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock,
    },
    COMPLETED: {
      label: "Concluída",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    CANCELED: {
      label: "Cancelada",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    },
  };
  return configs[status as keyof typeof configs] || configs.SCHEDULED;
};

export const DoctorAppointmentsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const appointmentId = Number(id);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [editingSection, setEditingSection] = useState<
    "record" | "prescription" | null
  >(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [docPage, setDocPage] = useState(0);
  const [docPageSize] = useState(5);

  const { data: appointments, isLoading: isLoadingAppointments } =
    useDoctorAppointmentDetails();

  const {
    data: record,
    isLoading: isLoadingRecord,
    refetch: refetchRecord,
  } = useAppointmentRecord(appointmentId);

  const {
    data: prescription,
    isLoading: isLoadingPrescription,
    refetch: refetchPrescription,
  } = usePrescription(appointmentId);

  const rescheduleAppointmentMutation = useRescheduleAppointment();

  const appointment = appointments?.find(
    (app: AppointmentDetail) => app.id === appointmentId,
  );

  const { data: documentsPage, refetch: refetchDocuments } =
    useDocumentsByPatientId(
      appointment?.patientId,
      docPage,
      docPageSize,
      !!appointment,
    );

  const documents = documentsPage?.content || [];
  const isLoading =
    isLoadingAppointments || isLoadingRecord || isLoadingPrescription;

  const handleRecordSuccess = () => {
    setNotification({
      message: "Registo guardado com sucesso!",
      type: "success",
    });
    setEditingSection(null);
    refetchRecord();
  };

  const handlePrescriptionSuccess = () => {
    setNotification({
      message: "Prescrição guardada com sucesso!",
      type: "success",
    });
    setEditingSection(null);
    refetchPrescription();
  };

  const handleDocumentSuccess = () => {
    setNotification({
      message: "Documento enviado com sucesso!",
      type: "success",
    });
    refetchDocuments();
  };

  const handleRescheduleAppointment = async (
    appointmentId: number,
    newDateTime: string,
  ) => {
    try {
      await rescheduleAppointmentMutation.mutateAsync({
        id: appointmentId,
        newDateTime: newDateTime,
      });
      setNotification({
        message: "Consulta reagendada com sucesso!",
        type: "success",
      });
    } catch (error: any) {
      setNotification({
        message: error?.response?.data?.message || "Erro ao reagendar consulta",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            Carregando detalhes da consulta...
          </p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Consulta não encontrada
            </CardTitle>
            <CardDescription>
              A consulta com ID #{appointmentId} não foi encontrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/doctor/appointments">Voltar às consultas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {notification && (
        <CustomNotification
          variant={notification.type}
          title={notification.message}
          onDismiss={() => setNotification(null)}
          autoHide
        />
      )}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/doctor/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/doctor/appointments">Consultas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Consulta #{appointmentId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="h-6 w-6" />
                  {appointment.patientName}
                </CardTitle>
                <CardDescription>Paciente</CardDescription>
              </div>
              <Badge className={statusConfig.className} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsChatOpen(true)}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat com Paciente
              </Button>
              <Button variant="outline">Voltar</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Telefone:</span>
                <span>{appointment.patientPhoneNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data:</span>
                <span>
                  {format(
                    new Date(appointment.appointmentDateTime),
                    "dd/MM/yyyy",
                    { locale: ptBR },
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Horário:</span>
                <span>
                  {format(new Date(appointment.appointmentDateTime), "HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Motivo da consulta:
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {appointment.reason}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex justify-center">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Gerencie esta consulta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointment.status === "SCHEDULED" && (
              <>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setRescheduleDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Reagendar
                </Button>
                <Button className="w-full" variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            {record && (
              <Badge className="w-full justify-center py-2 bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Registo Concluído
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Registo</span>
          </TabsTrigger>
          <TabsTrigger value="prescription" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Prescrição</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            disabled
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>

          <TabsTrigger value="lab-orders" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Exames</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                {record ? "Registo da Consulta" : "Criar Registo da Consulta"}
              </CardTitle>
              <CardDescription>
                {record
                  ? "Informações médicas registadas durante a consulta"
                  : "Registe as informações médicas da consulta"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingSection === "record" || !record ? (
                <AppointmentRecordForm
                  appointmentId={appointmentId}
                  existingRecord={record}
                  onSuccess={handleRecordSuccess}
                  onCancel={() => setEditingSection(null)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <h4 className="font-semibold">Sintomas Reportados</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4">
                      {record.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <h4 className="font-semibold">Diagnóstico</h4>
                    </div>
                    <p className="ml-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {record.diagnosisDescription}
                      {record.diagnosisCid10 && (
                        <span className="ml-2 text-xs font-mono">
                          ({record.diagnosisCid10})
                        </span>
                      )}
                    </p>
                  </div>

                  {record.requestedTests &&
                    record.requestedTests.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TestTube className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Testes Realizados</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {record.requestedTests.map(
                            (test: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {test}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {record.notes && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">Notas Adicionais</h4>
                      </div>
                      <p className="ml-6 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditingSection("record")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Registo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {prescription ? "Ver Prescrição" : "Criar Prescrição"}
              </CardTitle>
              <CardDescription>
                {prescription
                  ? "Medicamentos prescritos para esta consulta"
                  : "Adicione os medicamentos e instruções"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingSection === "prescription" || !prescription ? (
                <PrescriptionForm
                  appointmentId={appointmentId}
                  existingPrescription={prescription}
                  onSuccess={handlePrescriptionSuccess}
                  onCancel={() => setEditingSection(null)}
                />
              ) : (
                <div className="space-y-4">
                  {prescription.medicines.map((med, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-muted/30"
                    >
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency} por {med.duration} dias
                      </p>
                    </div>
                  ))}
                  {prescription.notes && (
                    <div>
                      <h4 className="font-semibold">Notas Adicionais:</h4>
                      <p className="text-sm text-muted-foreground">
                        {prescription.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditingSection("prescription")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Prescrição
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico do Paciente
              </CardTitle>
              <CardDescription>
                Consultas anteriores e histórico médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-center">
                <div className="space-y-3">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">
                    O histórico médico do paciente será exibido aqui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Documentos do Paciente</span>
                </div>
                <Button onClick={() => setIsAddDocOpen(true)}>
                  Adicionar Documento
                </Button>
              </CardTitle>
              <CardDescription>
                Exames e arquivos anexados a este paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!documents || documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                  <p>Nenhum documento encontrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.fileType} •{" "}
                              {format(new Date(doc.uploadedAt), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDocPage((old) => Math.max(0, old - 1))}
                      disabled={docPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Página {docPage + 1} de {documentsPage?.totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDocPage((old) =>
                          !documentsPage || old >= documentsPage.totalPages - 1
                            ? old
                            : old + 1,
                        )
                      }
                      disabled={
                        !documentsPage ||
                        docPage >= documentsPage.totalPages - 1
                      }
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-orders" className="mt-6">
          <LabOrdersManager
            appointmentId={appointmentId}
            patientId={appointment.patientId}
          />
        </TabsContent>
      </Tabs>

      <AddDocumentDialog
        open={isAddDocOpen}
        onOpenChange={setIsAddDocOpen}
        onSuccess={handleDocumentSuccess}
        initialAppointmentId={appointmentId}
        patientId={appointment.patientId}
      />

      {appointment && (
        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          appointmentId={appointmentId}
          currentDateTime={appointment.appointmentDateTime}
          patientName={appointment.patientName}
          onReschedule={handleRescheduleAppointment}
          isLoading={rescheduleAppointmentMutation.isPending}
        />
      )}

      <ChatSheet
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        recipientId={appointment.patientId}
        recipientName={appointment.patientName}
      />
    </div>
  );
};
