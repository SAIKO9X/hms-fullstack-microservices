import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDailyActivity } from "@/services/queries/admin-queries";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  appointments: {
    label: "Consultas",
    color: "hsl(var(--chart-1))",
  },
  newPatients: {
    label: "Novos Pacientes",
    color: "hsl(var(--chart-2))",
  },
};

export const ActivityChart = () => {
  const { data: chartData, isLoading } = useDailyActivity();

  const formattedData = chartData?.map((item) => ({
    ...item,
    date: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          Novos pacientes e consultas nos últimos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={formattedData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="appointments"
                fill="var(--color-appointments)"
                radius={4}
              />
              <Bar
                dataKey="newPatients"
                fill="var(--color-newPatients)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
