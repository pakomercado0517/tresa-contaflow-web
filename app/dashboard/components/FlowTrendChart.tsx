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

interface FlowTrendChartProps {
  data?: Array<{
    fecha: string;
    ingresos: number;
    gastos: number;
  }>;
}

export function FlowTrendChart({ data }: FlowTrendChartProps) {
  const [filter, setFilter] = useState<"ingresos" | "gastos" | "ambos">(
    "ambos"
  );

  const chartData =
    data ||
    Array.from({ length: 30 }, (_, i) => ({
      fecha: `${i + 1} Oct`,
      ingresos: Math.floor(Math.random() * 50000) + 20000,
      gastos: Math.floor(Math.random() * 30000) + 10000,
    }));

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
        </div>
      </div>
    </Card>
  );
}

