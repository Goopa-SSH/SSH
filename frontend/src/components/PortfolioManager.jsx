import { Wallet } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { PortfolioItem } from "@/components/PortfolioItem";

export const PortfolioManager = ({
  portfolio,
  portfolioValue,
  cryptoData,
  currencySymbol,
  onDelete,
}) => (
  <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm" data-testid="portfolio-tab">
    <div className="p-4 border-b border-[#262626]">
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
          {formatNumber(portfolioValue.profit, currencySymbol)} (
          {portfolioValue.profitPercent.toFixed(2)}%)
        </span>
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
        {portfolio.map((item) => (
          <PortfolioItem
            key={item.id}
            item={item}
            crypto={cryptoData.find((c) => c.id === item.crypto_id)}
            currencySymbol={currencySymbol}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </div>
);
