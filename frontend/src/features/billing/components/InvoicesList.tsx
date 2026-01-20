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
import { cn, formatCurrency } from "@/utils/utils";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import type { Invoice } from "@/types/billing.types";

interface InvoicesListProps {
  invoices: Invoice[];
  onPay: (id: string) => void;
  isPaying: string | null;
}

export function InvoicesList({ invoices, onPay, isPaying }: InvoicesListProps) {
  const getStatusBadge = (inv: Invoice) => {
    if (inv.status === "PAID") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Concluído</Badge>
      );
    }

    if (inv.patientPaidAt && inv.status === "INSURANCE_PENDING") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Aguardando Convênio
        </Badge>
      );
    }

    if (inv.status === "CANCELLED") {
      return <Badge variant="destructive">Cancelado</Badge>;
    }

    if (!inv.patientPaidAt && inv.patientPayable > 0) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Pagamento Pendente
        </Badge>
      );
    }

    return <Badge variant="outline">{inv.status}</Badge>;
  };

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="hidden md:table-cell">Convênio</TableHead>
            <TableHead>Sua Parte</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center h-32 text-muted-foreground"
              >
                Nenhuma fatura encontrada.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => {
              const needsPatientPayment =
                !inv.patientPaidAt && inv.patientPayable > 0;
              const isFullyPaid = inv.status === "PAID";

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {new Date(inv.issuedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatCurrency(inv.totalAmount)}
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-green-600 font-medium">
                    {inv.insuranceCovered > 0 ? (
                      <span>-{formatCurrency(inv.insuranceCovered)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-bold",
                          inv.patientPaidAt
                            ? "text-green-600 line-through decoration-1 opacity-70"
                            : "text-black",
                        )}
                      >
                        {formatCurrency(inv.patientPayable)}
                      </span>
                      {inv.patientPaidAt && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Pago
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(inv)}</TableCell>

                  <TableCell className="text-right">
                    {needsPatientPayment && inv.status !== "CANCELLED" ? (
                      <Button
                        size="sm"
                        onClick={() => onPay(inv.id)}
                        disabled={!!isPaying}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isPaying === inv.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Pagar {formatCurrency(inv.patientPayable)}
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        {isFullyPaid
                          ? "Liquidado"
                          : inv.patientPaidAt
                            ? "Pago"
                            : "-"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
