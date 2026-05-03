"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";

// =============================
// TYPES
// =============================

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used inside ChartContainer");
  return ctx;
}

// =============================
// CONTAINER
// =============================

export function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div data-chart={chartId} className={cn("w-full h-full", className)}>
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// =============================
// TOOLTIP (FIX TOTAL)
// =============================

export function ChartTooltipContent(props: any) {
  const { config } = useChart();

  const {
    active,
    payload,
    label,
    className,
    hideLabel = false,
  } = props;

  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={cn(
        "bg-white border rounded p-2 shadow text-xs",
        className
      )}
    >
      {!hideLabel && <div className="font-bold mb-1">{label}</div>}

      {payload.map((item: any, index: number) => {
        const key = item.dataKey || item.name;
        const cfg = config[key];

        return (
          <div key={index} className="flex justify-between gap-2">
            <span>{cfg?.label || item.name}</span>
            <span>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================
// LEGEND
// =============================

export function ChartLegendContent({
  payload,
  className,
}: {
  payload?: any[];
  className?: string;
}) {
  const { config } = useChart();

  if (!payload) return null;

  return (
    <div className={cn("flex gap-4", className)}>
      {payload.map((item: any, index: number) => {
        const key = item.dataKey;
        const cfg = config[key];

        return (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded"
              style={{ background: item.color }}
            />
            <span>{cfg?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
}