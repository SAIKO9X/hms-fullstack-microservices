import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  CalendarDays,
  History,
  ArrowUpDown,
  Filter,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useDoctorPatients } from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PatientSummary } from "@/types/doctor.types";

export const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading } = useDoctorPatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PatientSummary;
    direction: "asc" | "desc";
  }>({ key: "lastAppointmentDate", direction: "desc" });

  const handleSort = (key: keyof PatientSummary) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const filteredPatients = patients
    ?.filter(
      (p: PatientSummary) =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: PatientSummary, b: PatientSummary) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const hasPatients = patients && patients.length > 0;

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
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                disabled={!hasPatients && !isLoading}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    disabled={!hasPatients}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Ordenar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleSort("lastAppointmentDate")}
                  >
                    Mais Recentes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("totalAppointments")}
                  >
                    Mais Frequentes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("patientName")}>
                    Ordem Alfabética
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !hasPatients ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">
                Sua lista de pacientes está vazia
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Os pacientes que você atender aparecerão automaticamente nesta
                lista para acompanhamento futuro.
              </p>
            </div>
          ) : !filteredPatients?.length ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-md">
              Nenhum paciente encontrado para "{searchTerm}".
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Paciente</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("lastAppointmentDate")}
                      >
                        Última Visita
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("totalAppointments")}
                      >
                        Frequência
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.patientId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {patient.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {patient.patientEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {format(
                            new Date(patient.lastAppointmentDate),
                            "dd MMM yyyy",
                            { locale: ptBR }
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {patient.totalAppointments} consultas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            patient.status === "ACTIVE" ? "default" : "outline"
                          }
                        >
                          {patient.status === "ACTIVE"
                            ? "Recorrente"
                            : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/doctor/records/${patient.patientId}`)
                          }
                        >
                          <History className="mr-2 h-4 w-4" />
                          Prontuário
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
