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

export const GlobalStatsBar = ({ globalStats, fearGreed }) => {
  const stats = [
    {
      label: "Market Cap",
      value: formatLargeNum(globalStats?.total_market_cap),
    },
    {
      label: "24h Vol",
      value: formatLargeNum(globalStats?.total_volume),
    },
    {
      label: "BTC Dom",
      value: globalStats?.market_cap_percentage?.btc
        ? `${globalStats.market_cap_percentage.btc.toFixed(1)}%`
        : "--",
    },
    {
      label: "ETH Dom",
      value: globalStats?.market_cap_percentage?.eth
        ? `${globalStats.market_cap_percentage.eth.toFixed(1)}%`
        : "--",
    },
    {
      label: "24h Change",
      value: globalStats?.market_cap_change_percentage_24h_usd
        ? `${globalStats.market_cap_change_percentage_24h_usd.toFixed(2)}%`
        : "--",
      isChange: true,
      positive: globalStats?.market_cap_change_percentage_24h_usd > 0,
    },
  ];

  return (
    <div
      className="bg-[#0A0A0A] border-b border-[#262626] overflow-hidden"
      data-testid="global-stats-bar"
    >
      <div className="flex items-center h-9 px-4 gap-6 overflow-x-auto">
        {/* Fear & Greed */}
        {fearGreed && (
          <div className="flex items-center gap-2 shrink-0" data-testid="fear-greed-indicator">
            <div
              className="fng-gauge text-xs"
              style={{
                background: `${getFngColor(fearGreed.value)}22`,
                color: getFngColor(fearGreed.value),
                border: `2px solid ${getFngColor(fearGreed.value)}`,
                width: 32,
                height: 32,
                fontSize: 12,
              }}
            >
              {fearGreed.value}
            </div>
            <div className="text-[11px] leading-tight">
              <span className="text-[#737373] uppercase tracking-widest text-[10px]">
                Fear & Greed
              </span>
              <br />
              <span
                className="font-mono font-semibold"
                style={{ color: getFngColor(fearGreed.value) }}
              >
                {fearGreed.classification}
              </span>
            </div>
          </div>
        )}

        <div className="w-px h-5 bg-[#262626] shrink-0" />

        {/* Market Stats */}
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 shrink-0">
            <span className="text-[#737373] text-[10px] uppercase tracking-widest font-body">
              {stat.label}
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                stat.isChange
                  ? stat.positive
                    ? "text-[#00FFAA]"
                    : "text-[#FF3B30]"
                  : "text-white"
              }`}
            >
              {stat.isChange && (stat.positive ? (
                <TrendingUp size={10} className="inline mr-1" />
              ) : (
                <TrendingDown size={10} className="inline mr-1" />
              ))}
              {stat.value}
            </span>
          </div>
        ))}

        {globalStats?.active_cryptocurrencies > 0 && (
          <>
            <div className="w-px h-5 bg-[#262626] shrink-0" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#737373] text-[10px] uppercase tracking-widest">
                Cryptos
              </span>
              <span className="font-mono text-xs font-semibold text-white">
                {globalStats.active_cryptocurrencies.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
