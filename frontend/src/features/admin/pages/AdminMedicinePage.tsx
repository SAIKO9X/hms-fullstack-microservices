import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useMedicines } from "@/services/queries/pharmacy-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Medicine } from "@/types/medicine.types";
import { columns } from "@/features/admin/components/medicines/columns";
import { AddEditMedicineDialog } from "@/features/admin/components/medicines/AddEditMedicineDialog";
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
import { cn } from "@/utils/utils";

type StockFilter = "all" | "lowStock";

export const AdminMedicinesPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const {
    data: medicinesPage,
    isLoading,
    error,
  } = useMedicines(page, pageSize);

  const medicinesList = medicinesPage?.content || [];

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setIsDialogOpen(true);
  };

  // Filtro medicines baseado em searchTerm e stockFilter
  const filteredMedicines = useMemo(() => {
    if (!medicinesList) return [];

    return medicinesList.filter((medicine) => {
      // Filtro de busca por texto
      const searchMatch =
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Filtro de estoque
      if (stockFilter === "lowStock") {
        return (medicine.totalStock || 0) < 10;
      }

      return true;
    });
  }, [medicinesList, searchTerm, stockFilter]);

  const stats = {
    total: medicinesPage?.totalElements || medicinesList.length || 0,
    categories: new Set(medicinesList.map((m) => m.category)).size || 0,
    lowStock: medicinesList.filter((m) => (m.totalStock || 0) < 10).length || 0,
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Erro ao carregar medicamentos
            </CardTitle>
            <CardDescription>
              Não foi possível carregar a lista de medicamentos. Tente
              novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Gerenciar Medicamentos
            </h1>
            <p className="text-muted-foreground">
              Adicione, edite e visualize os medicamentos do sistema
              farmacêutico.
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-primary hover:bg-primary/90 shadow-sm text-secondary"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Medicamento
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Medicamentos
              </CardTitle>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                medicamentos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.categories
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                diferentes categorias
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo (Pág)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-500/50"
                >
                  Atenção
                </Badge>
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.lowStock}
              </div>
              <p className="text-xs text-muted-foreground">nesta página</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, fabricante ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 px-4">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {stockFilter !== "all" && (
                      <Badge variant="secondary" className="ml-2">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Command>
                    <CommandList>
                      <CommandGroup heading="Filtrar por Estoque">
                        {[
                          { value: "all", label: "Todos" },
                          { value: "lowStock", label: "Estoque Baixo" },
                        ].map((option) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() =>
                              setStockFilter(option.value as StockFilter)
                            }
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                stockFilter === option.value
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
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Mostrando {filteredMedicines.length} de {stats.total}{" "}
                medicamentos
              </span>
              {filteredMedicines.length !== stats.total && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-auto p-1 text-xs"
                >
                  Limpar filtro
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Nenhum medicamento encontrado
              </h3>
              <p className="text-sm text-muted-foreground/70">
                {searchTerm
                  ? "Tente ajustar sua pesquisa ou limpar o filtro."
                  : "Adicione o primeiro medicamento para começar."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns({ onEdit: handleEdit })}
                data={filteredMedicines}
              />

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
                  Página {page + 1} de {medicinesPage?.totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((old) =>
                      !medicinesPage || old >= medicinesPage.totalPages - 1
                        ? old
                        : old + 1
                    )
                  }
                  disabled={
                    !medicinesPage ||
                    page >= medicinesPage.totalPages - 1 ||
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

      <AddEditMedicineDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        medicine={selectedMedicine}
      />
    </div>
  );
};
