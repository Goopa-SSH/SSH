import { useState, useMemo, useCallback } from "react";
import "@/App.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Search, RefreshCw, Sun, Moon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

import { GlobalStatsBar } from "@/components/GlobalStatsBar";
import { MarketHeatmap } from "@/components/MarketHeatmap";
import { CryptoRow } from "@/components/CryptoRow";
import { ChartDialog } from "@/components/ChartDialog";
import { AlertDialog } from "@/components/AlertDialog";
import { PortfolioDialog } from "@/components/PortfolioDialog";
import { PortfolioManager } from "@/components/PortfolioManager";
import { AlertsManager } from "@/components/AlertsManager";
import { ConverterTab } from "@/components/ConverterTab";
import { TrendingTab } from "@/components/TrendingTab";
import { SummaryCards } from "@/components/SummaryCards";
import { AffiliateBar } from "@/components/AffiliateBar";
import { CryptoComparator } from "@/components/CryptoComparator";

import { useMarketData } from "@/hooks/useMarketData";
import { useGlobalStats } from "@/hooks/useGlobalStats";
import { useChartData } from "@/hooks/useChartData";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAlerts } from "@/hooks/useAlerts";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";

const CURRENCIES = [
  { value: "usd", label: "USD $", symbol: "$" },
  { value: "eur", label: "EUR \u20AC", symbol: "\u20AC" },
  { value: "gbp", label: "GBP \u00A3", symbol: "\u00A3" },
  { value: "jpy", label: "JPY \u00A5", symbol: "\u00A5" },
  { value: "chf", label: "CHF Fr", symbol: "Fr" },
];

const getCurrencySymbol = (code) =>
  CURRENCIES.find((c) => c.value === code)?.symbol || "$";

const TAB_LABELS = {
  markets: "Marches",
  heatmap: "Heatmap",
  compare: "Comparer",
  favorites: "Favoris",
  trending: "Tendances",
  portfolio: "Portfolio",
  alerts: "Alertes",
  converter: "Convertisseur",
};

const TAB_KEYS = Object.keys(TAB_LABELS);

const TableHeader = () => (
  <div className="flex items-center gap-4 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] border-b-0 rounded-t-sm text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
    <span className="w-6 text-right">#</span>
    <span className="w-8" />
    <span className="flex-1">Nom</span>
    <span className="w-28 text-right">Prix</span>
    <span className="w-20 text-right">24h</span>
    <span className="hidden md:block w-28 text-right">Cap.</span>
    <span className="hidden lg:block w-28 text-right">Volume</span>
    <span className="w-24" />
  </div>
);

function App() {
  const [currency, setCurrency] = useState("usd");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [chartMode, setChartMode] = useState("line");

  const currencySymbol = getCurrencySymbol(currency);
  const { theme, toggleTheme } = useTheme();

  // Data hooks
  const { cryptoData, trendingData, loading, lastUpdate, fetchMarkets } = useMarketData(currency);
  const { globalStats, fearGreed } = useGlobalStats();
  const { chartData, ohlcData, chartDays, setChartDays, fetchChart, fetchOhlc } = useChartData(currency);
  const { portfolio, addPortfolioItem, deletePortfolioItem } = usePortfolio();
  const { alerts, addPriceAlert, deleteAlert } = useAlerts();
  const { favorites, toggleFavorite } = useFavorites();
  useNotifications();

  // Derived data
  const filteredCryptoData = useMemo(
    () =>
      cryptoData.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [cryptoData, searchQuery]
  );

  const favoriteCryptos = useMemo(
    () => cryptoData.filter((c) => favorites.includes(c.id)),
    [cryptoData, favorites]
  );

  const portfolioValue = useMemo(() => {
    let total = 0;
    let invested = 0;
    for (const item of portfolio) {
      const match = cryptoData.find((c) => c.id === item.crypto_id);
      if (match) {
        total += item.amount * match.current_price;
        invested += item.amount * item.purchase_price;
      }
    }
    return {
      total,
      invested,
      profit: total - invested,
      profitPercent: invested > 0 ? ((total - invested) / invested) * 100 : 0,
    };
  }, [portfolio, cryptoData]);

  // Dialog openers — state setters are stable, listed for explicitness
  const openChart = useCallback(
    (crypto) => {
      setSelectedCrypto(crypto);
      // Fetch active type immediately, other type after delay (avoids rate limit)
      if (chartMode === "candle") {
        fetchOhlc(crypto.id, chartDays);
        setTimeout(() => fetchChart(crypto.id, chartDays), 2500);
      } else {
        fetchChart(crypto.id, chartDays);
        setTimeout(() => fetchOhlc(crypto.id, chartDays), 2500);
      }
      setShowChartDialog(true);
    },
    [chartDays, chartMode, fetchChart, fetchOhlc, setSelectedCrypto, setShowChartDialog]
  );

  const handleChartDaysChange = useCallback(
    (days) => {
      setChartDays(days);
      if (selectedCrypto) {
        if (chartMode === "candle") {
          fetchOhlc(selectedCrypto.id, days);
        } else {
          fetchChart(selectedCrypto.id, days);
        }
      }
    },
    [selectedCrypto, chartMode, fetchChart, fetchOhlc, setChartDays]
  );

  const handleChartModeChange = useCallback(
    (mode) => {
      setChartMode(mode);
      if (selectedCrypto) {
        if (mode === "candle") {
          fetchOhlc(selectedCrypto.id, chartDays);
        } else {
          fetchChart(selectedCrypto.id, chartDays);
        }
      }
    },
    [selectedCrypto, chartDays, fetchChart, fetchOhlc]
  );

  const openAlertDialog = useCallback(
    (crypto) => {
      setSelectedCrypto(crypto);
      setShowAlertDialog(true);
    },
    [setSelectedCrypto, setShowAlertDialog]
  );

  const openPortfolioDialog = useCallback(
    (crypto) => {
      setSelectedCrypto(crypto);
      setShowPortfolioDialog(true);
    },
    [setSelectedCrypto, setShowPortfolioDialog]
  );

  // Shared row props
  const rowProps = useMemo(
    () => ({
      currencySymbol,
      onToggleFavorite: toggleFavorite,
      onOpenChart: openChart,
      onOpenAlert: openAlertDialog,
      onOpenPortfolio: openPortfolioDialog,
    }),
    [currencySymbol, toggleFavorite, openChart, openAlertDialog, openPortfolioDialog]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-body">
      <Toaster position="top-right" />
      <GlobalStatsBar globalStats={globalStats} fearGreed={fearGreed} />

      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]" data-testid="app-header">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#007AFF] rounded-sm flex items-center justify-center font-heading font-black text-lg text-white">C</div>
            <div>
              <h1 className="font-heading font-black text-xl tracking-tight text-[var(--text-primary)]">CRYPTO PORTAL PRO</h1>
              <p className="text-[var(--text-muted)] text-xs mt-0.5 tracking-wide">Suivi en temps reel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-sm border border-[var(--border-color)] bg-[var(--bg-elevated)] hover:bg-[var(--hover-bg)] transition-colors"
              data-testid="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} className="text-[var(--text-secondary)]" /> : <Moon size={16} className="text-[var(--text-secondary)]" />}
            </button>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-28 bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-sm" data-testid="currency-toggle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Mise a jour</p>
              <p className="text-xs text-[var(--text-primary)] font-mono">{lastUpdate.toLocaleTimeString("fr-FR")}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <SummaryCards
          cryptoCount={cryptoData.length}
          firstCrypto={cryptoData[0]}
          portfolioValue={portfolioValue}
          alertCount={alerts.length}
          currencySymbol={currencySymbol}
        />

        <Tabs defaultValue="markets" className="space-y-4">
          <TabsList className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-sm h-10 p-1" data-testid="main-tabs">
            {TAB_KEYS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Markets */}
          <TabsContent value="markets" className="space-y-0" data-testid="markets-tab">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] pl-9 rounded-sm text-sm placeholder:text-[var(--text-muted)]" data-testid="search-input" />
              </div>
              <Button onClick={fetchMarkets} variant="outline" className="bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-sm" data-testid="refresh-button">
                <RefreshCw size={14} />
              </Button>
            </div>
            <TableHeader />
            {loading ? (
              <div className="space-y-0 border border-[var(--border-color)] rounded-b-sm overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                    <Skeleton className="h-5 bg-[var(--bg-elevated)]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[var(--border-color)] rounded-b-sm overflow-hidden">
                {filteredCryptoData.map((crypto, i) => (
                  <CryptoRow key={crypto.id} crypto={crypto} index={i} isFavorite={favorites.includes(crypto.id)} {...rowProps} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="heatmap" data-testid="heatmap-tab">
            <MarketHeatmap cryptoData={cryptoData} currency={currency} onCryptoClick={openChart} />
          </TabsContent>

          <TabsContent value="compare" data-testid="compare-tab">
            <CryptoComparator cryptoData={cryptoData} currencySymbol={currencySymbol} />
          </TabsContent>

          <TabsContent value="favorites" data-testid="favorites-tab">
            {favoriteCryptos.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-sm p-16 text-center">
                <Star className="w-12 h-12 mx-auto text-[var(--border-color)] mb-4" />
                <p className="text-[var(--text-primary)] font-heading font-bold">Aucun favori</p>
                <p className="text-[var(--text-muted)] text-sm mt-2">Survolez une crypto et cliquez sur l'etoile</p>
              </div>
            ) : (
              <>
                <TableHeader />
                <div className="border border-[var(--border-color)] rounded-b-sm overflow-hidden">
                  {favoriteCryptos.map((crypto, i) => (
                    <CryptoRow key={crypto.id} crypto={crypto} index={i} isFavorite {...rowProps} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="trending"><TrendingTab trendingData={trendingData} /></TabsContent>
          <TabsContent value="portfolio"><PortfolioManager portfolio={portfolio} portfolioValue={portfolioValue} cryptoData={cryptoData} currencySymbol={currencySymbol} onDelete={deletePortfolioItem} /></TabsContent>
          <TabsContent value="alerts"><AlertsManager alerts={alerts} currencySymbol={currencySymbol} onDelete={deleteAlert} /></TabsContent>
          <TabsContent value="converter"><ConverterTab /></TabsContent>
        </Tabs>

        {/* Coinbase Affiliate */}
        <div className="mt-6">
          <AffiliateBar />
        </div>
      </div>

      <ChartDialog open={showChartDialog} onOpenChange={setShowChartDialog} selectedCrypto={selectedCrypto} chartData={chartData} ohlcData={ohlcData} chartDays={chartDays} onChangeDays={handleChartDaysChange} chartMode={chartMode} onChangeMode={handleChartModeChange} />
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog} selectedCrypto={selectedCrypto} currencySymbol={currencySymbol} onSubmit={addPriceAlert} />
      <PortfolioDialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog} selectedCrypto={selectedCrypto} currencySymbol={currencySymbol} onSubmit={addPortfolioItem} />

      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-12" data-testid="app-footer">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <p className="text-center text-[var(--text-muted)] text-xs font-mono">CRYPTO PORTAL PRO &middot; Donnees CoinGecko &middot; Mise a jour auto 60s</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
