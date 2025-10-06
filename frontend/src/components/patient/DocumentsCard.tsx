import { useState } from "react"; // 1. Importar o useState
import { useDeleteMedicalDocument } from "@/hooks/appointment-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router";
import { getDocumentIcon } from "@/lib/documentIcons";
import type { MedicalDocument } from "@/types/document.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = "http://localhost:9000";

interface DocumentsCardProps {
  documents: MedicalDocument[];
  isLoading: boolean;
  showViewAllButton?: boolean;
}

export const DocumentsCard = ({
  documents,
  isLoading,
  showViewAllButton = false,
}: DocumentsCardProps) => {
  const deleteMutation = useDeleteMedicalDocument();

  // Estado para controlar qual documento será excluído
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deleteMutation.mutate(docToDelete.id, {
        onSuccess: () => {
          // Limpa o estado após a exclusão
          setDocToDelete(null);
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Relatórios e Documentos</span>
          {showViewAllButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/documents">Ver Todos</Link>
            </Button>
          )}
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
            {documents.map((doc) => {
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Excluir documento"
                          // Ao clicar, definimos qual documento está em risco
                          onClick={() => setDocToDelete(doc)}
                          disabled={
                            deleteMutation.isPending &&
                            docToDelete?.id === doc.id
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Você tem a certeza?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O documento{" "}
                            <span className="font-semibold">
                              "{docToDelete?.documentName}"
                            </span>{" "}
                            será permanentemente apagado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDocToDelete(null)}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Apagar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
