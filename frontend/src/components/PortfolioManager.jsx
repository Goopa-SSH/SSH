import { Wallet, Trash2 } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

export const PortfolioManager = ({ portfolio, portfolioValue, cryptoData, currencySymbol, onDelete }) => (
  <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm" data-testid="portfolio-tab">
    <div className="p-4 border-b border-[#262626] flex items-center justify-between">
      <div>
        <p className="text-[10px] text-[#737373] uppercase tracking-widest">Valeur Totale</p>
        <p className="font-mono font-bold text-3xl text-white mt-1">
          {formatNumber(portfolioValue.total, currencySymbol)}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="text-[#737373]">
            Investi:{" "}
            <span className="font-mono text-white">
              {formatNumber(portfolioValue.invested, currencySymbol)}
            </span>
          </span>
          <span
            className={`font-mono font-semibold ${
              portfolioValue.profit >= 0 ? "text-[#00FFAA]" : "text-[#FF3B30]"
            }`}
          >
            {portfolioValue.profit >= 0 ? "+" : ""}
            {formatNumber(portfolioValue.profit, currencySymbol)} ({portfolioValue.profitPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>

    {portfolio.length === 0 ? (
      <div className="p-16 text-center">
        <Wallet className="w-12 h-12 mx-auto text-[#262626] mb-4" />
        <p className="text-white font-heading font-bold">Portfolio vide</p>
        <p className="text-[#737373] text-sm mt-2">
          Ajoutez des cryptos pour suivre vos investissements
        </p>
      </div>
    ) : (
      <div>
        {portfolio.map((item) => {
          const crypto = cryptoData.find((c) => c.id === item.crypto_id);
          const currentValue = crypto ? item.amount * crypto.current_price : 0;
          const investedValue = item.amount * item.purchase_price;
          const profit = currentValue - investedValue;
          const profitPct = investedValue > 0 ? (profit / investedValue) * 100 : 0;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#262626] hover:bg-[#111111] transition-colors"
              data-testid={`portfolio-item-${item.id}`}
            >
              <div className="flex-1">
                <p className="font-heading font-bold text-white text-sm">{item.crypto_name}</p>
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
        })}
      </div>
    )}
  </div>
);
