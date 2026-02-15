import {
  Home,
  UserCheck,
  Pill,
  Archive,
  ShoppingCart,
  Store,
  Landmark,
  ShieldCheck,
  Calendar,
  CalendarClock,
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  UserPen,
  UserRoundSearch,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  restricted?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// --- Configuração Admin ---
export const adminNavGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: Home },
      { title: "Utilizadores", url: "/admin/users", icon: UserCheck },
    ],
  },
  {
    label: "Financeiro",
    items: [{ title: "Convênios", url: "/admin/insurance", icon: Landmark }],
  },
  {
    label: "Farmácia",
    items: [
      { title: "Medicamentos", url: "/admin/medicines", icon: Pill },
      { title: "Inventário", url: "/admin/inventory", icon: Archive },
      { title: "Vendas", url: "/admin/sales", icon: ShoppingCart },
      { title: "Vendas Direta", url: "/admin/new-sale", icon: Store },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Auditoria", url: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },
];

// --- Configuração Doctor ---
export const doctorNavGroups: NavGroup[] = [
  {
    label: "Geral",
    items: [
      {
        title: "Dashboard",
        url: "/doctor/dashboard",
        icon: Home,
        restricted: true,
      },
    ],
  },
  {
    label: "Agenda",
    items: [
      {
        title: "Minha Agenda",
        url: "/doctor/appointments",
        icon: Calendar,
        restricted: true,
      },
      {
        title: "Disponibilidade",
        url: "/doctor/availability",
        icon: CalendarClock,
        restricted: true,
      },
    ],
  },
  {
    label: "Atendimento",
    items: [
      {
        title: "Meus Pacientes",
        url: "/doctor/patients",
        icon: Users,
        restricted: true,
      },
      {
        title: "Prontuários",
        url: "/doctor/records",
        icon: FileText,
        restricted: true,
      },
    ],
  },
  {
    label: "Comunicação",
    items: [
      {
        title: "Mensagens",
        url: "/doctor/messages",
        icon: MessageSquare,
        restricted: true,
      },
    ],
  },
  {
    label: "Minha Conta",
    items: [
      {
        title: "Financeiro",
        url: "/doctor/finance",
        icon: DollarSign,
        restricted: true,
      },
      {
        title: "Meu Perfil",
        url: "/doctor/profile",
        icon: UserPen,
        restricted: false,
      },
    ],
  },
];

// --- Configuração Patient ---
export const patientNavGroups: NavGroup[] = [
  {
    label: "Geral",
    items: [
      {
        title: "Dashboard",
        url: "/patient/dashboard",
        icon: Home,
        restricted: true,
      },
    ],
  },
  {
    label: "Agendamentos",
    items: [
      {
        title: "Minhas Consultas",
        url: "/patient/appointments",
        icon: Calendar,
        restricted: true,
      },
      {
        title: "Encontrar Médicos",
        url: "/patient/doctors",
        icon: UserRoundSearch,
        restricted: true,
      },
    ],
  },
  {
    label: "Registros de Saúde",
    items: [
      {
        title: "Histórico Médico",
        url: "/patient/medical-history",
        icon: History,
        restricted: true,
      },
      {
        title: "Prescrições",
        url: "/patient/prescriptions",
        icon: Pill,
        restricted: true,
      },
      {
        title: "Documentos",
        url: "/patient/documents",
        icon: FileText,
        restricted: true,
      },
    ],
  },
  {
    label: "Comunicação",
    items: [
      {
        title: "Mensagens",
        url: "/patient/messages",
        icon: MessageSquare,
        restricted: true,
      },
    ],
  },
  {
    label: "Minha Conta",
    items: [
      {
        title: "Meu Perfil",
        url: "/patient/profile",
        icon: UserPen,
        restricted: false,
      },
    ],
  },
];
