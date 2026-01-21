import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Award,
  Stethoscope,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/shared/StarRating";
import {
  getDoctorById,
  getDoctorStats,
  getDoctorReviews,
} from "@/services/profile";
import { useState } from "react";
import { ChatSheet } from "@/features/chat/components/ChatSheet";
import { CreateAppointmentDialog } from "@/features/patient/components/CreateAppointmentDialog"; 
import { useCreateAppointment } from "@/services/queries/appointment-queries"; 
import { toast } from "sonner"; 

export const PatientViewDoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const doctorId = Number(id);
  const API_BASE_URL = "http://localhost:9000";

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false); // <--- Estado do Modal

  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !!doctorId,
  });

  const { data: stats } = useQuery({
    queryKey: ["doctor-stats", doctorId],
    queryFn: () => getDoctorStats(doctorId),
    enabled: !!doctorId,
  });

  const { data: reviews } = useQuery({
    queryKey: ["doctor-reviews", doctorId],
    queryFn: () => getDoctorReviews(doctorId),
    enabled: !!doctorId,
  });

  const createAppointmentMutation = useCreateAppointment();

  const handleAppointmentSubmit = (data: any) => {
    createAppointmentMutation.mutate(data, {
      onSuccess: () => {
        setIsAppointmentOpen(false);
        toast.success("Consulta agendada com sucesso!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar consulta.",
        );
      },
    });
  };

  if (isLoadingDoctor) {
    return (
      <div className="container py-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!doctor) {
    return <div className="container py-10">Médico não encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="border-none shadow-md bg-gradient-to-r from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage
              src={
                doctor.profilePictureUrl
                  ? `${API_BASE_URL}${doctor.profilePictureUrl}`
                  : undefined
              }
              className="object-cover"
            />
            <AvatarFallback className="text-4xl">
              {doctor.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dr. {doctor.name}
              </h1>
              <Badge className="bg-blue-600 hover:bg-blue-700">
                {doctor.specialization}
              </Badge>
            </div>

            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Stethoscope className="h-4 w-4" /> CRM: {doctor.crmNumber} •{" "}
              {doctor.department}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              <StarRating
                rating={stats?.averageRating || 0}
                readOnly
                size={20}
              />
              <span className="font-semibold text-lg">
                {stats?.averageRating?.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({stats?.totalReviews || 0} avaliações)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="pt-4">
              <Button
                className="px-20 shadow-md text-secondary"
                onClick={() => setIsAppointmentOpen(true)}
              >
                Agendar Consulta
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Enviar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">Sobre</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                {doctor.biography || "Nenhuma biografia informada pelo médico."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualificações & Experiência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Anos de Prática</p>
                  <p className="text-muted-foreground">
                    {doctor.yearsOfExperience} anos de experiência clínica.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Formação Acadêmica</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {doctor.qualifications || "Não informado."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações dos Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center italic">
                  Este médico ainda não possui avaliações.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              Paciente Verificado
                            </p>
                            <div className="flex items-center gap-1">
                              <StarRating
                                rating={review.rating}
                                readOnly
                                size={12}
                              />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(review.createdAt), "dd MMM yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 pl-10">
                        "{review.comment || "Avaliação sem comentário."}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Por que escolher este médico?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              <p>✓ Especialista verificado</p>
              <p>✓ Alta taxa de satisfação</p>
              <p>✓ Atendimento humanizado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatSheet
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        recipientId={doctor.userId}
        recipientName={doctor.name}
      />

      <CreateAppointmentDialog
        open={isAppointmentOpen}
        onOpenChange={setIsAppointmentOpen}
        onSubmit={handleAppointmentSubmit}
        isPending={createAppointmentMutation.isPending}
        defaultDoctorId={doctorId}
      />
    </div>
  );
};
