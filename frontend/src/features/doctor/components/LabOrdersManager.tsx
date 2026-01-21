import { useState } from "react";
import { format } from "date-fns";
import {
  TestTube,
  Plus,
  Upload,
  CheckCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LabOrderForm } from "./LabOrderForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLabOrdersByAppointment,
  addLabResult,
} from "@/services/appointment";
import { uploadFile } from "@/services/media";
import { toast } from "sonner";

interface LabOrdersManagerProps {
  appointmentId: number;
  patientId: number;
}

export const LabOrdersManager = ({
  appointmentId,
  patientId,
}: LabOrdersManagerProps) => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    orderId: number;
    itemId: number;
  } | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["lab-orders", appointmentId],
    queryFn: () => getLabOrdersByAppointment(appointmentId),
  });

  const handleUploadResult = async () => {
    if (!selectedItem || !resultFile) return;

    try {
      setIsUploading(true);

      const mediaResponse = await uploadFile(resultFile);

      await addLabResult(selectedItem.orderId, selectedItem.itemId, {
        resultNotes: resultNotes,
        attachmentId: mediaResponse.id.toString(),
      });

      toast.success("Resultado anexado com sucesso!");
      setSelectedItem(null);
      setResultFile(null);
      setResultNotes("");
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar resultado.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading)
    return <div className="p-4 text-center">Carregando exames...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Exames Laboratoriais
            </CardTitle>
            <CardDescription>
              Gerencie os pedidos e resultados de exames
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Solicitar Exames</DialogTitle>
              </DialogHeader>
              <LabOrderForm
                appointmentId={appointmentId}
                patientId={patientId}
                onSuccess={() => {
                  setIsCreateOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
                  toast.success("Pedido criado com sucesso!");
                }}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {orders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido de exame para esta consulta.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {orders?.map((order: any) => (
                <AccordionItem key={order.id} value={`item-${order.id}`}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(order.orderDate),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </span>
                      </div>
                      <Badge
                        variant={
                          order.status === "COMPLETED" ? "default" : "outline"
                        }
                        className={
                          order.status === "COMPLETED" ? "bg-green-600" : ""
                        }
                      >
                        {order.status === "COMPLETED"
                          ? "Concluído"
                          : "Pendente"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid gap-2">
                        {order.labTestItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                          >
                            <div>
                              <p className="font-medium">{item.testName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.category}
                              </p>
                              {item.status === "COMPLETED" && (
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                  Resultado Disponível
                                </p>
                              )}
                            </div>

                            {item.status === "PENDING" ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedItem({
                                        orderId: order.id,
                                        itemId: item.id,
                                      })
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Lançar Resultado
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Anexar Resultado: {item.testName}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>
                                        Arquivo do Resultado (PDF/Imagem)
                                      </Label>
                                      <Input
                                        type="file"
                                        onChange={(e) =>
                                          setResultFile(
                                            e.target.files?.[0] || null,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Notas / Observações</Label>
                                      <Textarea
                                        value={resultNotes}
                                        onChange={(e) =>
                                          setResultNotes(e.target.value)
                                        }
                                        placeholder="Ex: Níveis dentro da normalidade..."
                                      />
                                    </div>
                                    <Button
                                      onClick={handleUploadResult}
                                      disabled={isUploading}
                                      className="w-full"
                                    >
                                      {isUploading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      )}
                                      Salvar Resultado
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button variant="ghost" size="sm" asChild>
                                {/* Link para baixar/ver o arquivo usando o attachmentId */}
                                <a
                                  href={`#`}
                                  target="_blank"
                                  className="text-blue-600"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver Laudo
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
