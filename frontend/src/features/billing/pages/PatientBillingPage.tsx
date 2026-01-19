import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { billingService } from "@/services/billing";
import { InvoicesList } from "../components/InvoicesList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InsuranceProvider, Invoice } from "@/types/billing.types";

export default function PatientBillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  // State para form de seguro simples
  const [selectedProvider, setSelectedProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [invData, provData] = await Promise.all([
        billingService.getPatientInvoices(user!.id.toString()),
        billingService.getProviders(),
      ]);
      setInvoices(invData);
      setProviders(provData);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePay = async (id: string) => {
    setIsPaying(id);
    try {
      await billingService.payInvoice(id);
      toast.success("Pagamento realizado com sucesso!");
      loadData(); // Recarrega status
    } catch (error) {
      toast.error("Erro ao processar pagamento.");
    } finally {
      setIsPaying(null);
    }
  };

  const handleAddInsurance = async () => {
    if (!selectedProvider || !policyNumber)
      return toast.error("Preencha os dados do convênio");
    try {
      await billingService.registerInsurance(
        user!.id.toString(),
        Number(selectedProvider),
        policyNumber,
      );
      toast.success("Convênio vinculado!");
      // O ideal seria recarregar info do seguro aqui
    } catch (error) {
      toast.error("Erro ao vincular convênio");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Financeiro & Convênios</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Card de Convênio */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Meu Convênio</CardTitle>
            <CardDescription>Gerencie seu plano de saúde</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seguradora</Label>
              <Select
                onValueChange={setSelectedProvider}
                value={selectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} ({p.coveragePercentage * 100}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número da Carteirinha</Label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="000.000.000"
              />
            </div>
            <Button onClick={handleAddInsurance} className="w-full">
              Salvar Convênio
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Faturas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Faturas</CardTitle>
            <CardDescription>
              Pagamentos de consultas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoicesList
              invoices={invoices}
              onPay={handlePay}
              isPaying={isPaying}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
