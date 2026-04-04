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
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
        <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Total Marches</p>
        <p className="font-mono font-bold text-2xl text-white">{cryptoCount}</p>
        <p className="text-[#737373] text-xs mt-1">cryptos suivies</p>
      </div>
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
        <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Bitcoin</p>
        {firstCrypto && (
          <>
            <p className="font-mono font-bold text-2xl text-white">
              {currencySymbol}{firstCrypto.current_price?.toLocaleString()}
            </p>
            <PriceChange value={firstCrypto.price_change_percentage_24h} className="text-xs mt-1" />
          </>
        )}
      </div>
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
        <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Portfolio</p>
        <p className="font-mono font-bold text-2xl text-white">{fmt(portfolioValue.total)}</p>
        <PriceChange value={portfolioValue.profitPercent} className="text-xs mt-1" />
      </div>
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
        <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Alertes</p>
        <p className="font-mono font-bold text-2xl text-white">{alertCount}</p>
        <p className="text-[#737373] text-xs mt-1">alertes actives</p>
      </div>
    </div>
  );
};
