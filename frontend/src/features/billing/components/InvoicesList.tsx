import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/utils";
import { Loader2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/billing.types";

interface InvoicesListProps {
  invoices: Invoice[];
  onPay: (id: string) => void;
  isPaying: string | null;
}

export function InvoicesList({ invoices, onPay, isPaying }: InvoicesListProps) {
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "PENDING":
        return <Badge variant="destructive">Pendente</Badge>;
      case "INSURANCE_PENDING":
        return <Badge variant="secondary">Processando Convênio</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Cobertura Convênio</TableHead>
            <TableHead>A Pagar (Paciente)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                Nenhuma fatura encontrada.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  {new Date(inv.issuedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                <TableCell className="text-green-600">
                  -{formatCurrency(inv.insuranceCovered)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(inv.patientPayable)}
                </TableCell>
                <TableCell>{getStatusBadge(inv.status)}</TableCell>
                <TableCell>
                  {inv.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => onPay(inv.id)}
                      disabled={!!isPaying}
                    >
                      {isPaying === inv.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Pagar Agora"
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
