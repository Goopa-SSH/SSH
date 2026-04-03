import { Star, BarChart3, Bell, Plus } from "lucide-react";
import { formatPrice, formatNumber } from "@/utils/formatters";
import { PriceChange } from "@/components/PriceChange";

export const CryptoRow = ({
  crypto,
  index,
  currencySymbol,
  isFavorite,
  onToggleFavorite,
  onOpenChart,
  onOpenAlert,
  onOpenPortfolio,
}) => (
  <div
    className="flex items-center gap-4 px-4 py-3 bg-[#0A0A0A] border-b border-[#262626] hover:bg-[#111111] transition-colors duration-200 group"
    data-testid={`crypto-row-${crypto.id}`}
  >
    <span className="text-[#737373] font-mono text-xs w-6 text-right">
      {index + 1}
    </span>
    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-white text-sm">{crypto.name}</span>
        <span className="text-[#737373] font-mono text-xs uppercase">{crypto.symbol}</span>
      </div>
    </div>
    <div className="text-right w-28">
      <span className="font-mono font-semibold text-white text-sm">
        {formatPrice(crypto.current_price, currencySymbol)}
      </span>
    </div>
    <div className="w-20 text-right">
      <PriceChange value={crypto.price_change_percentage_24h} className="text-xs" />
    </div>
    <div className="hidden md:block text-right w-28">
      <span className="font-mono text-[#A3A3A3] text-xs">
        {formatNumber(crypto.market_cap, currencySymbol)}
      </span>
    </div>
    <div className="hidden lg:block text-right w-28">
      <span className="font-mono text-[#A3A3A3] text-xs">
        {formatNumber(crypto.total_volume, currencySymbol)}
      </span>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onToggleFavorite(crypto.id)}
        className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
        data-testid={`fav-btn-${crypto.id}`}
      >
        <Star size={14} className={isFavorite ? "fill-[#FFD60A] text-[#FFD60A]" : "text-[#737373]"} />
      </button>
      <button
        onClick={() => onOpenChart(crypto)}
        className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
        data-testid={`chart-btn-${crypto.id}`}
      >
        <BarChart3 size={14} className="text-[#737373]" />
      </button>
      <button
        onClick={() => onOpenAlert(crypto)}
        className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
        data-testid={`alert-btn-${crypto.id}`}
      >
        <Bell size={14} className="text-[#737373]" />
      </button>
      <button
        onClick={() => onOpenPortfolio(crypto)}
        className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
        data-testid={`portfolio-btn-${crypto.id}`}
      >
        <Plus size={14} className="text-[#737373]" />
      </button>
    </div>
  </div>
);
