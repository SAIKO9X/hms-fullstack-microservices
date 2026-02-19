"use client";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

interface StatusPieChartProps {
  data: {
    SCHEDULED?: number;
    COMPLETED?: number;
    CANCELED?: number;
  };
}

// Configuração correta com cores específicas
const chartConfig = {
  SCHEDULED: {
    label: "Agendadas",
    color: "hsl(var(--chart-1))",
  },
  COMPLETED: {
    label: "Concluídas",
    color: "hsl(var(--chart-2))",
  },
  CANCELED: {
    label: "Canceladas",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function StatusPieChart({ data }: StatusPieChartProps) {
  const [colors, setColors] = useState({
    SCHEDULED: "#000",
    COMPLETED: "#000",
    CANCELED: "#000",
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);

    setColors({
      SCHEDULED: style.getPropertyValue("--chart-1").trim(),
      COMPLETED: style.getPropertyValue("--chart-2").trim(),
      CANCELED: style.getPropertyValue("--chart-3").trim(),
    });
  }, []);

  const chartData = [
    {
      status: "SCHEDULED",
      value: data.SCHEDULED || 0,
      fill: colors.SCHEDULED,
    },
    {
      status: "COMPLETED",
      value: data.COMPLETED || 0,
      fill: colors.COMPLETED,
    },
    {
      status: "CANCELED",
      value: data.CANCELED || 0,
      fill: colors.CANCELED,
    },
  ].filter((item) => item.value > 0);

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Análise de Consultas</CardTitle>
        <CardDescription>Distribuição total por status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0">
        {totalValue > 0 ? (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="status" />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground text-xs font-bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Estatísticas abaixo do gráfico */}
            <div className="flex w-full items-center justify-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors.SCHEDULED }}
                />
                <span className="text-muted-foreground">
                  <strong
                    className="font-semibold"
                    style={{ color: colors.SCHEDULED }}
                  >
                    {data.SCHEDULED || 0}
                  </strong>{" "}
                  <span style={{ color: colors.SCHEDULED }}>Agendadas</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors.COMPLETED }}
                />
                <span className="text-muted-foreground">
                  <strong
                    className="font-semibold"
                    style={{ color: colors.COMPLETED }}
                  >
                    {data.COMPLETED || 0}
                  </strong>{" "}
                  <span style={{ color: colors.COMPLETED }}>Concluídas</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors.CANCELED }}
                />
                <span className="text-muted-foreground">
                  <strong
                    className="font-semibold"
                    style={{ color: colors.CANCELED }}
                  >
                    {data.CANCELED || 0}
                  </strong>{" "}
                  <span style={{ color: colors.CANCELED }}>Canceladas</span>
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>Nenhuma consulta para exibir.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
