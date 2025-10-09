import { useState } from "react";
import { useDoctorAppointmentDetails } from "@/services/queries/appointment-queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Link } from "react-router";
import { Calendar, Clock } from "lucide-react";
import type { AppointmentDetail } from "@/types/appointment.types";

type FilterType = "today" | "week" | "month";

export function UpcomingAppointments() {
  const [filter, setFilter] = useState<FilterType>("month");
  const { data: appointments, isLoading } = useDoctorAppointmentDetails(filter);

  const upcomingAppointments =
    appointments
      ?.filter((app) => app.status === "SCHEDULED")
      .sort(
        (a, b) =>
          parseISO(a.appointmentDateTime).getTime() -
          parseISO(b.appointmentDateTime).getTime()
      ) || [];

  const filterConfig = {
    today: { title: "Hoje", description: "para hoje" },
    week: { title: "Esta Semana", description: "para esta semana" },
    month: { title: "Este Mês", description: "para este mês" },
  };

  return (
    <Card className="lg:col-span-2 h-full shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl">Próximas Consultas</CardTitle>
            <CardDescription className="mt-1">
              Você tem {upcomingAppointments.length} consultas agendadas{" "}
              {filterConfig[filter].description}.
            </CardDescription>
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {(["today", "week", "month"] as FilterType[]).map((label) => (
              <button
                key={label}
                onClick={() => setFilter(label)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filter === label
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/50"
                }`}
              >
                {filterConfig[label].title}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((app: AppointmentDetail) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {app.patientName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{app.patientName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {format(
                        parseISO(app.appointmentDateTime),
                        "dd/MM 'às' HH:mm"
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Link to={`/doctor/appointments/${app.id}`}>Detalhes</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">
              Nenhuma consulta agendada
            </p>
            <p className="text-xs text-muted-foreground">
              Não há agendamentos para{" "}
              {filterConfig[filter].title.toLowerCase()}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
