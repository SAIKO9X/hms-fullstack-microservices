import { useParams, Link } from "react-router";
import { useSales } from "@/hooks/pharmacy-queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    amount
  );

export const AdminSaleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const saleId = Number(id);
  const { data: sales, isLoading } = useSales();

  const sale = sales?.find((s) => s.id === saleId);

  if (isLoading) return <div>Carregando detalhes da venda...</div>;
  if (!sale) return <div>Venda não encontrada!</div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link
        to="/admin/sales"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Todas as Vendas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Venda #{sale.id}</CardTitle>
            <CardDescription>
              Realizada em{" "}
              {format(new Date(sale.saleDate), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">Detalhes do Comprador</h3>
            <p>
              <strong>Nome:</strong> {sale.buyerName}
            </p>
            <p>
              <strong>Contato:</strong> {sale.buyerContact}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>ID do Paciente:</strong> #{sale.patientId}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(sale.totalAmount)}
            </p>
            <p className="text-sm text-muted-foreground">
              Valor Total da Venda
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Lote(s)</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Preço Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.medicineName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.batchNo}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
