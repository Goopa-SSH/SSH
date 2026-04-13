const getHeatColor = (change) => {
  if (change === null || change === undefined) return "#1a1a1a";
  if (change > 8) return "#00FFAA";
  if (change > 5) return "rgba(0,255,170,0.85)";
  if (change > 3) return "rgba(0,255,170,0.6)";
  if (change > 1) return "rgba(0,255,170,0.35)";
  if (change > 0) return "rgba(0,255,170,0.18)";
  if (change > -1) return "rgba(255,59,48,0.18)";
  if (change > -3) return "rgba(255,59,48,0.35)";
  if (change > -5) return "rgba(255,59,48,0.6)";
  if (change > -8) return "rgba(255,59,48,0.85)";
  return "#FF3B30";
};

const getTextColor = (change) => {
  if (change === null || change === undefined) return "#737373";
  return Math.abs(change) > 5 ? "#050505" : "#FFFFFF";
};

const CELL_CONFIG = [
  { maxIndex: 3, span: "col-span-4 sm:col-span-3 lg:col-span-2 row-span-2", minH: "min-h-[100px]", nameSize: 16, pctSize: 14, priceSize: 10, showImage: true, showPrice: true },
  { maxIndex: 8, span: "col-span-3 sm:col-span-2 lg:col-span-2", minH: "min-h-[70px]", nameSize: 13, pctSize: 11, priceSize: 10, showImage: true, showPrice: true },
  { maxIndex: Infinity, span: "col-span-2 sm:col-span-1 lg:col-span-1", minH: "min-h-[50px]", nameSize: 11, pctSize: 10, priceSize: 0, showImage: false, showPrice: false },
];

const getCellConfig = (index) => CELL_CONFIG.find((c) => index < c.maxIndex);

const HeatmapCell = ({ crypto, index, currencySymbol, onClick }) => {
  const change = crypto.price_change_percentage_24h;
  const cfg = getCellConfig(index);
  const bg = getHeatColor(change);
  const textCol = getTextColor(change);

  return (
    <div
      className={`${cfg.span} ${cfg.minH} heatmap-cell`}
      style={{ backgroundColor: bg, color: textCol }}
      onClick={() => onClick(crypto)}
      data-testid={`heatmap-cell-${crypto.id}`}
    >
      {cfg.showImage && crypto.image && (
        <img src={crypto.image} alt="" className="w-5 h-5 rounded-full mb-1 opacity-80" />
      )}
      <span className="font-heading font-bold leading-none" style={{ fontSize: cfg.nameSize }}>
        {crypto.symbol.toUpperCase()}
      </span>
      <span className="font-mono font-semibold leading-none mt-0.5" style={{ fontSize: cfg.pctSize }}>
        {change !== null && change !== undefined ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : "--"}
      </span>
      {cfg.showPrice && (
        <span className="font-mono leading-none mt-0.5 opacity-70" style={{ fontSize: cfg.priceSize }}>
          {currencySymbol}
          {crypto.current_price >= 1
            ? crypto.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : crypto.current_price.toFixed(4)}
        </span>
      )}
    </div>
  );
};

const Legend = () => (
  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#737373]">
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-sm" style={{ background: "#FF3B30" }} />
      Baisse
    </div>
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-sm" style={{ background: "#262626" }} />
      Neutre
    </div>
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-sm" style={{ background: "#00FFAA" }} />
      Hausse
    </div>
  </div>
);

const SYMBOLS = { usd: "$", eur: "\u20AC", gbp: "\u00A3", jpy: "\u00A5", chf: "Fr" };

export const MarketHeatmap = ({ cryptoData, currency, onCryptoClick }) => {
  if (!cryptoData || cryptoData.length === 0) {
    return <div className="text-center py-12 text-[#737373]">Chargement des donnees...</div>;
  }

  const currencySymbol = SYMBOLS[currency] || "$";

  return (
    <div data-testid="market-heatmap">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">Heatmap du Marche</h2>
          <p className="text-[#737373] text-sm mt-1">Performance 24h par capitalisation</p>
        </div>
        <Legend />
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-px bg-[#262626] rounded-sm overflow-hidden">
        {cryptoData.slice(0, 40).map((crypto, index) => (
          <HeatmapCell
            key={crypto.id}
            crypto={crypto}
            index={index}
            currencySymbol={currencySymbol}
            onClick={onCryptoClick}
          />
        ))}
      </div>
    </div>
  );
};
