import { useParams, useNavigate } from "react-router";
import { usePatientById } from "@/services/queries/profile-queries";
import { useAdminPatientMedicalHistory } from "@/services/queries/admin-queries";
import { MedicalHistoryTimeline } from "@/features/patient/components/MedicalHistoryTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminPatientMedicalHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientProfileId = Number(id);

  // Busca o perfil do paciente para mostrar o nome
  const { data: patient, isLoading: isLoadingProfile } =
    usePatientById(patientProfileId);

  // Busca o histórico médico usando o novo hook
  const {
    data: medicalHistory,
    isLoading: isLoadingHistory,
    isError,
    error,
  } = useAdminPatientMedicalHistory(patientProfileId);

  const isLoading = isLoadingProfile || isLoadingHistory;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          {isLoadingProfile ? (
            <Skeleton className="h-8 w-72 mb-1" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">
              Prontuário de {patient?.name || "Paciente"}
            </h1>
          )}
          <p className="text-muted-foreground">
            Linha do tempo de consultas e registos médicos.
          </p>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {isLoading && <LoadingSkeleton />}

      {/* Estado de Erro */}
      {isError && (
        <Alert variant="destructive" className="shadow-sm">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Histórico</AlertTitle>
          <AlertDescription>
            {/* @ts-ignore */}
            {error?.message ||
              "Não foi possível buscar os dados do histórico deste paciente."}
          </AlertDescription>
        </Alert>
      )}

      {/* Conteúdo Principal (Timeline) */}
      {!isLoading && !isError && medicalHistory && (
        <MedicalHistoryTimeline appointments={medicalHistory.appointments} />
      )}

      {/* Caso não haja histórico */}
      {!isLoading &&
        !isError &&
        (!medicalHistory || medicalHistory.appointments.length === 0) && (
          <Alert className="shadow-sm">
            <FileText className="h-4 w-4" />
            <AlertTitle>Histórico Vazio</AlertTitle>
            <AlertDescription>
              Este paciente ainda não possui registos no histórico médico.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};

// Componente de Esqueleto (pode mover para um ficheiro partilhado se preferir)
const LoadingSkeleton = () => (
  <div className="space-y-8 mt-6">
    {[1, 2].map((i) => (
      <div key={i} className="flex gap-6">
        {/* Skeleton da data/hora */}
        <div className="flex flex-col items-center min-w-[100px]">
          <Skeleton className="w-24 h-6 rounded" />
          <Skeleton className="w-16 h-4 rounded mt-1" />
        </div>
        {/* Separador e ícone */}
        <div className="flex flex-col items-center">
          <Skeleton className="h-full w-0.5 bg-muted" />
          <Skeleton className="w-6 h-6 rounded-full absolute mt-2" />
        </div>
        {/* Skeleton do Card */}
        <Skeleton className="flex-1 h-36 rounded-xl mb-4" />
      </div>
    ))}
  </div>
);
