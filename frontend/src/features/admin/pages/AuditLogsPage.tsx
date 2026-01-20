import { useState } from "react";
import { useAuditLogs } from "@/services/queries/admin-queries";
import { auditColumns } from "../components/audit/auditColumns";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
  const pageSize = 20;
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, isPlaceholderData } = useAuditLogs(
    page,
    pageSize,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground">
            Registro imutável de segurança e acessos do sistema (HIPAA/LGPD).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <CardTitle>Logs de Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="rounded-md bg-red-50 p-4 text-red-500">
              Erro ao carregar logs. Verifique se o serviço de Audit está
              online.
            </div>
          ) : (
            <>
              <DataTable columns={auditColumns} data={data?.content || []} />

              <div className="flex items-center justify-end space-x-2 py-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((old) => Math.max(0, old - 1))}
                  disabled={page === 0 || isLoading}
                >
                  Anterior
                </Button>
                <div className="text-sm font-medium">
                  Página {data?.number !== undefined ? data.number + 1 : 1} de{" "}
                  {data?.totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isPlaceholderData && data && !data.last) {
                      setPage((old) => old + 1);
                    }
                  }}
                  disabled={data?.last || isLoading || isPlaceholderData}
                >
                  Próximo
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
