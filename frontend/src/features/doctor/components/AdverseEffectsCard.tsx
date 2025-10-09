import { useAdverseEffectReports } from "@/services/queries/appointment-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, MessageSquareWarning } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdverseEffectsCard() {
  const { data: reports, isLoading } = useAdverseEffectReports();

  const unreviewedReports =
    reports?.filter((report) => report.status === "REPORTED") || [];

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Alertas de Pacientes</CardTitle>
            <CardDescription>
              Relatórios de efeitos adversos recentes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : unreviewedReports.length > 0 ? (
          <div className="space-y-3">
            {unreviewedReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-lg bg-muted/50 border border-dashed border-amber-500/50"
              >
                <p className="text-sm font-medium truncate">
                  {report.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reportado há{" "}
                  {formatDistanceToNow(new Date(report.reportedAt), {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquareWarning className="mx-auto h-8 w-8 mb-2" />
            <p>Nenhum alerta novo.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
