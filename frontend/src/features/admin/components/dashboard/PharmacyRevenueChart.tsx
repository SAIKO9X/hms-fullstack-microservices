import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPharmacyStats } from "@/services/pharmacy";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import type { PharmacyFinancialStats } from "@/types/stats.types";

export function PharmacyRevenueChart() {
  const [stats, setStats] = useState<PharmacyFinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPharmacyStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas da farmácia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Receita da Farmácia</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Receita da Farmácia</CardTitle>
          <CardDescription>Não foi possível carregar os dados.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // converter data string para formato legível se necessário
  const chartData = stats.dailyBreakdown.map((item) => {
    const dateObj = parseLocalDate(item.date);

    return {
      date: dateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: item.totalAmount,
      fullDate: item.date,
    };
  });

  console.log("Dados do Gráfico:", chartData);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Receita da Farmácia (30 dias)</CardTitle>
        <CardDescription>
          Receita Total:{" "}
          <span className="font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(stats.totalRevenueLast30Days)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value),
                  "Receita",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
