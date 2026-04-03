export const TrendingTab = ({ trendingData }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] rounded-sm overflow-hidden"
    data-testid="trending-tab"
  >
    {trendingData.map((crypto, index) => (
      <div
        key={crypto.id}
        className="bg-[#0A0A0A] p-4 flex items-center gap-4 hover:bg-[#111111] transition-colors"
        data-testid={`trending-card-${crypto.id}`}
      >
        <span className="font-mono font-bold text-[#007AFF] text-lg w-8">
          {String(index + 1).padStart(2, "0")}
        </span>
        <img src={crypto.thumb} alt={crypto.name} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <p className="font-heading font-bold text-white text-sm">{crypto.name}</p>
          <p className="text-[#737373] font-mono text-xs">{crypto.symbol.toUpperCase()}</p>
        </div>
        {crypto.market_cap_rank && (
          <span className="font-mono text-xs text-[#737373] border border-[#262626] px-2 py-1 rounded-sm">
            #{crypto.market_cap_rank}
          </span>
        )}
      </div>
    ))}
  </div>
);
