import { Wallet, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/formatters";
import { PortfolioItem } from "@/components/PortfolioItem";
import { toast as sonnerToast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const handleExport = async (format) => {
  try {
    const res = await fetch(`${API}/portfolio/export/${format}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      sonnerToast.error(err.detail || "Erreur lors de l'export");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    sonnerToast.success(`Portfolio exporte en ${format.toUpperCase()}`);
  } catch {
    sonnerToast.error("Erreur lors de l'export");
  }
};

export const PortfolioManager = ({
  portfolio,
  portfolioValue,
  cryptoData,
  currencySymbol,
  onDelete,
}) => (
  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm" data-testid="portfolio-tab">
    <div className="p-4 border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Valeur Totale</p>
          <p className="font-mono font-bold text-3xl text-[var(--text-primary)] mt-1">
            {formatNumber(portfolioValue.total, currencySymbol)}
          </p>
        </div>
        {portfolio.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              className="bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-sm text-xs gap-1.5"
              data-testid="export-csv-btn"
            >
              <Download size={12} />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-sm text-xs gap-1.5"
              data-testid="export-pdf-btn"
            >
              <FileText size={12} />
              PDF
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs">
        <span className="text-[var(--text-muted)]">
          Investi:{" "}
          <span className="font-mono text-[var(--text-primary)]">
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
        <Wallet className="w-12 h-12 mx-auto text-[var(--border-color)] mb-4" />
        <p className="text-[var(--text-primary)] font-heading font-bold">Portfolio vide</p>
        <p className="text-[var(--text-muted)] text-sm mt-2">
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
