import { useState, useMemo } from "react";
import { useMyDocuments } from "@/services/queries/appointment-queries";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  FileText,
  File as FileIcon,
  Download,
  Search,
  Calendar,
  Filter,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppSelector } from "@/store/hooks";
import { CustomNotification } from "../../../components/notifications/CustomNotification";
import { DocumentsCard } from "../components/DocumentsCard";
import { AddDocumentDialog } from "../components/AddDocumentDialog";

// Mapeamento de tipos de documento para labels e cores
const documentTypeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  BLOOD_REPORT: {
    label: "Exame de Sangue",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: FileIcon,
  },
  XRAY: {
    label: "Raio-X",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: FileIcon,
  },
  PRESCRIPTION: {
    label: "Receita Médica",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: FileText,
  },
  MRI: {
    label: "Ressonância Magnética",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: FileIcon,
  },
  CT_SCAN: {
    label: "Tomografia",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: FileIcon,
  },
  ULTRASOUND: {
    label: "Ultrassom",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: FileIcon,
  },
  DEFAULT: {
    label: "Documento",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: FileIcon,
  },
};

export const PatientDocumentsPage = () => {
  const {
    data: documents,
    isLoading,
    refetch: refetchDocuments,
  } = useMyDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const { user } = useAppSelector((state) => state.auth);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  // Filtrar e ordenar documentos
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    let filtered = documents;

    // Filtro por tipo
    if (filterType !== "ALL") {
      filtered = filtered.filter((doc) => doc.documentType === filterType);
    }

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.documentName.toLowerCase().includes(search)
      );
    }

    // Ordenar por data mais recente primeiro
    return filtered.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents, searchTerm, filterType]);

  // Obter tipos únicos de documentos para o filtro
  const documentTypes = useMemo(() => {
    if (!documents) return [];
    const types = new Set(documents.map((doc) => doc.documentType));
    return Array.from(types);
  }, [documents]);

  // Estatísticas
  const stats = useMemo(() => {
    if (!documents) return { total: 0, thisMonth: 0, lastUpload: null };

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = documents.filter(
      (doc) => new Date(doc.uploadedAt) >= thisMonthStart
    ).length;

    return {
      total: documents.length,
      thisMonth,
      lastUpload:
        documents.length > 0
          ? documents.reduce((latest, doc) =>
              new Date(doc.uploadedAt) > new Date(latest.uploadedAt)
                ? doc
                : latest
            ).uploadedAt
          : null,
    };
  }, [documents]);

  const handleDocumentSuccess = () => {
    setNotification({
      message: "Documento enviado com sucesso!",
      variant: "success",
    });
    refetchDocuments();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {notification && (
        <CustomNotification
          variant={notification.variant}
          title={notification.message}
          onDismiss={() => setNotification(null)}
          autoHide
          autoHideDelay={4000}
        />
      )}

      {/* Header */}
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/patient/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Documentos Médicos</h1>
              <p className="text-muted-foreground mt-1">
                Todos os seus exames, relatórios e documentos em um só lugar
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDocOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Documento
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {!isLoading && documents && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total de Documentos
                </p>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Último Upload</p>
                <Download className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.lastUpload
                  ? format(new Date(stats.lastUpload), "dd/MM/yy", {
                      locale: ptBR,
                    })
                  : "-"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {documentTypeConfig[type]?.label || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredDocuments.length > 0
              ? `${filteredDocuments.length} documento${
                  filteredDocuments.length !== 1 ? "s" : ""
                } encontrado${filteredDocuments.length !== 1 ? "s" : ""}`
              : "Documentos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Seus documentos médicos, exames e relatórios aparecerão aqui
                após serem enviados pelos seus médicos.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Tente ajustar os filtros ou o termo de busca.
              </p>
            </div>
          ) : (
            <DocumentsCard
              documents={filteredDocuments}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {user && (
        <AddDocumentDialog
          open={isAddDocOpen}
          onOpenChange={setIsAddDocOpen}
          onSuccess={handleDocumentSuccess}
          patientId={user.id}
        />
      )}
    </div>
  );
};
