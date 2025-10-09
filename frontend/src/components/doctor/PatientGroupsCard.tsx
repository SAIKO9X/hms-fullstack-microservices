import { useDoctorPatientGroups } from "@/hooks/appointment-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const groupColors = [
  "bg-orange-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-amber-500",
];

export function PatientGroupsCard() {
  const { data: groups, isLoading } = useDoctorPatientGroups();

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Grupos de Pacientes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group, index) => (
              <div key={group.groupName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full ${
                    groupColors[index % groupColors.length]
                  } flex items-center justify-center text-white font-bold text-sm`}
                >
                  {group.groupName.charAt(0)}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium">{group.groupName}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {group.patientCount} Pacientes
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Users className="mx-auto h-8 w-8 mb-2" />
            <p>Grupos de pacientes aparecerão aqui.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
