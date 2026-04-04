import { Trash2 } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

export const PortfolioItem = ({ item, crypto, currencySymbol, onDelete }) => {
  const currentValue = crypto ? item.amount * crypto.current_price : 0;
  const investedValue = item.amount * item.purchase_price;
  const profit = currentValue - investedValue;
  const profitPct = investedValue > 0 ? (profit / investedValue) * 100 : 0;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 border-b border-[#262626] hover:bg-[#111111] transition-colors"
      data-testid={`portfolio-item-${item.id}`}
    >
      <div className="flex-1">
        <p className="font-heading font-bold text-white text-sm">
          {item.crypto_name}
        </p>
        <p className="text-[#737373] text-xs font-mono">
          {item.amount} {item.crypto_symbol.toUpperCase()} @ {currencySymbol}
          {item.purchase_price.toFixed(2)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono font-semibold text-white text-sm">
          {formatNumber(currentValue, currencySymbol)}
        </p>
        <span
          className={`font-mono text-xs font-semibold ${
            profit >= 0 ? "text-[#00FFAA]" : "text-[#FF3B30]"
          }`}
        >
          {profit >= 0 ? "+" : ""}
          {formatNumber(profit, currencySymbol)} ({profitPct.toFixed(2)}%)
        </span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-2 hover:bg-[#FF3B30]/20 rounded-sm transition-colors"
        data-testid={`delete-portfolio-${item.id}`}
      >
        <Trash2 size={14} className="text-[#FF3B30]" />
      </button>
    </div>
  );
};
