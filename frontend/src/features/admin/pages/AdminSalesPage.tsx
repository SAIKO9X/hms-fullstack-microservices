import { useMemo, useState } from "react";
import { useSales } from "@/services/queries/pharmacy-queries";
import { DollarSign, Plus, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/features/admin/components/sales/columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ImportPrescriptionDialog } from "@/features/admin/components/sales/ImportPrescriptionDialog";

export const AdminSalesPage = () => {
  const navigate = useNavigate();
  const { data: sales, isLoading } = useSales();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const stats = useMemo(() => {
    if (!sales) return { totalRevenue: 0, totalSales: 0, uniqueCustomers: 0 };
    return {
      totalRevenue: sales.reduce((acc, sale) => acc + sale.totalAmount, 0),
      totalSales: sales.length,
      uniqueCustomers: new Set(sales.map((s) => s.patientId)).size,
    };
  }, [sales]);

  const handleImportSuccess = (data: any) => {
    setIsImportOpen(false);
    const saleId = data?.id || data;
    navigate(`/admin/sales/${saleId}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Vendas da Farmácia</h1>
          <p className="text-muted-foreground">
            Acompanhe o histórico de vendas e o faturamento.
          </p>
        </div>
        <Button asChild size="lg" className="text-secondary">
          <Link to="/admin/new-sale">
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                `R$ ${stats.totalRevenue.toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalSales}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Únicos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.uniqueCustomers
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sales || []} />
        </CardContent>
      </Card>

      <ImportPrescriptionDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
