import { useParams, Link } from "react-router";
import { usePatientById } from "@/hooks/profile-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MapPin,
  Droplet,
  AlertCircle,
  UserCircle,
  AlertTriangle,
} from "lucide-react";
import { BloodGroup, Gender } from "@/types/patient.types";

export const AdminPatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, isError } = usePatientById(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Carregando perfil do paciente...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="container mx-auto py-8">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">Erro ao carregar perfil</p>
              <p className="text-sm text-muted-foreground mt-2">
                Não foi possível encontrar os dados deste paciente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Perfil do Paciente</h1>
          <p className="text-muted-foreground">
            Visualização completa das informações médicas e pessoais
          </p>
        </div>
      </div>

      {/* Card de Informações Principais */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">CPF: {patient.cpf}</Badge>
                  {patient.bloodGroup && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      <Droplet className="h-3 w-3 mr-1" />
                      {BloodGroup[patient.bloodGroup]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.dateOfBirth && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Data de Nascimento
                  </p>
                  <p className="text-base font-semibold">
                    {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            )}

            {patient.gender && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <UserCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Gênero
                  </p>
                  <p className="text-base font-semibold">
                    {Gender[patient.gender]}
                  </p>
                </div>
              </div>
            )}

            {patient.phoneNumber && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </p>
                  <p className="text-base font-semibold">
                    {patient.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {patient.address && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Endereço
                  </p>
                  <p className="text-base font-semibold">{patient.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Contato de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.emergencyContactName && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nome do Contato
                  </p>
                  <p className="text-base font-semibold">
                    {patient.emergencyContactName}
                  </p>
                </div>
              </div>
            )}

            {patient.emergencyContactPhone && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Telefone de Emergência
                  </p>
                  <p className="text-base font-semibold">
                    {patient.emergencyContactPhone}
                  </p>
                </div>
              </div>
            )}

            {!patient.emergencyContactName &&
              !patient.emergencyContactPhone && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Nenhum contato de emergência cadastrado
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Alergias e Doenças Crônicas em uma linha */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Histórico de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Alergias</h4>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-orange-50 border-orange-200 text-orange-900"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma alergia registada.
                </p>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Doenças Crônicas</h4>
              {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases.map((disease, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 border-blue-200 text-blue-900"
                    >
                      {disease}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma doença crônica registada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button variant="outline" className="w-full">
              Ver Histórico Médico Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
