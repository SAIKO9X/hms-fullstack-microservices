import { useState } from "react";
import {
  useDeleteMedicalDocument,
  useDocumentsByPatientId,
} from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router";
import { getDocumentIcon } from "@/utils/documentIcons";
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
} from "@/components/ui/alert-dialog";

const API_BASE_URL = "http://localhost:9000";

interface DocumentsCardProps {
  documents?: MedicalDocument[];
  isLoading?: boolean;
  showViewAllButton?: boolean;
  patientId?: number;
}

export const DocumentsCard = ({
  documents: propsDocuments,
  isLoading: propsIsLoading,
  showViewAllButton = false,
  patientId,
}: DocumentsCardProps) => {
  // Lógica Híbrida: Se tiver patientId, busca os dados. Se não, usa as props.
  const { data: fetchedDocs, isLoading: isFetching } = useDocumentsByPatientId(
    patientId,
    0,
    5,
    !!patientId,
  );

  const documents = patientId ? fetchedDocs?.content : propsDocuments;
  const isLoading = patientId ? isFetching : propsIsLoading;

  const deleteMutation = useDeleteMedicalDocument();
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deleteMutation.mutate(docToDelete.id, {
        onSuccess: () => setDocToDelete(null),
      });
    }
  };

  return (
    <Card className="border-0 shadow-none">
      {" "}
      <CardHeader className={patientId ? "px-0 pt-0" : ""}>
        <CardTitle className="flex items-center justify-between text-base">
          {!patientId && <span>Relatórios e Documentos</span>}{" "}
          {showViewAllButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/documents">Ver Todos</Link>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={patientId ? "px-0" : ""}>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum documento disponível.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const { icon: Icon, colorClass } = getDocumentIcon(
                doc.documentName,
              );

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-muted rounded-md">
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-sm truncate">
                        {doc.documentName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(doc.uploadedAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      asChild
                    >
                      <a
                        href={`${API_BASE_URL}${doc.mediaUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    </Button>
                    {!patientId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <AlertDialog
        open={!!docToDelete}
        onOpenChange={() => setDocToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
