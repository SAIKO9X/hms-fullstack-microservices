import {
  useDeleteMedicalDocument,
  useMyDocuments,
} from "@/hooks/appointment-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router";
import { getDocumentIcon } from "@/lib/documentIcons";

const API_BASE_URL = "http://localhost:9000";

export const DocumentsCard = () => {
  const { data: documents, isLoading } = useMyDocuments();
  const deleteMutation = useDeleteMedicalDocument();

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem a certeza que quer apagar o documento "${doc.documentName}"?`
      )
    ) {
      deleteMutation.mutate(doc.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Relatórios e Documentos</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patient/documents">Ver Todos</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Os seus documentos e resultados de exames aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mostra apenas os 4 documentos mais recentes no dashboard */}
            {documents.slice(0, 4).map((doc) => {
              const { icon: Icon, colorClass } = getDocumentIcon(
                doc.documentName
              );

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold truncate">
                        {doc.documentName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Enviado em{" "}
                        {format(new Date(doc.uploadedAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary"
                      asChild
                    >
                      <a
                        href={`${API_BASE_URL}${doc.mediaUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Excluir documento"
                      onClick={handleDelete} // Adicione o onClick
                      disabled={deleteMutation.isPending} // Desative enquanto apaga
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
