import { useEffect, useState, useMemo } from "react";
import "@/App.css";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import {
  Star, TrendingUp, TrendingDown, Bell, Wallet, Plus, Trash2,
  ArrowUpRight, ArrowDownRight, Search, RefreshCw, BarChart3, Activity
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast as sonnerToast } from "sonner";
import { GlobalStatsBar } from "@/components/GlobalStatsBar";
import { MarketHeatmap } from "@/components/MarketHeatmap";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [convertFrom, setConvertFrom] = useState("bitcoin");
  const [convertTo, setConvertTo] = useState("ethereum");
  const [convertAmount, setConvertAmount] = useState(1);
  const [convertResult, setConvertResult] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [favorites, setFavorites] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(7);
  const [currency, setCurrency] = useState("usd");
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);

  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState("above");
  const [portfolioAmount, setPortfolioAmount] = useState("");
  const [portfolioPurchasePrice, setPortfolioPurchasePrice] = useState("");

  const currencySymbol = currency === "usd" ? "$" : "\u20AC";

  useEffect(() => {
    const saved = localStorage.getItem("cryptoFavorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const fetchCryptoData = async () => {
    try {
      const response = await axios.get(`${API}/crypto/markets?limit=50&currency=${currency}`);
      setCryptoData(response.data);
      setLoading(false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setLoading(false);
    }
  };

  const fetchTrendingData = async () => {
    try {
      const response = await axios.get(`${API}/crypto/trending`);
      setTrendingData(response.data);
    } catch (error) {
      console.error("Error fetching trending data:", error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await axios.get(`${API}/crypto/global`);
      setGlobalStats(response.data);
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  const fetchFearGreed = async () => {
    try {
      const response = await axios.get(`${API}/crypto/fear-greed`);
      setFearGreed(response.data);
    } catch (error) {
      console.error("Error fetching fear & greed:", error);
    }
  };

  const fetchChartData = async (cryptoId, days) => {
    try {
      const response = await axios.get(`${API}/crypto/chart/${cryptoId}?days=${days}&currency=${currency}`);
      const formattedData = response.data.prices.map((item) => ({
        time: new Date(item.timestamp).toLocaleDateString("fr-FR", {
          month: "short", day: "numeric",
          ...(days <= 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
        }),
        price: item.price,
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.get(
        `${API}/crypto/convert?from_crypto=${convertFrom}&to_crypto=${convertTo}&amount=${convertAmount}`
      );
      setConvertResult(response.data);
    } catch (error) {
      console.error("Error converting:", error);
      sonnerToast.error("Erreur de conversion");
    }
  };

  const toggleFavorite = (cryptoId) => {
    const newFavorites = favorites.includes(cryptoId)
      ? favorites.filter((id) => id !== cryptoId)
      : [...favorites, cryptoId];
    setFavorites(newFavorites);
    localStorage.setItem("cryptoFavorites", JSON.stringify(newFavorites));
    sonnerToast.success(favorites.includes(cryptoId) ? "Retire des favoris" : "Ajoute aux favoris");
  };

  const addPortfolioItem = async () => {
    if (!selectedCrypto || !portfolioAmount || !portfolioPurchasePrice) return;
    try {
      await axios.post(`${API}/portfolio`, {
        crypto_id: selectedCrypto.id,
        crypto_name: selectedCrypto.name,
        crypto_symbol: selectedCrypto.symbol,
        amount: parseFloat(portfolioAmount),
        purchase_price: parseFloat(portfolioPurchasePrice),
      });
      sonnerToast.success("Ajoute au portfolio");
      fetchPortfolio();
      setShowPortfolioDialog(false);
      setPortfolioAmount("");
      setPortfolioPurchasePrice("");
    } catch (error) {
      sonnerToast.error("Erreur lors de l'ajout");
    }
  };

  const deletePortfolioItem = async (itemId) => {
    try {
      await axios.delete(`${API}/portfolio/${itemId}`);
      sonnerToast.success("Retire du portfolio");
      fetchPortfolio();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
    }
  };

  const addPriceAlert = async () => {
    if (!selectedCrypto || !alertPrice) return;
    try {
      await axios.post(`${API}/alerts`, {
        crypto_id: selectedCrypto.id,
        crypto_name: selectedCrypto.name,
        crypto_symbol: selectedCrypto.symbol,
        target_price: parseFloat(alertPrice),
        condition: alertCondition,
      });
      sonnerToast.success("Alerte creee");
      fetchAlerts();
      setShowAlertDialog(false);
      setAlertPrice("");
    } catch (error) {
      sonnerToast.error("Erreur lors de la creation");
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await axios.delete(`${API}/alerts/${alertId}`);
      sonnerToast.success("Alerte supprimee");
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const openChart = (crypto) => {
    setSelectedCrypto(crypto);
    fetchChartData(crypto.id, chartDays);
    setShowChartDialog(true);
  };

  const openAlertDialog = (crypto) => {
    setSelectedCrypto(crypto);
    setShowAlertDialog(true);
  };

  const openPortfolioDialog = (crypto) => {
    setSelectedCrypto(crypto);
    setShowPortfolioDialog(true);
  };

  useEffect(() => {
    fetchCryptoData();
    fetchTrendingData();
    fetchPortfolio();
    fetchAlerts();
    fetchGlobalStats();
    fetchFearGreed();

    const interval = setInterval(() => {
      fetchCryptoData();
      fetchTrendingData();
      fetchGlobalStats();
      fetchFearGreed();
    }, 60000);

    return () => clearInterval(interval);
  }, [currency]);

  useEffect(() => {
    if (selectedCrypto && showChartDialog) {
      fetchChartData(selectedCrypto.id, chartDays);
    }
  }, [chartDays]);

  const filteredCryptoData = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteCryptos = cryptoData.filter((crypto) => favorites.includes(crypto.id));

  const portfolioValue = useMemo(() => {
    let total = 0;
    let invested = 0;
    portfolio.forEach((item) => {
      const crypto = cryptoData.find((c) => c.id === item.crypto_id);
      if (crypto) {
        total += item.amount * crypto.current_price;
        invested += item.amount * item.purchase_price;
      }
    });
    return {
      total,
      invested,
      profit: total - invested,
      profitPercent: invested > 0 ? ((total - invested) / invested) * 100 : 0,
    };
  }, [portfolio, cryptoData]);

  const formatNumber = (num) => {
    if (num >= 1e12) return `${currencySymbol}${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${currencySymbol}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${currencySymbol}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${currencySymbol}${(num / 1e3).toFixed(2)}K`;
    return `${currencySymbol}${num.toFixed(2)}`;
  };

  const PriceChange = ({ value, className = "" }) => {
    if (value === null || value === undefined) return <span className="text-[#737373]">--</span>;
    const positive = value > 0;
    return (
      <span className={`font-mono font-semibold inline-flex items-center gap-0.5 ${positive ? "text-[#00FFAA]" : "text-[#FF3B30]"} ${className}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  const CryptoRow = ({ crypto, index }) => (
    <div
      className="flex items-center gap-4 px-4 py-3 bg-[#0A0A0A] border-b border-[#262626] hover:bg-[#111111] transition-colors duration-200 group"
      data-testid={`crypto-row-${crypto.id}`}
    >
      <span className="text-[#737373] font-mono text-xs w-6 text-right">{index + 1}</span>
      <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-white text-sm">{crypto.name}</span>
          <span className="text-[#737373] font-mono text-xs uppercase">{crypto.symbol}</span>
        </div>
      </div>
      <div className="text-right w-28">
        <span className="font-mono font-semibold text-white text-sm">
          {currencySymbol}{crypto.current_price >= 1
            ? crypto.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : crypto.current_price.toFixed(6)}
        </span>
      </div>
      <div className="w-20 text-right">
        <PriceChange value={crypto.price_change_percentage_24h} className="text-xs" />
      </div>
      <div className="hidden md:block text-right w-28">
        <span className="font-mono text-[#A3A3A3] text-xs">{formatNumber(crypto.market_cap)}</span>
      </div>
      <div className="hidden lg:block text-right w-28">
        <span className="font-mono text-[#A3A3A3] text-xs">{formatNumber(crypto.total_volume)}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => toggleFavorite(crypto.id)}
          className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
          data-testid={`fav-btn-${crypto.id}`}
        >
          <Star size={14} className={favorites.includes(crypto.id) ? "fill-[#FFD60A] text-[#FFD60A]" : "text-[#737373]"} />
        </button>
        <button
          onClick={() => openChart(crypto)}
          className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
          data-testid={`chart-btn-${crypto.id}`}
        >
          <BarChart3 size={14} className="text-[#737373]" />
        </button>
        <button
          onClick={() => openAlertDialog(crypto)}
          className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
          data-testid={`alert-btn-${crypto.id}`}
        >
          <Bell size={14} className="text-[#737373]" />
        </button>
        <button
          onClick={() => openPortfolioDialog(crypto)}
          className="p-1.5 hover:bg-[#262626] rounded-sm transition-colors"
          data-testid={`portfolio-btn-${crypto.id}`}
        >
          <Plus size={14} className="text-[#737373]" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body">
      <Toaster position="top-right" />

      {/* Global Stats Ticker */}
      <GlobalStatsBar globalStats={globalStats} fearGreed={fearGreed} />

      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#262626]" data-testid="app-header">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#007AFF] rounded-sm flex items-center justify-center font-heading font-black text-lg">
              C
            </div>
            <div>
              <h1 className="font-heading font-black text-xl tracking-tight text-white">
                CRYPTO PORTAL PRO
              </h1>
              <p className="text-[#737373] text-xs mt-0.5 tracking-wide">
                Suivi en temps reel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger
                className="w-24 bg-[#111111] border-[#262626] text-white text-xs rounded-sm"
                data-testid="currency-toggle"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                <SelectItem value="usd">USD $</SelectItem>
                <SelectItem value="eur">EUR &euro;</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#737373] uppercase tracking-widest">Mise a jour</p>
              <p className="text-xs text-white font-mono">{lastUpdate.toLocaleTimeString("fr-FR")}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="summary-cards">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Total Marches</p>
            <p className="font-mono font-bold text-2xl text-white">{cryptoData.length}</p>
            <p className="text-[#737373] text-xs mt-1">cryptos suivies</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Bitcoin</p>
            {cryptoData[0] && (
              <>
                <p className="font-mono font-bold text-2xl text-white">
                  {currencySymbol}{cryptoData[0].current_price?.toLocaleString()}
                </p>
                <PriceChange value={cryptoData[0].price_change_percentage_24h} className="text-xs mt-1" />
              </>
            )}
          </div>
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Portfolio</p>
            <p className="font-mono font-bold text-2xl text-white">{formatNumber(portfolioValue.total)}</p>
            <PriceChange value={portfolioValue.profitPercent} className="text-xs mt-1" />
          </div>
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-4">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Alertes</p>
            <p className="font-mono font-bold text-2xl text-white">{alerts.length}</p>
            <p className="text-[#737373] text-xs mt-1">alertes actives</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="markets" className="space-y-4">
          <TabsList className="bg-[#0A0A0A] border border-[#262626] rounded-sm h-10 p-1" data-testid="main-tabs">
            <TabsTrigger value="markets" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Marches
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Favoris
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Tendances
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Alertes
            </TabsTrigger>
            <TabsTrigger value="converter" className="rounded-sm text-xs font-body data-[state=active]:text-white px-3">
              Convertisseur
            </TabsTrigger>
          </TabsList>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-0" data-testid="markets-tab">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0A0A0A] border-[#262626] text-white pl-9 rounded-sm text-sm placeholder:text-[#737373]"
                  data-testid="search-input"
                />
              </div>
              <Button
                onClick={fetchCryptoData}
                variant="outline"
                className="bg-[#0A0A0A] border-[#262626] text-[#A3A3A3] hover:text-white hover:bg-[#111111] rounded-sm"
                data-testid="refresh-button"
              >
                <RefreshCw size={14} />
              </Button>
            </div>

            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#050505] border border-[#262626] border-b-0 rounded-t-sm text-[10px] text-[#737373] uppercase tracking-widest">
              <span className="w-6 text-right">#</span>
              <span className="w-8" />
              <span className="flex-1">Nom</span>
              <span className="w-28 text-right">Prix</span>
              <span className="w-20 text-right">24h</span>
              <span className="hidden md:block w-28 text-right">Cap.</span>
              <span className="hidden lg:block w-28 text-right">Volume</span>
              <span className="w-24" />
            </div>

            {loading ? (
              <div className="space-y-0 border border-[#262626] rounded-b-sm overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 bg-[#0A0A0A] border-b border-[#262626]">
                    <Skeleton className="h-5 bg-[#111111]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[#262626] rounded-b-sm overflow-hidden">
                {filteredCryptoData.map((crypto, i) => (
                  <CryptoRow key={crypto.id} crypto={crypto} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap" data-testid="heatmap-tab">
            <MarketHeatmap
              cryptoData={cryptoData}
              currency={currency}
              onCryptoClick={openChart}
            />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" data-testid="favorites-tab">
            {favoriteCryptos.length === 0 ? (
              <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-16 text-center">
                <Star className="w-12 h-12 mx-auto text-[#262626] mb-4" />
                <p className="text-white font-heading font-bold">Aucun favori</p>
                <p className="text-[#737373] text-sm mt-2">
                  Survolez une crypto et cliquez sur l'etoile pour l'ajouter
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 px-4 py-2 bg-[#050505] border border-[#262626] border-b-0 rounded-t-sm text-[10px] text-[#737373] uppercase tracking-widest">
                  <span className="w-6 text-right">#</span>
                  <span className="w-8" />
                  <span className="flex-1">Nom</span>
                  <span className="w-28 text-right">Prix</span>
                  <span className="w-20 text-right">24h</span>
                  <span className="hidden md:block w-28 text-right">Cap.</span>
                  <span className="hidden lg:block w-28 text-right">Volume</span>
                  <span className="w-24" />
                </div>
                <div className="border border-[#262626] rounded-b-sm overflow-hidden">
                  {favoriteCryptos.map((crypto, i) => (
                    <CryptoRow key={crypto.id} crypto={crypto} index={i} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" data-testid="trending-tab">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] rounded-sm overflow-hidden">
              {trendingData.map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="bg-[#0A0A0A] p-4 flex items-center gap-4 hover:bg-[#111111] transition-colors"
                  data-testid={`trending-card-${crypto.id}`}
                >
                  <span className="font-mono font-bold text-[#007AFF] text-lg w-8">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img src={crypto.thumb} alt={crypto.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-heading font-bold text-white text-sm">{crypto.name}</p>
                    <p className="text-[#737373] font-mono text-xs">{crypto.symbol.toUpperCase()}</p>
                  </div>
                  {crypto.market_cap_rank && (
                    <span className="font-mono text-xs text-[#737373] border border-[#262626] px-2 py-1 rounded-sm">
                      #{crypto.market_cap_rank}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" data-testid="portfolio-tab">
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm">
              <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#737373] uppercase tracking-widest">Valeur Totale</p>
                  <p className="font-mono font-bold text-3xl text-white mt-1">{formatNumber(portfolioValue.total)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-[#737373]">Investi: <span className="font-mono text-white">{formatNumber(portfolioValue.invested)}</span></span>
                    <span className={`font-mono font-semibold ${portfolioValue.profit >= 0 ? "text-[#00FFAA]" : "text-[#FF3B30]"}`}>
                      {portfolioValue.profit >= 0 ? "+" : ""}{formatNumber(portfolioValue.profit)} ({portfolioValue.profitPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
              {portfolio.length === 0 ? (
                <div className="p-16 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-[#262626] mb-4" />
                  <p className="text-white font-heading font-bold">Portfolio vide</p>
                  <p className="text-[#737373] text-sm mt-2">Ajoutez des cryptos pour suivre vos investissements</p>
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
                            {item.amount} {item.crypto_symbol.toUpperCase()} @ {currencySymbol}{item.purchase_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-white text-sm">{formatNumber(currentValue)}</p>
                          <span className={`font-mono text-xs font-semibold ${profit >= 0 ? "text-[#00FFAA]" : "text-[#FF3B30]"}`}>
                            {profit >= 0 ? "+" : ""}{formatNumber(profit)} ({profitPct.toFixed(2)}%)
                          </span>
                        </div>
                        <button
                          onClick={() => deletePortfolioItem(item.id)}
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
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" data-testid="alerts-tab">
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm">
              <div className="p-4 border-b border-[#262626]">
                <p className="font-heading font-bold text-white">Alertes de Prix</p>
                <p className="text-[#737373] text-sm mt-1">Notifications quand un prix atteint un seuil</p>
              </div>
              {alerts.length === 0 ? (
                <div className="p-16 text-center">
                  <Bell className="w-12 h-12 mx-auto text-[#262626] mb-4" />
                  <p className="text-white font-heading font-bold">Aucune alerte</p>
                  <p className="text-[#737373] text-sm mt-2">Creez des alertes depuis la liste des marches</p>
                </div>
              ) : (
                <div>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-4 px-4 py-3 border-b border-[#262626] hover:bg-[#111111] transition-colors"
                      data-testid={`alert-item-${alert.id}`}
                    >
                      <Activity size={16} className={alert.condition === "above" ? "text-[#00FFAA]" : "text-[#FF3B30]"} />
                      <div className="flex-1">
                        <p className="font-heading font-bold text-white text-sm">{alert.crypto_name}</p>
                        <p className="text-[#737373] text-xs">
                          {alert.condition === "above" ? "Au-dessus de" : "En-dessous de"}{" "}
                          <span className="font-mono text-white">{currencySymbol}{alert.target_price.toFixed(2)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 hover:bg-[#FF3B30]/20 rounded-sm transition-colors"
                        data-testid={`delete-alert-${alert.id}`}
                      >
                        <Trash2 size={14} className="text-[#FF3B30]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Converter Tab */}
          <TabsContent value="converter" data-testid="converter-tab">
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-6">
              <p className="font-heading font-bold text-white mb-1">Convertisseur Crypto</p>
              <p className="text-[#737373] text-sm mb-6">Conversion entre cryptomonnaies</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px] text-[#737373] uppercase tracking-widest">De</Label>
                  <Select value={convertFrom} onValueChange={setConvertFrom}>
                    <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="convert-from">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="binancecoin">BNB</SelectItem>
                      <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                      <SelectItem value="solana">Solana (SOL)</SelectItem>
                      <SelectItem value="ripple">XRP</SelectItem>
                      <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                      <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Montant</Label>
                  <Input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                    className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
                    min="0"
                    step="0.01"
                    data-testid="convert-amount"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Vers</Label>
                  <Select value={convertTo} onValueChange={setConvertTo}>
                    <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="convert-to">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="binancecoin">BNB</SelectItem>
                      <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                      <SelectItem value="solana">Solana (SOL)</SelectItem>
                      <SelectItem value="ripple">XRP</SelectItem>
                      <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                      <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleConvert}
                className="w-full bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm mt-6 font-body font-semibold"
                data-testid="convert-button"
              >
                Convertir
              </Button>

              {convertResult && (
                <div className="mt-6 bg-[#111111] border border-[#262626] rounded-sm p-6 text-center" data-testid="conversion-result">
                  <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Resultat</p>
                  <p className="font-mono font-bold text-3xl text-white">
                    {convertResult.result.toFixed(8)}
                  </p>
                  <p className="text-[#A3A3A3] text-sm mt-2 font-mono">
                    {convertAmount} {convertFrom.toUpperCase()} = {convertResult.result.toFixed(8)} {convertTo.toUpperCase()}
                  </p>
                  <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#262626]">
                    <span className="text-xs text-[#737373] font-mono">
                      {convertFrom.toUpperCase()}: ${convertResult.from_price_usd?.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#737373] font-mono">
                      {convertTo.toUpperCase()}: ${convertResult.to_price_usd?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chart Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-4xl bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="chart-dialog">
          <DialogHeader>
            <DialogTitle className="text-white font-heading">
              {selectedCrypto?.name} - Graphique
            </DialogTitle>
            <DialogDescription className="text-[#737373]">
              Evolution du prix sur {chartDays} jour{chartDays > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { label: "24h", val: 1 },
                { label: "7j", val: 7 },
                { label: "30j", val: 30 },
                { label: "1an", val: 365 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setChartDays(opt.val)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                    chartDays === opt.val
                      ? "bg-[#007AFF] text-white"
                      : "bg-[#111111] text-[#737373] hover:text-white hover:bg-[#262626]"
                  }`}
                  data-testid={`chart-period-${opt.val}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="time" stroke="#737373" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#737373" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #262626",
                    borderRadius: "2px",
                    fontFamily: "JetBrains Mono",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#737373" }}
                  itemStyle={{ color: "#007AFF" }}
                />
                <Area type="monotone" dataKey="price" stroke="#007AFF" strokeWidth={2} fill="url(#chartGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="alert-dialog">
          <DialogHeader>
            <DialogTitle className="text-white font-heading">Creer une Alerte</DialogTitle>
            <DialogDescription className="text-[#737373]">
              {selectedCrypto?.name} ({selectedCrypto?.symbol.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] text-[#737373] uppercase tracking-widest">
                Prix cible ({currencySymbol})
              </Label>
              <Input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="50000"
                className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
                data-testid="alert-price-input"
              />
            </div>
            <div>
              <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Condition</Label>
              <Select value={alertCondition} onValueChange={setAlertCondition}>
                <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="alert-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                  <SelectItem value="above">Au-dessus</SelectItem>
                  <SelectItem value="below">En-dessous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={addPriceAlert}
              className="bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm font-body"
              data-testid="create-alert-button"
            >
              Creer l'alerte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="portfolio-dialog">
          <DialogHeader>
            <DialogTitle className="text-white font-heading">Ajouter au Portfolio</DialogTitle>
            <DialogDescription className="text-[#737373]">
              {selectedCrypto?.name} ({selectedCrypto?.symbol.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Quantite</Label>
              <Input
                type="number"
                value={portfolioAmount}
                onChange={(e) => setPortfolioAmount(e.target.value)}
                placeholder="0.5"
                className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
                step="0.00000001"
                data-testid="portfolio-amount-input"
              />
            </div>
            <div>
              <Label className="text-[10px] text-[#737373] uppercase tracking-widest">
                Prix d'achat ({currencySymbol})
              </Label>
              <Input
                type="number"
                value={portfolioPurchasePrice}
                onChange={(e) => setPortfolioPurchasePrice(e.target.value)}
                placeholder="50000"
                className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
                data-testid="portfolio-price-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={addPortfolioItem}
              className="bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm font-body"
              data-testid="add-portfolio-button"
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#262626] mt-12" data-testid="app-footer">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <p className="text-center text-[#737373] text-xs font-mono">
            CRYPTO PORTAL PRO &middot; Donnees CoinGecko &middot; Mise a jour auto 60s
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
