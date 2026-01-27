import { ProfileMenu } from "@/components/header/ProfileMenu";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types/auth.types";
import {
  useDoctorDashboardStats,
  useNextAppointment,
  useUniquePatientsCount,
} from "@/services/queries/appointment-queries";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DoctorStats = () => {
  const { data: stats } = useDoctorDashboardStats();
  const { data: uniquePatients } = useUniquePatientsCount();

  return (
    <div className="hidden lg:flex items-center gap-4 mr-6">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
          {stats?.appointmentsTodayCount || 0} Consultas Hoje
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-300">
          {uniquePatients || 0} Pacientes Totais
        </span>
      </div>
    </div>
  );
};

const PatientStats = () => {
  const { data: nextAppointment } = useNextAppointment();

  if (!nextAppointment) return null;

  return (
    <div className="hidden lg:flex items-center gap-4 mr-6">
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          Próxima:{" "}
          {format(
            new Date(nextAppointment.appointmentDateTime),
            "dd/MM 'às' HH:mm",
            { locale: ptBR },
          )}
        </span>
      </div>
    </div>
  );
};

export const Header = ({ onLogout }: { onLogout: () => void }) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-4 flex-1 justify-end">
      {user?.role === UserRole.DOCTOR && <DoctorStats />}
      {user?.role === UserRole.PATIENT && <PatientStats />}

      <NotificationsPopover />

      <ProfileMenu onLogout={onLogout} />
    </div>
  );
};
