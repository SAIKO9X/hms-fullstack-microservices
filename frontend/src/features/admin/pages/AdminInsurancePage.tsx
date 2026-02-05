import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Loader2, RefreshCw } from "lucide-react";
import type { Invoice } from "@/types/billing.types";
import { BillingService } from "@/services";

export function AdminInsurancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getPendingInsuranceInvoices();
      setInvoices(data);
    } catch (error) {
      toast.error("Erro ao carregar faturas pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleProcessPayment = async (id: string) => {
    try {
      setProcessingId(id);
      await BillingService.processInsurancePayment(id);
      toast.success("Repasse de convênio processado com sucesso!");
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (error) {
      toast.error("Erro ao processar repasse.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Convênios
        </h1>
        <p className="text-muted-foreground">
          Gerencie repasses e pagamentos pendentes das seguradoras.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Repasses Pendentes</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvoices}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturas Aguardando Seguradora</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum repasse pendente no momento.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>ID Fatura</TableHead>
                  <TableHead>Paciente (ID)</TableHead>
                  <TableHead>Valor Coberto</TableHead>
                  <TableHead>Status Paciente</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {inv.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{inv.patientId}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(inv.insuranceCovered)}
                    </TableCell>
                    <TableCell>
                      {inv.patientPaidAt ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50"
                        >
                          Pago
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200 bg-orange-50"
                        >
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleProcessPayment(inv.id)}
                        disabled={!!processingId}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === inv.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Dar Baixa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
