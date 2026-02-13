import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, CalendarDays, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useDoctorPatients } from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PatientSummary } from "@/types/doctor.types";
import { DataList } from "@/components/shared/DataList";
import type { ColumnDef } from "@tanstack/react-table";

const DoctorPatientCard = ({ patient }: { patient: PatientSummary }) => {
  const navigate = useNavigate();
  return (
    <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary h-full">
      <CardHeader className="pb-3 flex flex-row items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {patient.patientName.charAt(0)}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-lg truncate">
            {patient.patientName}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {patient.patientEmail}
          </p>
        </div>
        <Badge variant={patient.status === "ACTIVE" ? "default" : "outline"}>
          {patient.status === "ACTIVE" ? "Recorrente" : "Inativo"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Última Visita:</span>
          <div className="flex items-center gap-1 font-medium">
            <CalendarDays className="h-3 w-3" />
            {format(new Date(patient.lastAppointmentDate), "dd/MM/yy")}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de Consultas:</span>
          <Badge variant="secondary">{patient.totalAppointments}</Badge>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate(`/doctor/records/${patient.patientId}`)}
        >
          <History className="mr-2 h-4 w-4" />
          Ver Prontuário
        </Button>
      </CardContent>
    </Card>
  );
};

export const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading } = useDoctorPatients();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients =
    patients?.filter(
      (p: PatientSummary) =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const columns: ColumnDef<PatientSummary>[] = [
    {
      accessorKey: "patientName",
      header: "Paciente",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {row.original.patientName.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{row.original.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.patientEmail}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lastAppointmentDate",
      header: "Última Visita",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.lastAppointmentDate), "dd MMM yyyy", {
            locale: ptBR,
          })}
        </div>
      ),
    },
    {
      accessorKey: "totalAppointments",
      header: () => <div className="text-center">Frequência</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary" className="font-mono">
            {row.original.totalAppointments} consultas
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "default" : "outline"}
        >
          {row.original.status === "ACTIVE" ? "Recorrente" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/doctor/records/${row.original.patientId}`)
            }
          >
            <History className="mr-2 h-4 w-4" />
            Prontuário
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes que já passaram pelo seu atendimento.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataList
            data={filteredPatients}
            isLoading={isLoading}
            columns={columns}
            renderCard={(patient) => (
              <DoctorPatientCard key={patient.patientId} patient={patient} />
            )}
            emptyMessage="Sua lista de pacientes está vazia. Atendimentos realizados aparecerão aqui."
            toolbar={
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};
