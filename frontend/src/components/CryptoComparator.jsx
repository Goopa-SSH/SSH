import { useState, useMemo } from "react";
import { X, Search, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber } from "@/utils/formatters";

const MAX_COMPARE = 3;

const STAT_ROWS = [
  { key: "current_price", label: "Prix actuel", format: "price" },
  { key: "price_change_percentage_24h", label: "Variation 24h", format: "percent" },
  { key: "market_cap", label: "Capitalisation", format: "number" },
  { key: "total_volume", label: "Volume 24h", format: "number" },
  { key: "high_24h", label: "Plus haut 24h", format: "price" },
  { key: "low_24h", label: "Plus bas 24h", format: "price" },
  { key: "market_cap_rank", label: "Rang", format: "rank" },
  { key: "circulating_supply", label: "Supply en circulation", format: "supply" },
];

const COMPARE_COLORS = ["#007AFF", "#00FFAA", "#FFD60A"];

const formatStat = (value, format, currencySymbol) => {
  if (value === null || value === undefined) return "--";
  switch (format) {
    case "price":
      return formatPrice(value, currencySymbol);
    case "number":
      return formatNumber(value, currencySymbol);
    case "percent":
      return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
    case "rank":
      return `#${value}`;
    case "supply":
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      return value.toLocaleString();
    default:
      return String(value);
  }
};

const MiniBar = ({ values, colors }) => {
  const max = Math.max(...values.filter((v) => v !== null && v !== undefined));
  if (max === 0) return null;
  return (
    <div className="flex items-end gap-1 h-6">
      {values.map((v, i) => {
        const ratio = v != null && max > 0 ? v / max : 0;
        return (
          <div
            key={`bar-${colors[i]}`}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${Math.max(ratio * 100, 4)}%`,
              backgroundColor: colors[i],
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
};

const SearchDropdown = ({ cryptoData, onSelect, selected, placeholder }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      query.length > 0
        ? cryptoData
            .filter(
              (c) =>
                !selected.some((s) => s.id === c.id) &&
                (c.name.toLowerCase().includes(query.toLowerCase()) ||
                  c.symbol.toLowerCase().includes(query.toLowerCase()))
            )
            .slice(0, 8)
        : [],
    [cryptoData, query, selected]
  );

  const handleSelect = (crypto) => {
    onSelect(crypto);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="bg-[#111111] border-[#262626] text-white pl-9 rounded-sm text-sm placeholder:text-[#737373]"
          data-testid="comparator-search-input"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0A0A0A] border border-[#262626] rounded-sm overflow-hidden shadow-lg max-h-[240px] overflow-y-auto">
          {filtered.map((crypto) => (
            <button
              key={crypto.id}
              onMouseDown={() => handleSelect(crypto)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#111111] transition-colors text-left"
              data-testid={`comparator-option-${crypto.id}`}
            >
              <img src={crypto.image} alt="" className="w-5 h-5 rounded-full" />
              <span className="text-white text-sm font-heading font-bold">{crypto.name}</span>
              <span className="text-[#737373] text-xs font-mono uppercase">{crypto.symbol}</span>
              <span className="ml-auto text-[#737373] text-xs font-mono">#{crypto.market_cap_rank}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectedChip = ({ crypto, color, onRemove }) => (
  <div
    className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-[#262626] rounded-sm"
    style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    data-testid={`comparator-chip-${crypto.id}`}
  >
    <img src={crypto.image} alt="" className="w-5 h-5 rounded-full" />
    <span className="text-white text-sm font-heading font-bold">{crypto.name}</span>
    <span className="text-[#737373] text-xs font-mono uppercase">{crypto.symbol}</span>
    <button
      onClick={() => onRemove(crypto.id)}
      className="ml-auto p-0.5 hover:bg-[#262626] rounded-sm transition-colors"
      data-testid={`comparator-remove-${crypto.id}`}
    >
      <X size={12} className="text-[#737373]" />
    </button>
  </div>
);

const EmptyState = () => (
  <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-16 text-center">
    <BarChart3 className="w-12 h-12 mx-auto text-[#262626] mb-4" />
    <p className="text-white font-heading font-bold text-lg">Comparateur de Cryptos</p>
    <p className="text-[#737373] text-sm mt-2 max-w-md mx-auto">
      Selectionnez 2 ou 3 cryptomonnaies pour comparer leurs performances, capitalisations et volumes cote a cote.
    </p>
  </div>
);

const WinnerBadge = () => (
  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#007AFF]/15 text-[#007AFF] px-1.5 py-0.5 rounded-sm">
    meilleur
  </span>
);

export const CryptoComparator = ({ cryptoData, currencySymbol }) => {
  const [selected, setSelected] = useState([]);

  const addCrypto = (crypto) => {
    if (selected.length < MAX_COMPARE && !selected.some((s) => s.id === crypto.id)) {
      setSelected((prev) => [...prev, crypto]);
    }
  };

  const removeCrypto = (id) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  };

  const getBestIndex = (key, format) => {
    if (selected.length < 2) return -1;
    const values = selected.map((c) => c[key]);
    if (values.some((v) => v === null || v === undefined)) return -1;

    if (format === "percent") {
      const maxVal = Math.max(...values);
      return values.indexOf(maxVal);
    }
    if (key === "market_cap_rank") {
      const minVal = Math.min(...values);
      return values.indexOf(minVal);
    }
    if (format === "price" || format === "number" || format === "supply") {
      const maxVal = Math.max(...values);
      return values.indexOf(maxVal);
    }
    return -1;
  };

  return (
    <div data-testid="crypto-comparator">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">Comparer les Cryptos</h2>
          <p className="text-[#737373] text-sm mt-1">
            {selected.length}/{MAX_COMPARE} selectionnees
          </p>
        </div>
        {selected.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setSelected([])}
            className="bg-[#0A0A0A] border-[#262626] text-[#A3A3A3] hover:text-white hover:bg-[#111111] rounded-sm text-xs"
            data-testid="comparator-clear-btn"
          >
            Tout effacer
          </Button>
        )}
      </div>

      {/* Search + Selected chips */}
      <div className="space-y-3 mb-6">
        {selected.length < MAX_COMPARE && (
          <SearchDropdown
            cryptoData={cryptoData}
            onSelect={addCrypto}
            selected={selected}
            placeholder={
              selected.length === 0
                ? "Rechercher une crypto a comparer..."
                : `Ajouter une crypto (${MAX_COMPARE - selected.length} restant${MAX_COMPARE - selected.length > 1 ? "s" : ""})...`
            }
          />
        )}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((crypto, i) => (
              <SelectedChip
                key={crypto.id}
                crypto={crypto}
                color={COMPARE_COLORS[i]}
                onRemove={removeCrypto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      {selected.length < 2 ? (
        <EmptyState />
      ) : (
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm overflow-hidden">
          {/* Header row with crypto cards */}
          <div className="grid gap-px bg-[#262626]" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-[#050505] p-4" />
            {selected.map((crypto, i) => (
              <div key={crypto.id} className="bg-[#050505] p-4 text-center" data-testid={`comparator-header-${crypto.id}`}>
                <div
                  className="w-1 h-8 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: COMPARE_COLORS[i] }}
                />
                <img src={crypto.image} alt="" className="w-10 h-10 rounded-full mx-auto mb-2" />
                <p className="font-heading font-bold text-white text-sm">{crypto.name}</p>
                <p className="text-[#737373] font-mono text-xs uppercase">{crypto.symbol}</p>
              </div>
            ))}
          </div>

          {/* Stat rows */}
          {STAT_ROWS.map((row, rowIdx) => {
            const bestIdx = getBestIndex(row.key, row.format);
            const showBar = row.format === "number" || row.format === "supply";

            return (
              <div
                key={row.key}
                className="grid gap-px bg-[#262626]"
                style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}
                data-testid={`comparator-row-${row.key}`}
              >
                <div className={`bg-[#0A0A0A] px-4 py-3 flex items-center ${rowIdx % 2 === 0 ? "" : "bg-[#080808]"}`}>
                  <span className="text-[10px] text-[#737373] uppercase tracking-widest font-mono">
                    {row.label}
                  </span>
                </div>
                {selected.map((crypto, colIdx) => {
                  const value = crypto[row.key];
                  const isBest = bestIdx === colIdx && selected.length >= 2;
                  const isPercent = row.format === "percent";
                  const isPositive = isPercent && value > 0;
                  const isNegative = isPercent && value < 0;

                  return (
                    <div
                      key={crypto.id}
                      className={`bg-[#0A0A0A] px-4 py-3 text-center ${rowIdx % 2 === 0 ? "" : "bg-[#080808]"}`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {isPercent && value !== null && value !== undefined && (
                          isPositive
                            ? <ArrowUpRight size={12} className="text-[#00FFAA]" />
                            : <ArrowDownRight size={12} className="text-[#FF3B30]" />
                        )}
                        <span
                          className={`font-mono text-sm font-semibold ${
                            isPositive ? "text-[#00FFAA]" : isNegative ? "text-[#FF3B30]" : "text-white"
                          }`}
                        >
                          {formatStat(value, row.format, currencySymbol)}
                        </span>
                        {isBest && <WinnerBadge />}
                      </div>
                      {showBar && (
                        <div className="mt-2">
                          <MiniBar
                            values={selected.map((s) => s[row.key])}
                            colors={COMPARE_COLORS.slice(0, selected.length)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Performance summary row */}
          <div
            className="grid gap-px bg-[#262626]"
            style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}
          >
            <div className="bg-[#050505] px-4 py-4 flex items-center">
              <span className="text-[10px] text-[#737373] uppercase tracking-widest font-mono">
                Verdict
              </span>
            </div>
            {selected.map((crypto, i) => {
              const change = crypto.price_change_percentage_24h;
              const isWinner =
                selected.length >= 2 &&
                change != null &&
                change === Math.max(...selected.map((s) => s.price_change_percentage_24h || -Infinity));

              return (
                <div key={crypto.id} className="bg-[#050505] px-4 py-4 text-center">
                  {isWinner ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp size={16} className="text-[#00FFAA]" />
                      <span className="text-[#00FFAA] font-heading font-bold text-sm">
                        Leader 24h
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingDown size={16} className="text-[#737373]" />
                      <span className="text-[#737373] font-heading font-bold text-sm">
                        En retrait
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
