import { TrendingUp, TrendingDown } from "lucide-react";

const formatLargeNum = (num) => {
  if (!num) return "$0";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(0)}`;
};

const getFngColor = (val) => {
  if (val <= 25) return "#FF3B30";
  if (val <= 45) return "#FF8C00";
  if (val <= 55) return "#FFD60A";
  if (val <= 75) return "#7ACC00";
  return "#00FFAA";
};

const Divider = () => <div className="w-px h-5 bg-[#262626] shrink-0" />;

const FearGreedBadge = ({ fearGreed }) => {
  const color = getFngColor(fearGreed.value);
  return (
    <div className="flex items-center gap-2 shrink-0" data-testid="fear-greed-indicator">
      <div
        className="fng-gauge text-xs"
        style={{
          background: `${color}22`,
          color,
          border: `2px solid ${color}`,
          width: 32,
          height: 32,
          fontSize: 12,
        }}
      >
        {fearGreed.value}
      </div>
      <div className="text-[11px] leading-tight">
        <span className="text-[#737373] uppercase tracking-widest text-[10px]">Fear & Greed</span>
        <br />
        <span className="font-mono font-semibold" style={{ color }}>
          {fearGreed.classification}
        </span>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, isChange, positive }) => (
  <div className="flex items-center gap-2 shrink-0">
    <span className="text-[#737373] text-[10px] uppercase tracking-widest font-body">{label}</span>
    <span
      className={`font-mono text-xs font-semibold ${
        isChange ? (positive ? "text-[#00FFAA]" : "text-[#FF3B30]") : "text-white"
      }`}
    >
      {isChange &&
        (positive ? (
          <TrendingUp size={10} className="inline mr-1" />
        ) : (
          <TrendingDown size={10} className="inline mr-1" />
        ))}
      {value}
    </span>
  </div>
);

export const GlobalStatsBar = ({ globalStats, fearGreed }) => {
  const mcpPct = globalStats?.market_cap_percentage;
  const change = globalStats?.market_cap_change_percentage_24h_usd;

  const stats = [
    { label: "Market Cap", value: formatLargeNum(globalStats?.total_market_cap) },
    { label: "24h Vol", value: formatLargeNum(globalStats?.total_volume) },
    { label: "BTC Dom", value: mcpPct?.btc ? `${mcpPct.btc.toFixed(1)}%` : "--" },
    { label: "ETH Dom", value: mcpPct?.eth ? `${mcpPct.eth.toFixed(1)}%` : "--" },
    { label: "24h Change", value: change ? `${change.toFixed(2)}%` : "--", isChange: true, positive: change > 0 },
  ];

  return (
    <div className="bg-[#0A0A0A] border-b border-[#262626] overflow-hidden" data-testid="global-stats-bar">
      <div className="flex items-center h-9 px-4 gap-6 overflow-x-auto">
        {fearGreed && <FearGreedBadge fearGreed={fearGreed} />}
        <Divider />
        {stats.map((s) => (
          <StatItem key={s.label} {...s} />
        ))}
        {globalStats?.active_cryptocurrencies > 0 && (
          <>
            <Divider />
            <StatItem label="Cryptos" value={globalStats.active_cryptocurrencies.toLocaleString()} />
          </>
        )}
      </div>
    </div>
  );
};
