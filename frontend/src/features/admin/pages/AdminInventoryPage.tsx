import { useState, useMemo } from "react";
import {
  Plus,
  Archive,
  Search,
  Filter,
  CheckCircle,
  Check,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useInventory,
  useDeleteInventoryItem,
} from "@/services/queries/pharmacy-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MedicineInventory } from "@/types/medicine.types";
import { columns } from "@/features/admin/components/inventory/columns";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { AddEditInventoryDialog } from "@/features/admin/components/inventory/AddEditInventoryDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { InventoryDetailDialog } from "@/features/admin/components/inventory/InventoryDetailDialog";

type StatusFilter = "all" | "expiring" | "expired" | "lowStock" | "depleted";

export const AdminInventoryPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<MedicineInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const {
    data: inventoryPage,
    isLoading,
    error,
  } = useInventory(page, pageSize);
  const deleteInventoryMutation = useDeleteInventoryItem();
  const inventoryList = inventoryPage?.content || [];
  const handleViewDetails = (inventoryItem: MedicineInventory) => {
    setSelectedInventory(inventoryItem);
    setIsDetailOpen(true);
  };

  const filteredInventory = useMemo(() => {
    if (!inventoryList) return [];

    const now = new Date();
    const thirtyDaysFromNow = new Date(new Date().setDate(now.getDate() + 30));

    return inventoryList.filter((item) => {
      // Filtro de busca por texto
      const searchMatch =
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Filtro por status
      switch (statusFilter) {
        case "expiring":
          const expiryDate = new Date(item.expiryDate);
          return expiryDate < thirtyDaysFromNow && expiryDate > now;
        case "expired":
          return new Date(item.expiryDate) < now;
        case "lowStock":
          return item.quantity > 0 && item.quantity < 10;
        case "depleted":
          return item.quantity === 0;
        case "all":
        default:
          return true;
      }
    });
  }, [inventoryList, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!inventoryList)
      return { totalItems: 0, nearExpiry: 0, inStock: 0, lowStock: 0 };
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return {
      totalItems: inventoryPage?.totalElements || inventoryList.length,
      nearExpiry: inventoryList.filter(
        (item) =>
          new Date(item.expiryDate) < thirtyDaysFromNow &&
          new Date(item.expiryDate) > now
      ).length,
      inStock: inventoryList.reduce((acc, item) => acc + item.quantity, 0),
      lowStock: inventoryList.filter(
        (item) => item.quantity > 0 && item.quantity < 10
      ).length,
    };
  }, [inventoryList, inventoryPage]);

  const handleEdit = (inventoryItem: MedicineInventory) => {
    setSelectedInventory(inventoryItem);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedInventory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (inventoryItem: MedicineInventory) => {
    if (
      window.confirm(
        `Tem certeza de que deseja excluir o lote ${inventoryItem.batchNo}? Esta ação não pode ser desfeita.`
      )
    ) {
      await deleteInventoryMutation.mutateAsync(inventoryItem.id, {
        onSuccess: () => {
          setNotification({
            message: "Item de inventário excluído com sucesso!",
            variant: "success",
          });
        },
        onError: (err) => {
          setNotification({
            message: `Erro ao excluir: ${err.message}`,
            variant: "error",
          });
        },
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <CustomNotification
          variant="error"
          title="Erro ao carregar inventário"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {notification && (
        <CustomNotification
          variant={notification.variant}
          title={notification.message}
          onDismiss={() => setNotification(null)}
          autoHide
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Gerenciar Inventário
            </h1>
            <p className="text-muted-foreground">
              Controle os lotes de medicamentos, validades e quantidades em
              estoque.
            </p>
          </div>
          <Button className="text-secondary" onClick={handleAddNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao Estoque
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total em Estoque (Pág)
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.inStock.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                unidades nesta página
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Registros
              </CardTitle>
              <Archive className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.totalItems
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                lotes totais no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por medicamento ou número do lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-11 px-4">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <Command>
                  <CommandList>
                    <CommandGroup heading="Filtrar por Status">
                      {[
                        { value: "all", label: "Todos" },
                        { value: "expiring", label: "Vencendo em breve" },
                        { value: "expired", label: "Vencido" },
                        { value: "lowStock", label: "Estoque baixo" },
                        { value: "depleted", label: "Esgotado" },
                      ].map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() =>
                            setStatusFilter(option.value as StatusFilter)
                          }
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              statusFilter === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Nenhum item encontrado
              </h3>
              <p className="text-sm text-muted-foreground/80">
                {searchTerm
                  ? "Tente ajustar sua pesquisa ou limpar o filtro."
                  : "Adicione o primeiro item ao inventário para começar."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns({
                  onEdit: handleEdit,
                  onDelete: handleDelete,
                  onViewDetails: handleViewDetails,
                })}
                data={filteredInventory}
              />

              {/* Controles de Paginação */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((old) => Math.max(0, old - 1))}
                  disabled={page === 0 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                  Página {page + 1} de {inventoryPage?.totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((old) =>
                      !inventoryPage || old >= inventoryPage.totalPages - 1
                        ? old
                        : old + 1
                    )
                  }
                  disabled={
                    !inventoryPage ||
                    page >= inventoryPage.totalPages - 1 ||
                    isLoading
                  }
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditInventoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        inventory={selectedInventory}
      />

      <InventoryDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        inventoryItem={selectedInventory}
      />
    </div>
  );
};
