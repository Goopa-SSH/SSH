import { ArrowUpRight } from "lucide-react";

const COINBASE_REFERRAL_URL = "https://www.coinbase.com/join";

export const AffiliateBar = () => (
  <div
    className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4 flex items-center justify-between"
    data-testid="affiliate-bar"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#0052FF] rounded-sm flex items-center justify-center font-heading font-black text-sm text-white">
        CB
      </div>
      <div>
        <p className="text-white text-sm font-body font-semibold">
          Acheter de la crypto sur Coinbase
        </p>
        <p className="text-[#737373] text-xs mt-0.5">
          Plateforme regulee &middot; +200 cryptos disponibles
        </p>
      </div>
    </div>
    <a
      href={COINBASE_REFERRAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-[#0052FF] hover:bg-[#003ECB] text-white text-xs font-body font-semibold px-4 py-2 rounded-sm transition-colors"
      data-testid="coinbase-affiliate-link"
    >
      S'inscrire
      <ArrowUpRight size={12} />
    </a>
  </div>
);
