import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, FolderOpen, UserPlus } from "lucide-react";
import { useDoctorPatients } from "@/services/queries/appointment-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PatientSummary } from "@/types/doctor.types";

export const DoctorRecordsPage = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading } = useDoctorPatients();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients?.filter((p: PatientSummary) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasPatients = patients && patients.length > 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Prontuários Médicos
        </h1>
        <p className="text-muted-foreground">
          Acesse o histórico clínico e documentos dos seus pacientes.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar prontuário por nome do paciente..."
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!hasPatients && !isLoading}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !hasPatients ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border rounded-lg bg-muted/10 border-dashed">
          <div className="p-4 bg-muted rounded-full">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Nenhum paciente atendido ainda
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Assim que você realizar seus primeiros atendimentos, os
              prontuários dos pacientes aparecerão aqui automaticamente.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients?.map((patient) => (
            <Card
              key={patient.patientId}
              className="hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/doctor/records/${patient.patientId}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{patient.patientName}</span>
                  <FolderOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{patient.totalAppointments} registros médicos</span>
                  </div>
                  <p className="text-xs pt-2">
                    Última atualização:{" "}
                    {new Date(patient.lastAppointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <Button className="w-full mt-4" variant="secondary">
                  Abrir Prontuário
                </Button>
              </CardContent>
            </Card>
          ))}

          {filteredPatients?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Nenhum prontuário encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
