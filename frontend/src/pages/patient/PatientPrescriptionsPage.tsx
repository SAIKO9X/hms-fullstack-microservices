import { useMyPrescriptionsHistory } from "@/hooks/appointment-queries";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pill, Calendar, FileText, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PatientPrescriptionsPage = () => {
  const { data: prescriptions, isLoading } = useMyPrescriptionsHistory();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/patient/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Minhas Prescrições</h1>
            <p className="text-muted-foreground mt-1">
              Histórico completo de todos os seus tratamentos médicos
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      {!isLoading && prescriptions && prescriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total de Prescrições
                </p>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{prescriptions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Medicamentos Prescritos
                </p>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {prescriptions.reduce((acc, p) => acc + p.medicines.length, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Última Prescrição
                </p>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {format(new Date(prescriptions[0].createdAt), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de prescrições */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Histórico de Prescrições</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !prescriptions || prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma prescrição encontrada
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Você ainda não possui prescrições médicas registradas no
                sistema. Elas aparecerão aqui após suas consultas.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {prescriptions.map((p) => (
                <AccordionItem key={p.id} value={`item-${p.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">
                            {format(
                              new Date(p.createdAt),
                              "dd 'de' MMMM 'de' yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(p.createdAt), "HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto mr-2">
                        {p.medicines.length}{" "}
                        {p.medicines.length === 1
                          ? "medicamento"
                          : "medicamentos"}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-4">
                    <div className="space-y-4 pl-4">
                      {/* Lista de medicamentos */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Medicamentos Prescritos
                        </h4>
                        {p.medicines.map((med, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                          >
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <Pill className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-semibold text-base">
                                {med.name}
                              </p>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <strong>Dosagem:</strong> {med.dosage}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <strong>Frequência:</strong> {med.frequency}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <strong>Duração:</strong> {med.duration} dias
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notas adicionais */}
                      {p.notes && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-lg">
                          <div className="flex gap-2">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                                Observações do Médico
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {p.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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
