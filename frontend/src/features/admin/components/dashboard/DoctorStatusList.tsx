import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorsStatus } from "@/services/queries/admin-queries";
import { Briefcase } from "lucide-react";

export const DoctorStatusList = () => {
  const { data: doctors, isLoading } = useDoctorsStatus();

  return (
    <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Estado dos Médicos</CardTitle>
            <CardDescription className="text-sm mt-1">
              Disponibilidade dos médicos em tempo real
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))
          : doctors?.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group border border-transparent hover:border-border"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-semibold text-primary border-2 border-primary/20 group-hover:scale-110 transition-transform">
                    {doctor.name.split(" ")[0].charAt(0)}
                    {doctor.name.split(" ")[1]?.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                      doctor.status === "Disponível"
                        ? "bg-green-500"
                        : "bg-yellow-500 animate-pulse"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {doctor.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {doctor.specialization}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    doctor.status === "Disponível"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      doctor.status === "Disponível"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  {doctor.status}
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
};
