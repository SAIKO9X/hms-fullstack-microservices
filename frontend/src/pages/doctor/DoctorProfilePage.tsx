import { useRef, useState } from "react";
import { Edit } from "lucide-react";
import type { DoctorProfile } from "@/types/doctor.types";
import type { DoctorProfileFormData } from "@/lib/schemas/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileInfoTable } from "@/components/patient/ProfileInfoTable";
import { EditDoctorProfileDialog } from "@/components/doctor/EditDoctorProfileDialog";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { useProfile, useUpdateProfilePicture } from "@/hooks/profile-queries";
import { uploadFile } from "@/services/mediaService";

export const DoctorProfilePage = () => {
  const {
    profile,
    status,
    error,
    user,
    isLoading,
    isError,
    updateProfile,
    isUpdating,
  } = useProfile();

  const updatePictureMutation = useUpdateProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionNotification, setActionNotification] = useState<{
    variant: "success" | "error";
    title: string;
  } | null>(null);

  // Verificar se o usuário é doutor
  if (user?.role !== "DOCTOR") {
    return (
      <div className="text-center p-10 text-red-500">
        Acesso negado. Esta página é apenas para doutores.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-10">Carregando perfil do doutor...</div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <CustomNotification
          variant="error"
          title={error || "Erro ao carregar perfil"}
        />
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Perfil não encontrado
  if (status === "succeeded" && !profile) {
    return (
      <div className="container mx-auto p-4">
        <CustomNotification
          variant="info"
          title="Perfil não encontrado"
          description="Não foi possível encontrar seu perfil. Entre em contato com o suporte."
        />
      </div>
    );
  }

  // Agora sabemos que profile existe
  const doctorProfile = profile as DoctorProfile;

  // Verificar se o perfil está incompleto (só tem campos básicos preenchidos)
  const isProfileIncomplete =
    doctorProfile &&
    !doctorProfile.specialization &&
    !doctorProfile.department &&
    !doctorProfile.phoneNumber &&
    !user.name;

  const professionalInfoData = [
    { label: "CRM", value: doctorProfile?.crmNumber || "Não informado" },
    {
      label: "Especialização",
      value: doctorProfile?.specialization || "Não informado",
    },
    {
      label: "Departamento",
      value: doctorProfile?.department || "Não informado",
    },
    {
      label: "Anos de Experiência",
      value: doctorProfile?.yearsOfExperience
        ? `${doctorProfile.yearsOfExperience} anos`
        : "Não informado",
    },
    { label: "Telefone", value: doctorProfile?.phoneNumber || "Não informado" },
  ];

  const personalInfoData = [
    {
      label: "Nome",
      value: user?.name || "Não informado",
    },
    {
      label: "Data de Nascimento",
      value: doctorProfile?.dateOfBirth
        ? new Date(doctorProfile.dateOfBirth).toLocaleDateString("pt-BR")
        : "Não informado",
    },
  ];

  const handleSaveProfile = async (data: DoctorProfileFormData) => {
    try {
      await updateProfile(data);
      setIsDialogOpen(false);
      setActionNotification({
        variant: "success",
        title: "Perfil atualizado com sucesso!",
      });
    } catch (err: any) {
      setActionNotification({
        variant: "error",
        title: err.message || "Não foi possível salvar as alterações.",
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const mediaResponse = await uploadFile(file);
      await updatePictureMutation.mutateAsync(mediaResponse.url);
      setActionNotification({
        variant: "success",
        title: "Foto de perfil atualizada com sucesso!",
      });
    } catch (err: any) {
      setActionNotification({
        variant: "error",
        title: "Erro ao atualizar a foto",
      });
    }
  };

  const API_BASE_URL = "http://localhost:9000";

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Aviso para perfil incompleto */}
      {isProfileIncomplete && (
        <CustomNotification
          variant="info"
          title="Complete seu Perfil"
          description="Seu perfil foi criado com sucesso! Complete suas informações profissionais para uma experiência completa."
          dismissible={false}
        />
      )}

      {actionNotification && (
        <CustomNotification
          variant={actionNotification.variant}
          title={actionNotification.title}
          autoHide
          onDismiss={() => setActionNotification(null)}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* INÍCIO DA ALTERAÇÃO */}
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    doctorProfile?.profilePictureUrl
                      ? `${API_BASE_URL}${doctorProfile.profilePictureUrl}`
                      : undefined
                  }
                  alt="Foto do Doutor"
                />
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0).toUpperCase() || "D"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                disabled={updatePictureMutation.isPending}
              >
                <Edit className="h-3 w-3" />
                <span className="sr-only">Editar foto</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            {/* FIM DA ALTERAÇÃO */}

            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-2xl">
                Dr. {user?.name || "Nome não informado"}
              </CardTitle>
              <p className="text-muted-foreground">
                {doctorProfile?.specialization ||
                  "Especialização não informada"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                CRM: {doctorProfile?.crmNumber || "Não informado"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? "Salvando..." : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna da Esquerda */}
        <div className="space-y-8">
          <ProfileInfoTable
            title="Informações Pessoais"
            data={personalInfoData}
          />
          <ProfileInfoTable
            title="Informações Profissionais"
            data={professionalInfoData}
          />
        </div>

        {/* Coluna da Direita */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Biografia</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {doctorProfile?.biography || "Nenhuma biografia informada."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualificações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {doctorProfile?.qualifications ||
                "Nenhuma qualificação informada."}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditDoctorProfileDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={doctorProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
