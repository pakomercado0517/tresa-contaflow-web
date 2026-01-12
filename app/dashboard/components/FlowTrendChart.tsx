"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

interface FlowTrendChartProps {
  data: Array<{
    mes: number;
    ingresos: number;
    gastos: number;
  }>;
}

export function FlowTrendChart({ data }: FlowTrendChartProps) {
  const [filter, setFilter] = useState<"ingresos" | "gastos" | "ambos">(
    "ambos"
  );

  // Transformar datos de API (mes numérico) a formato de gráfico (nombre de mes)
  const chartData = data.map((item) => ({
    fecha: MONTHS_SHORT[item.mes - 1],
    ingresos: item.ingresos,
    gastos: item.gastos,
  }));

  // Verificar si hay datos
  const hasData = data.some((item) => item.ingresos > 0 || item.gastos > 0);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tendencia de Flujo</h3>
          <div className="flex gap-2">
            <Button
              variant={filter === "ingresos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ingresos")}
              className={filter === "ingresos" ? "bg-primary" : ""}
            >
              Ingresos
            </Button>
            <Button
              variant={filter === "gastos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("gastos")}
              className={filter === "gastos" ? "bg-primary" : ""}
            >
              Gastos
            </Button>
            <Button
              variant={filter === "ambos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ambos")}
              className={filter === "ambos" ? "bg-primary" : ""}
            >
              Ambos
            </Button>
          </div>
        </div>

        <div className="h-80">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="fecha"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                {(filter === "ingresos" || filter === "ambos") && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#colorIngresos)"
                    />
                  </>
                )}
                {(filter === "gastos" || filter === "ambos") && (
                  <Line
                    type="monotone"
                    dataKey="gastos"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No hay datos disponibles para mostrar.
                <br />
                <span className="text-sm">
                  Sube tus primeras facturas y gastos para ver la tendencia.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

