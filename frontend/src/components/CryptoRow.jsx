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
    className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] hover:bg-[var(--bg-elevated)] transition-colors duration-200 group"
    data-testid={`crypto-row-${crypto.id}`}
  >
    <span className="text-[var(--text-muted)] font-mono text-xs w-6 text-right">
      {index + 1}
    </span>
    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-[var(--text-primary)] text-sm">{crypto.name}</span>
        <span className="text-[var(--text-muted)] font-mono text-xs uppercase">{crypto.symbol}</span>
      </div>
    </div>
    <div className="text-right w-28">
      <span className="font-mono font-semibold text-[var(--text-primary)] text-sm">
        {formatPrice(crypto.current_price, currencySymbol)}
      </span>
    </div>
    <div className="w-20 text-right">
      <PriceChange value={crypto.price_change_percentage_24h} className="text-xs" />
    </div>
    <div className="hidden md:block text-right w-28">
      <span className="font-mono text-[var(--text-secondary)] text-xs">
        {formatNumber(crypto.market_cap, currencySymbol)}
      </span>
    </div>
    <div className="hidden lg:block text-right w-28">
      <span className="font-mono text-[var(--text-secondary)] text-xs">
        {formatNumber(crypto.total_volume, currencySymbol)}
      </span>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onToggleFavorite(crypto.id)}
        className="p-1.5 hover:bg-[var(--border-color)] rounded-sm transition-colors"
        data-testid={`fav-btn-${crypto.id}`}
      >
        <Star size={14} className={isFavorite ? "fill-[#FFD60A] text-[#FFD60A]" : "text-[var(--text-muted)]"} />
      </button>
      <button
        onClick={() => onOpenChart(crypto)}
        className="p-1.5 hover:bg-[var(--border-color)] rounded-sm transition-colors"
        data-testid={`chart-btn-${crypto.id}`}
      >
        <BarChart3 size={14} className="text-[var(--text-muted)]" />
      </button>
      <button
        onClick={() => onOpenAlert(crypto)}
        className="p-1.5 hover:bg-[var(--border-color)] rounded-sm transition-colors"
        data-testid={`alert-btn-${crypto.id}`}
      >
        <Bell size={14} className="text-[var(--text-muted)]" />
      </button>
      <button
        onClick={() => onOpenPortfolio(crypto)}
        className="p-1.5 hover:bg-[var(--border-color)] rounded-sm transition-colors"
        data-testid={`portfolio-btn-${crypto.id}`}
      >
        <Plus size={14} className="text-[var(--text-muted)]" />
      </button>
    </div>
  </div>
);
