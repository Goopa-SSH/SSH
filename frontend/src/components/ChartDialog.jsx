import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CandlestickChart } from "@/components/CandlestickChart";

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#0A0A0A",
  border: "1px solid #262626",
  borderRadius: "2px",
  fontFamily: "JetBrains Mono",
  fontSize: 12,
};
const CHART_LABEL_STYLE = { color: "#737373" };
const CHART_ITEM_STYLE = { color: "#007AFF" };

const PERIODS = [
  { label: "24h", val: 1 },
  { label: "7j", val: 7 },
  { label: "30j", val: 30 },
  { label: "1an", val: 365 },
];

const CHART_MODES = [
  { label: "Ligne", value: "line" },
  { label: "Chandelier", value: "candle" },
];

export const ChartDialog = ({
  open,
  onOpenChange,
  selectedCrypto,
  chartData,
  ohlcData,
  chartDays,
  onChangeDays,
  onChangeMode,
  chartMode,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="chart-dialog">
        <DialogHeader>
          <DialogTitle className="text-white font-heading">
            {selectedCrypto?.name} - Graphique
          </DialogTitle>
          <DialogDescription className="text-[#737373]">
            Evolution du prix sur {chartDays} jour{chartDays > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {PERIODS.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => onChangeDays(opt.val)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                    chartDays === opt.val
                      ? "bg-[#007AFF] text-white"
                      : "bg-[#111111] text-[#737373] hover:text-white hover:bg-[#262626]"
                  }`}
                  data-testid={`chart-period-${opt.val}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-[#111111] border border-[#262626] rounded-sm p-0.5">
              {CHART_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onChangeMode(mode.value)}
                  className={`px-3 py-1 text-xs font-body rounded-sm transition-colors ${
                    chartMode === mode.value
                      ? "bg-[#007AFF] text-white"
                      : "text-[#737373] hover:text-white"
                  }`}
                  data-testid={`chart-mode-${mode.value}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {chartMode === "candle" ? (
            <CandlestickChart data={ohlcData} />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="time" stroke="#737373" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#737373" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_LABEL_STYLE} itemStyle={CHART_ITEM_STYLE} />
                <Area type="monotone" dataKey="price" stroke="#007AFF" strokeWidth={2} fill="url(#chartGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
