import { useState, useMemo, useRef, useEffect } from "react";

const MARGIN = { top: 15, right: 15, bottom: 35, left: 75 };

const fmtPrice = (p) => {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
};

export const CandlestickChart = ({ data }) => {
  const containerRef = useRef(null);
  const [svgW, setSvgW] = useState(720);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 100) setSvgW(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const SVG_H = 380;
  const chartW = svgW - MARGIN.left - MARGIN.right;
  const chartH = SVG_H - MARGIN.top - MARGIN.bottom;

  const { minP, maxP, candleW, gridLines } = useMemo(() => {
    if (!data?.length) return { minP: 0, maxP: 1, candleW: 6, gridLines: [] };
    const lo = Math.min(...data.map((d) => d.low));
    const hi = Math.max(...data.map((d) => d.high));
    const pad = (hi - lo) * 0.1 || 1;
    const mn = lo - pad;
    const mx = hi + pad;
    const w = Math.max(5, Math.min(20, (chartW / data.length) * 0.65));
    const lines = Array.from({ length: 6 }, (_, i) => mn + ((mx - mn) / 5) * i);
    return { minP: mn, maxP: mx, candleW: w, gridLines: lines };
  }, [data, chartW]);

  const yScale = (price) => MARGIN.top + chartH - ((price - minP) / (maxP - minP || 1)) * chartH;

  if (!data?.length) {
    return <div className="flex items-center justify-center h-[380px] text-[#737373] text-sm">Chargement des donnees...</div>;
  }

  const slotW = chartW / data.length;
  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div ref={containerRef} className="relative w-full" data-testid="candlestick-chart">
      <svg width={svgW} height={SVG_H} style={{ display: "block" }} onMouseLeave={() => setHoverIdx(null)}>
        <rect width={svgW} height={SVG_H} fill="#080808" rx={3} />

        {/* Grid + Y labels */}
        {gridLines.map((price, i) => {
          const y = yScale(price);
          return (
            <g key={`grid-${i}`}>
              <line x1={MARGIN.left} y1={y} x2={svgW - MARGIN.right} y2={y} stroke="#1f1f1f" strokeWidth={0.8} />
              <text x={MARGIN.left - 8} y={y + 3} textAnchor="end" fill="#888" fontSize={10} fontFamily="JetBrains Mono">{fmtPrice(price)}</text>
            </g>
          );
        })}

        {/* Candles */}
        {data.map((c, i) => {
          const x = MARGIN.left + i * slotW + (slotW - candleW) / 2;
          const cx = x + candleW / 2;
          const bull = c.close >= c.open;
          const color = bull ? "#00FF99" : "#FF4444";
          const top = yScale(Math.max(c.open, c.close));
          const bot = yScale(Math.min(c.open, c.close));
          const bH = Math.max(bot - top, 2);

          return (
            <g key={`c-${i}`}>
              <line x1={cx} y1={yScale(c.high)} x2={cx} y2={yScale(c.low)} stroke={color} strokeWidth={1.5} />
              <rect x={x} y={top} width={candleW} height={bH} fill={color} />
              <rect x={MARGIN.left + i * slotW} y={MARGIN.top} width={slotW} height={chartH} fill="transparent" onMouseEnter={() => setHoverIdx(i)} style={{ cursor: "crosshair" }} />
            </g>
          );
        })}

        {/* X labels */}
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 7)) === 0).map((c) => {
          const idx = data.indexOf(c);
          const x = MARGIN.left + idx * slotW + slotW / 2;
          return (
            <text key={`x-${c.timestamp}`} x={x} y={SVG_H - 8} textAnchor="middle" fill="#888" fontSize={9} fontFamily="JetBrains Mono">
              {new Date(c.timestamp).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}
            </text>
          );
        })}

        {/* Crosshair */}
        {hoverIdx !== null && (
          <line x1={MARGIN.left + hoverIdx * slotW + slotW / 2} y1={MARGIN.top} x2={MARGIN.left + hoverIdx * slotW + slotW / 2} y2={MARGIN.top + chartH} stroke="#555" strokeWidth={0.8} strokeDasharray="4 2" />
        )}
      </svg>

      {hovered && (
        <div className="absolute top-3 right-3 bg-[#111] border border-[#333] rounded px-3 py-2 text-xs z-50">
          <div className="text-[#999] mb-1.5 text-[10px]">{new Date(hovered.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
            <span className="text-[#999]">O</span><span className="text-white">{fmtPrice(hovered.open)}</span>
            <span className="text-[#999]">H</span><span className="text-[#00FF99]">{fmtPrice(hovered.high)}</span>
            <span className="text-[#999]">L</span><span className="text-[#FF4444]">{fmtPrice(hovered.low)}</span>
            <span className="text-[#999]">C</span><span className="text-white">{fmtPrice(hovered.close)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
