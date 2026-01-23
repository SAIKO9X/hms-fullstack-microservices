import { useState } from "react";
import {
  useDeleteMedicalDocument,
  useDocumentsByPatientId,
} from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Trash2,
  Activity,
  Bone,
  Pill,
  Scan,
  Files,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router";
import { DocumentType, type MedicalDocument } from "@/types/document.types";
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

const TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.BLOOD_REPORT]: "Exame de Sangue",
  [DocumentType.XRAY]: "Raio-X",
  [DocumentType.PRESCRIPTION]: "Receita Médica",
  [DocumentType.MRI]: "Ressonância",
  [DocumentType.CT_SCAN]: "Tomografia",
  [DocumentType.ULTRASOUND]: "Ultrassom",
  [DocumentType.OTHER]: "Outro Documento",
};

const TYPE_ICONS: Record<DocumentType, any> = {
  [DocumentType.BLOOD_REPORT]: {
    icon: Activity,
    color: "text-red-500 bg-red-100",
  },
  [DocumentType.XRAY]: { icon: Bone, color: "text-slate-600 bg-slate-200" },
  [DocumentType.PRESCRIPTION]: {
    icon: Pill,
    color: "text-blue-500 bg-blue-100",
  },
  [DocumentType.MRI]: { icon: Scan, color: "text-indigo-500 bg-indigo-100" },
  [DocumentType.CT_SCAN]: {
    icon: Scan,
    color: "text-orange-500 bg-orange-100",
  },
  [DocumentType.ULTRASOUND]: {
    icon: Activity,
    color: "text-teal-500 bg-teal-100",
  },
  [DocumentType.OTHER]: { icon: Files, color: "text-gray-500 bg-gray-100" },
};

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
      <CardHeader className={patientId ? "px-0 pt-0" : ""}>
        <CardTitle className="flex items-center justify-between text-base">
          {!patientId && <span>Relatórios e Documentos</span>}
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
              const typeConfig =
                TYPE_ICONS[doc.documentType] || TYPE_ICONS[DocumentType.OTHER];
              const Icon = typeConfig.icon;
              const label = TYPE_LABELS[doc.documentType] || "Documento";

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-md ${typeConfig.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="font-medium text-sm truncate"
                        title={doc.documentName}
                      >
                        {doc.documentName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium">
                          {label}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(doc.uploadedAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a
                        href={
                          doc.mediaUrl.startsWith("http")
                            ? doc.mediaUrl
                            : `${API_BASE_URL}${doc.mediaUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Baixar Documento"
                      >
                        <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </Button>
                    {!patientId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              Tem a certeza que deseja excluir{" "}
              <strong>{docToDelete?.documentName}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
