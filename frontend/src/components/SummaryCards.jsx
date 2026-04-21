import { PriceChange } from "@/components/PriceChange";
import { formatNumber } from "@/utils/formatters";

export const SummaryCards = ({
  cryptoCount,
  firstCrypto,
  portfolioValue,
  alertCount,
  currencySymbol,
}) => {
  const fmt = (num) => formatNumber(num, currencySymbol);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="summary-cards">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm p-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Total Marches</p>
        <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">{cryptoCount}</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">cryptos suivies</p>
      </div>
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm p-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Bitcoin</p>
        {firstCrypto && (
          <>
            <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">
              {currencySymbol}{firstCrypto.current_price?.toLocaleString()}
            </p>
            <PriceChange value={firstCrypto.price_change_percentage_24h} className="text-xs mt-1" />
          </>
        )}
      </div>
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm p-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Portfolio</p>
        <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">{fmt(portfolioValue.total)}</p>
        <PriceChange value={portfolioValue.profitPercent} className="text-xs mt-1" />
      </div>
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm p-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Alertes</p>
        <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">{alertCount}</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">alertes actives</p>
      </div>
    </div>
  );
};
