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
  const abs = Math.abs(change);
  if (abs > 5) return "#050505";
  return "#FFFFFF";
};

const getCellSpan = (index) => {
  if (index < 3) return "col-span-4 sm:col-span-3 lg:col-span-2 row-span-2";
  if (index < 8) return "col-span-3 sm:col-span-2 lg:col-span-2";
  if (index < 20) return "col-span-2 sm:col-span-2 lg:col-span-1";
  return "col-span-2 sm:col-span-1 lg:col-span-1";
};

const getCellHeight = (index) => {
  if (index < 3) return "min-h-[100px]";
  if (index < 8) return "min-h-[70px]";
  return "min-h-[50px]";
};

export const MarketHeatmap = ({ cryptoData, currency, onCryptoClick }) => {
  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="text-center py-12 text-[#737373]">
        Chargement des donnees...
      </div>
    );
  }

  const currencySymbol = currency === "usd" ? "$" : "\u20AC";

  return (
    <div data-testid="market-heatmap">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Heatmap du Marche
          </h2>
          <p className="text-[#737373] text-sm mt-1">
            Performance 24h par capitalisation
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-px bg-[#262626] rounded-sm overflow-hidden">
        {cryptoData.slice(0, 40).map((crypto, index) => {
          const change = crypto.price_change_percentage_24h;
          const bg = getHeatColor(change);
          const textCol = getTextColor(change);

          return (
            <div
              key={crypto.id}
              className={`${getCellSpan(index)} ${getCellHeight(index)} heatmap-cell`}
              style={{ backgroundColor: bg, color: textCol }}
              onClick={() => onCryptoClick(crypto)}
              data-testid={`heatmap-cell-${crypto.id}`}
            >
              {index < 8 && crypto.image && (
                <img
                  src={crypto.image}
                  alt=""
                  className="w-5 h-5 rounded-full mb-1 opacity-80"
                />
              )}
              <span
                className="font-heading font-bold leading-none"
                style={{ fontSize: index < 3 ? 16 : index < 8 ? 13 : 11 }}
              >
                {crypto.symbol.toUpperCase()}
              </span>
              <span
                className="font-mono font-semibold leading-none mt-0.5"
                style={{ fontSize: index < 3 ? 14 : index < 8 ? 11 : 10 }}
              >
                {change !== null && change !== undefined
                  ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
                  : "--"}
              </span>
              {index < 8 && (
                <span
                  className="font-mono leading-none mt-0.5 opacity-70"
                  style={{ fontSize: 10 }}
                >
                  {currencySymbol}
                  {crypto.current_price >= 1
                    ? crypto.current_price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    : crypto.current_price.toFixed(4)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
