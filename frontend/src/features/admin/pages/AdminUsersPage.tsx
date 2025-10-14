import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List, Search, Phone, Calendar } from "lucide-react";
import {
  useAllPatients,
  useAllDoctors,
} from "@/services/queries/profile-queries";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import {
  doctorColumns,
  patientColumns,
} from "@/features/admin/components/users/patientColumns";
import { useNavigate } from "react-router";
import { CreateUserDialog } from "../components/users/CreateUserDialog";

const PatientCard = ({ patient }: { patient: PatientProfile }) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {patient.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                CPF: {patient.cpf || "Não informado"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {patient.dateOfBirth && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(patient.dateOfBirth), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        )}
        {patient.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.phoneNumber}</span>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate(`/admin/users/patient/${patient.id}`)}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

// Componente de Card para Médicos (com melhorias de nulidade)
const DoctorCard = ({ doctor }: { doctor: DoctorProfile }) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {doctor.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
              <p className="text-sm text-muted-foreground">
                CRM: {doctor.crmNumber || "Não informado"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {doctor.specialization && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Especialidade:</span>
            <span className="text-muted-foreground">
              {doctor.specialization}
            </span>
          </div>
        )}
        {doctor.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{doctor.phoneNumber}</span>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate(`/admin/users/doctor/${doctor.id}`)}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export const AdminUsersPage = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchPatients, setSearchPatients] = useState("");
  const [searchDoctors, setSearchDoctors] = useState("");

  const { data: patients, isLoading: isLoadingPatients } = useAllPatients();
  const { data: doctors, isLoading: isLoadingDoctors } = useAllDoctors();

  const [isCreateUserOpen, setCreateUserOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    const searchTerm = searchPatients.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(searchTerm) ||
        patient.cpf?.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
    );
  }, [patients, searchPatients]);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    const searchTerm = searchDoctors.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(searchTerm) ||
        doctor.crmNumber?.toLowerCase().includes(searchTerm) ||
        doctor.specialization?.toLowerCase().includes(searchTerm)
    );
  }, [doctors, searchDoctors]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">
            Visualize todos os pacientes e médicos do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patients">
            Pacientes ({filteredPatients?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="doctors">
            Médicos ({filteredDoctors?.length || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="patients" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou CPF..."
                value={searchPatients}
                onChange={(e) => setSearchPatients(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {isLoadingPatients ? (
            <div className="text-center py-10 text-muted-foreground">
              Carregando pacientes...
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients?.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          ) : (
            <DataTable columns={patientColumns} data={filteredPatients || []} />
          )}
        </TabsContent>
        <TabsContent value="doctors" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, CRM ou especialidade..."
                value={searchDoctors}
                onChange={(e) => setSearchDoctors(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {isLoadingDoctors ? (
            <div className="text-center py-10 text-muted-foreground">
              Carregando médicos...
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors?.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <DataTable columns={doctorColumns} data={filteredDoctors || []} />
          )}
        </TabsContent>
      </Tabs>

      <CreateUserDialog
        isOpen={isCreateUserOpen}
        onOpenChange={setCreateUserOpen}
      />
    </div>
  );
};
