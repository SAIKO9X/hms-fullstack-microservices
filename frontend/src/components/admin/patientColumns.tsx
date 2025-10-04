import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";

// Colunas para Pacientes
export const patientColumns: ColumnDef<PatientProfile>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {row.getValue<string>("name").charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data de Nascimento <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue<string>("dateOfBirth");
      if (!date) return <span className="text-muted-foreground">-</span>;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.getValue<string>("phoneNumber");
      return phone || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "bloodGroup",
    header: "Tipo Sanguíneo",
    cell: ({ row }) => {
      const bloodGroup = row.getValue<string>("bloodGroup");
      if (!bloodGroup) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          {bloodGroup}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gênero",
    cell: ({ row }) => {
      const gender = row.getValue<string>("gender");
      const genderLabels: Record<string, string> = {
        MALE: "Masculino",
        FEMALE: "Feminino",
        OTHER: "Outro",
      };
      return gender ? (
        genderLabels[gender] || gender
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => console.log("Ver perfil", patient.id)}
            >
              Ver Perfil Completo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Ver histórico", patient.id)}
            >
              Histórico Médico
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Editar", patient.id)}>
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Colunas para Médicos
export const doctorColumns: ColumnDef<DoctorProfile>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {row.getValue<string>("name").charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium">Dr. {row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "crmNumber",
    header: "CRM",
  },
  {
    accessorKey: "specialization",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Especialidade <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const spec = row.getValue<string>("specialization");
      if (!spec) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {spec}
        </Badge>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Departamento",
    cell: ({ row }) => {
      const dept = row.getValue<string>("department");
      return dept || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.getValue<string>("phoneNumber");
      return phone || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "yearsOfExperience",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Experiência <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const years = row.getValue<number>("yearsOfExperience");
      if (!years) return <span className="text-muted-foreground">-</span>;
      return `${years} anos`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => console.log("Ver perfil", doctor.id)}
            >
              Ver Perfil Completo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Ver agenda", doctor.id)}
            >
              Ver Agenda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Editar", doctor.id)}>
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
