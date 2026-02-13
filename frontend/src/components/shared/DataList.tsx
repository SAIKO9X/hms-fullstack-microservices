import { useState } from "react";
import { LayoutGrid, List, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@tanstack/react-table";

interface DataListProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  renderCard: (item: T) => React.ReactNode;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
}

export function DataList<T>({
  data,
  columns,
  renderCard,
  isLoading,
  toolbar,
  emptyMessage = "Nenhum registro encontrado.",
}: DataListProps<T>) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex-1">{toolbar}</div>

        <div className="flex items-center gap-2 self-end sm:self-auto bg-muted/50 p-1 rounded-lg border">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("cards")}
            title="Visualização em Cards"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("table")}
            title="Visualização em Lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/10">
          <div className="p-3 bg-primary/10 rounded-full mb-3">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-200">
          {data.map((item, index) => (
            <div key={index}>{renderCard(item)}</div>
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </div>
  );
}
