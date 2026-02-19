import {
  useMedicalHistory,
  useProfile,
} from "@/services/queries/profile-queries";
import { MedicalHistoryTimeline } from "../components/MedicalHistoryTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, XCircle, Home } from "lucide-react";
import { Link, useParams } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const PatientMedicalHistoryPage = () => {
  const { patientId } = useParams();
  const { profile, isLoading: isLoadingProfile } = useProfile();

  const targetPatientId = patientId ? Number(patientId) : profile?.id;

  const {
    data: medicalHistory,
    isLoading: isLoadingHistory,
    isError,
    error,
  } = useMedicalHistory(targetPatientId);

  const isLoading = isLoadingProfile || isLoadingHistory;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/patient/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Prontuário Eletrónico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Prontuário Eletrónico
          </h1>
          <p className="text-muted-foreground">
            A sua linha do tempo de consultas e registos médicos passados.
          </p>
        </div>
      </div>

      {isLoading && <LoadingSkeleton />}

      {isError && (
        <Alert variant="destructive" className="shadow-sm">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Histórico</AlertTitle>
          <AlertDescription>
            {error?.message ||
              "Não foi possível buscar os dados do seu histórico. Tente novamente mais tarde."}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && medicalHistory && (
        <MedicalHistoryTimeline appointments={medicalHistory.appointments} />
      )}
    </div>
  );
};

// componente de esqueleto para o estado de carregamento
const LoadingSkeleton = () => (
  <div className="space-y-8">
    {[1, 2].map((i) => (
      <div key={i} className="flex gap-6">
        <div className="flex flex-col items-center">
          <Skeleton className="w-[105px] h-[70px] rounded-xl" />
          <Skeleton className="w-4 h-4 rounded-full mt-2" />
        </div>
        <Skeleton className="flex-1 h-36 rounded-xl" />
      </div>
    ))}
  </div>
);
