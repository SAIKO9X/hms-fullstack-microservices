import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/utils";
import { DollarSign, Clock, CheckCircle } from "lucide-react";
import type { Invoice } from "@/types/billing.types";
import { BillingService } from "@/services";
import { StatCard } from "@/components/shared/StatCard";

export default function DoctorFinancePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const data = await BillingService.getDoctorInvoices(user!.id.toString());
      setInvoices(data);
    } catch (error) {
      console.error("Erro ao carregar finanças", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingRevenue = invoices
    .filter(
      (inv) => inv.status === "PENDING" || inv.status === "INSURANCE_PENDING",
    )
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const completedAppts = invoices.filter((inv) => inv.status === "PAID").length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Painel Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Receita Total Realizada"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          variant="green"
          description={`${completedAppts} consultas pagas`}
          loading={loading}
        />

        <StatCard
          title="Receita Pendente"
          value={formatCurrency(pendingRevenue)}
          icon={Clock}
          variant="yellow"
          description="Aguardando pagamento ou convênio"
          loading={loading}
        />

        <StatCard
          title="Consultas Faturadas"
          value={invoices.length}
          icon={CheckCircle}
          variant="blue"
          description="Total histórico"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Via Convênio</TableHead>
                <TableHead>Via Paciente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum registro.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(inv.insuranceCovered)}
                    </TableCell>
                    <TableCell>{formatCurrency(inv.patientPayable)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "PAID" ? "default" : "outline"}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
