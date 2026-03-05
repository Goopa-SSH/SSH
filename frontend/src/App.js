import { useEffect, useState, useMemo } from "react";
import "@/App.css";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Star, TrendingUp, TrendingDown, Bell, Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { toast as sonnerToast } from "sonner";

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

  // Alert form state
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState("above");

  // Portfolio form state
  const [portfolioAmount, setPortfolioAmount] = useState("");
  const [portfolioPurchasePrice, setPortfolioPurchasePrice] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cryptoFavorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Fetch crypto markets data
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

  // Fetch trending cryptos
  const fetchTrendingData = async () => {
    try {
      const response = await axios.get(`${API}/crypto/trending`);
      setTrendingData(response.data);
    } catch (error) {
      console.error("Error fetching trending data:", error);
    }
  };

  // Fetch portfolio
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  // Fetch chart data
  const fetchChartData = async (cryptoId, days) => {
    try {
      const response = await axios.get(`${API}/crypto/chart/${cryptoId}?days=${days}&currency=${currency}`);
      const formattedData = response.data.prices.map(item => ({
        time: new Date(item.timestamp).toLocaleDateString(),
        price: item.price
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Convert crypto
  const handleConvert = async () => {
    try {
      const response = await axios.get(
        `${API}/crypto/convert?from_crypto=${convertFrom}&to_crypto=${convertTo}&amount=${convertAmount}`
      );
      setConvertResult(response.data);
    } catch (error) {
      console.error("Error converting crypto:", error);
    }
  };

  // Toggle favorite
  const toggleFavorite = (cryptoId) => {
    const newFavorites = favorites.includes(cryptoId)
      ? favorites.filter(id => id !== cryptoId)
      : [...favorites, cryptoId];
    setFavorites(newFavorites);
    localStorage.setItem("cryptoFavorites", JSON.stringify(newFavorites));
    sonnerToast.success(favorites.includes(cryptoId) ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  // Add portfolio item
  const addPortfolioItem = async () => {
    if (!selectedCrypto || !portfolioAmount || !portfolioPurchasePrice) return;

    try {
      await axios.post(`${API}/portfolio`, {
        crypto_id: selectedCrypto.id,
        crypto_name: selectedCrypto.name,
        crypto_symbol: selectedCrypto.symbol,
        amount: parseFloat(portfolioAmount),
        purchase_price: parseFloat(portfolioPurchasePrice)
      });
      sonnerToast.success("Ajouté au portfolio");
      fetchPortfolio();
      setShowPortfolioDialog(false);
      setPortfolioAmount("");
      setPortfolioPurchasePrice("");
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      sonnerToast.error("Erreur lors de l'ajout");
    }
  };

  // Delete portfolio item
  const deletePortfolioItem = async (itemId) => {
    try {
      await axios.delete(`${API}/portfolio/${itemId}`);
      sonnerToast.success("Retiré du portfolio");
      fetchPortfolio();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
    }
  };

  // Add price alert
  const addPriceAlert = async () => {
    if (!selectedCrypto || !alertPrice) return;

    try {
      await axios.post(`${API}/alerts`, {
        crypto_id: selectedCrypto.id,
        crypto_name: selectedCrypto.name,
        crypto_symbol: selectedCrypto.symbol,
        target_price: parseFloat(alertPrice),
        condition: alertCondition
      });
      sonnerToast.success("Alerte créée");
      fetchAlerts();
      setShowAlertDialog(false);
      setAlertPrice("");
    } catch (error) {
      console.error("Error creating alert:", error);
      sonnerToast.error("Erreur lors de la création");
    }
  };

  // Delete alert
  const deleteAlert = async (alertId) => {
    try {
      await axios.delete(`${API}/alerts/${alertId}`);
      sonnerToast.success("Alerte supprimée");
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  // Open chart modal
  const openChart = (crypto) => {
    setSelectedCrypto(crypto);
    fetchChartData(crypto.id, chartDays);
    setShowChartDialog(true);
  };

  // Open alert modal
  const openAlertDialog = (crypto) => {
    setSelectedCrypto(crypto);
    setShowAlertDialog(true);
  };

  // Open portfolio modal
  const openPortfolioDialog = (crypto) => {
    setSelectedCrypto(crypto);
    setShowPortfolioDialog(true);
  };

  useEffect(() => {
    fetchCryptoData();
    fetchTrendingData();
    fetchPortfolio();
    fetchAlerts();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchTrendingData();
    }, 60000);

    return () => clearInterval(interval);
  }, [currency]);

  useEffect(() => {
    if (selectedCrypto && showChartDialog) {
      fetchChartData(selectedCrypto.id, chartDays);
    }
  }, [chartDays]);

  // Filter crypto data based on search
  const filteredCryptoData = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get favorite cryptos
  const favoriteCryptos = cryptoData.filter(crypto => favorites.includes(crypto.id));

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    let total = 0;
    let invested = 0;
    
    portfolio.forEach(item => {
      const crypto = cryptoData.find(c => c.id === item.crypto_id);
      if (crypto) {
        const currentValue = item.amount * crypto.current_price;
        const investedValue = item.amount * item.purchase_price;
        total += currentValue;
        invested += investedValue;
      }
    });
    
    return { total, invested, profit: total - invested, profitPercent: invested > 0 ? ((total - invested) / invested) * 100 : 0 };
  }, [portfolio, cryptoData]);

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const CryptoCard = ({ crypto }) => (
    <Card
      className="bg-black/40 border-purple-500/30 hover:border-purple-500/60 transition-all"
      data-testid={`crypto-card-${crypto.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{crypto.name}</h3>
                <Badge variant="outline" className="text-purple-300 border-purple-500/50">
                  {crypto.symbol.toUpperCase()}
                </Badge>
                {crypto.market_cap_rank && (
                  <Badge className="bg-purple-600">#{crypto.market_cap_rank}</Badge>
                )}
              </div>
              <p className="text-sm text-purple-300">
                Market Cap: {formatNumber(crypto.market_cap)}
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-2xl font-bold text-white">
              {currency === "usd" ? "$" : "€"}{crypto.current_price.toLocaleString()}
            </p>
            {crypto.price_change_percentage_24h !== null && (
              <Badge
                variant={crypto.price_change_percentage_24h > 0 ? "default" : "destructive"}
                className="text-sm"
              >
                {crypto.price_change_percentage_24h > 0 ? "↑" : "↓"}{" "}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFavorite(crypto.id)}
            className="border-purple-500/50 hover:bg-purple-600/20"
          >
            <Star className={favorites.includes(crypto.id) ? "fill-yellow-400 text-yellow-400" : ""} size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openChart(crypto)}
            className="border-purple-500/50 hover:bg-purple-600/20"
          >
            📈 Graphique
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAlertDialog(crypto)}
            className="border-purple-500/50 hover:bg-purple-600/20"
          >
            <Bell size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openPortfolioDialog(crypto)}
            className="border-purple-500/50 hover:bg-purple-600/20"
          >
            <Plus size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">₿</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Crypto Portal Pro</h1>
                <p className="text-purple-300 text-sm">
                  Suivi en temps réel des cryptomonnaies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 bg-black/40 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD $</SelectItem>
                  <SelectItem value="eur">EUR €</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-right">
                <p className="text-xs text-purple-300">Dernière mise à jour</p>
                <p className="text-sm text-white font-mono">
                  {lastUpdate.toLocaleTimeString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-300 text-sm">Total Marchés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{cryptoData.length}</p>
              <p className="text-xs text-cyan-200 mt-1">Cryptomonnaies suivies</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-pink-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-pink-300 text-sm">Bitcoin</CardTitle>
            </CardHeader>
            <CardContent>
              {cryptoData.length > 0 && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(cryptoData[0]?.current_price || 0)}
                  </p>
                  <Badge
                    variant={cryptoData[0]?.price_change_percentage_24h > 0 ? "default" : "destructive"}
                    className="mt-2"
                  >
                    {cryptoData[0]?.price_change_percentage_24h > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(cryptoData[0]?.price_change_percentage_24h || 0).toFixed(2)}%
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-emerald-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-300 text-sm">Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{formatNumber(portfolioValue.total)}</p>
              <Badge
                variant={portfolioValue.profit >= 0 ? "default" : "destructive"}
                className="mt-2"
              >
                {portfolioValue.profit >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {portfolioValue.profitPercent.toFixed(2)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-300 text-sm">Alertes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{alerts.length}</p>
              <p className="text-xs text-orange-200 mt-1">Alertes actives</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/30">
            <TabsTrigger value="markets" className="data-[state=active]:bg-purple-600">
              📊 Marchés
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-600">
              ⭐ Favoris
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              🔥 Tendances
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-purple-600">
              💼 Portfolio
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
              🔔 Alertes
            </TabsTrigger>
            <TabsTrigger value="converter" className="data-[state=active]:bg-purple-600">
              💱 Convertisseur
            </TabsTrigger>
          </TabsList>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher une cryptomonnaie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-purple-500/30 text-white placeholder:text-purple-300"
              />
              <Button onClick={fetchCryptoData} className="bg-purple-600 hover:bg-purple-700">
                🔄 Actualiser
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 bg-purple-500/20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCryptoData.map((crypto) => (
                  <CryptoCard key={crypto.id} crypto={crypto} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favoriteCryptos.length === 0 ? (
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                  <p className="text-white text-lg">Aucun favori pour le moment</p>
                  <p className="text-purple-300 text-sm mt-2">
                    Cliquez sur l'étoile pour ajouter des cryptos à vos favoris
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {favoriteCryptos.map((crypto) => (
                  <CryptoCard key={crypto.id} crypto={crypto} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">🔥 Cryptos en Tendance</CardTitle>
                <CardDescription className="text-purple-300">
                  Les cryptomonnaies les plus populaires du moment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingData.map((crypto, index) => (
                    <Card
                      key={crypto.id}
                      className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30"
                      data-testid={`trending-card-${crypto.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-bold text-purple-400">#{index + 1}</div>
                          <img src={crypto.thumb} alt={crypto.name} className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{crypto.name}</h4>
                            <p className="text-sm text-purple-300">{crypto.symbol.toUpperCase()}</p>
                          </div>
                          {crypto.market_cap_rank && (
                            <Badge className="bg-purple-600">Rang #{crypto.market_cap_rank}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">💼 Mon Portfolio</CardTitle>
                    <CardDescription className="text-purple-300">
                      Valeur totale: {formatNumber(portfolioValue.total)} • Investi: {formatNumber(portfolioValue.invested)}
                    </CardDescription>
                  </div>
                  <Badge variant={portfolioValue.profit >= 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {portfolioValue.profit >= 0 ? "+" : ""}{formatNumber(portfolioValue.profit)} ({portfolioValue.profitPercent.toFixed(2)}%)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                    <p className="text-white text-lg">Portfolio vide</p>
                    <p className="text-purple-300 text-sm mt-2">
                      Ajoutez des cryptos pour suivre vos investissements
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolio.map((item) => {
                      const crypto = cryptoData.find(c => c.id === item.crypto_id);
                      const currentValue = crypto ? item.amount * crypto.current_price : 0;
                      const investedValue = item.amount * item.purchase_price;
                      const profit = currentValue - investedValue;
                      const profitPercent = (profit / investedValue) * 100;

                      return (
                        <Card key={item.id} className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-bold">{item.crypto_name}</h4>
                                <p className="text-purple-300 text-sm">
                                  {item.amount} {item.crypto_symbol.toUpperCase()} • Acheté à {currency === "usd" ? "$" : "€"}{item.purchase_price.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{formatNumber(currentValue)}</p>
                                <Badge variant={profit >= 0 ? "default" : "destructive"} className="mt-1">
                                  {profit >= 0 ? "+" : ""}{formatNumber(profit)} ({profitPercent.toFixed(2)}%)
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletePortfolioItem(item.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">🔔 Alertes de Prix</CardTitle>
                <CardDescription className="text-purple-300">
                  Soyez notifié quand un prix atteint un seuil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                    <p className="text-white text-lg">Aucune alerte</p>
                    <p className="text-purple-300 text-sm mt-2">
                      Créez des alertes pour être notifié des changements de prix
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Card key={alert.id} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold">{alert.crypto_name}</h4>
                              <p className="text-orange-300 text-sm">
                                Alerte {alert.condition === "above" ? "au-dessus" : "en-dessous"} de {currency === "usd" ? "$" : "€"}{alert.target_price.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAlert(alert.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Converter Tab */}
          <TabsContent value="converter" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">💱 Convertisseur Crypto</CardTitle>
                <CardDescription className="text-purple-300">
                  Convertir entre différentes cryptomonnaies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">De</label>
                    <Select value={convertFrom} onValueChange={setConvertFrom}>
                      <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="binancecoin">Binance Coin (BNB)</SelectItem>
                        <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                        <SelectItem value="solana">Solana (SOL)</SelectItem>
                        <SelectItem value="ripple">Ripple (XRP)</SelectItem>
                        <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                        <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Montant</label>
                    <Input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                      className="bg-black/40 border-purple-500/30 text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Vers</label>
                    <Select value={convertTo} onValueChange={setConvertTo}>
                      <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="binancecoin">Binance Coin (BNB)</SelectItem>
                        <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                        <SelectItem value="solana">Solana (SOL)</SelectItem>
                        <SelectItem value="ripple">Ripple (XRP)</SelectItem>
                        <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                        <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="convert-button"
                >
                  Convertir
                </Button>

                {convertResult && (
                  <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-emerald-500/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-emerald-300 mb-2">Résultat</p>
                      <p className="text-4xl font-bold text-white mb-4" data-testid="conversion-result">
                        {convertResult.result.toFixed(8)}
                      </p>
                      <p className="text-sm text-emerald-200">
                        {convertAmount} {convertFrom.toUpperCase()} = {convertResult.result.toFixed(8)} {convertTo.toUpperCase()}
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-1">
                        <p className="text-xs text-emerald-300">
                          Prix {convertFrom.toUpperCase()}: ${convertResult.from_price_usd.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-300">
                          Prix {convertTo.toUpperCase()}: ${convertResult.to_price_usd.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chart Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-4xl bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedCrypto?.name} - Graphique de Prix
            </DialogTitle>
            <DialogDescription className="text-purple-300">
              Évolution du prix sur {chartDays} jours
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setChartDays(1)} variant={chartDays === 1 ? "default" : "outline"}>
                24h
              </Button>
              <Button size="sm" onClick={() => setChartDays(7)} variant={chartDays === 7 ? "default" : "outline"}>
                7j
              </Button>
              <Button size="sm" onClick={() => setChartDays(30)} variant={chartDays === 30 ? "default" : "outline"}>
                30j
              </Button>
              <Button size="sm" onClick={() => setChartDays(365)} variant={chartDays === 365 ? "default" : "outline"}>
                1an
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" />
                <XAxis dataKey="time" stroke="#c084fc" />
                <YAxis stroke="#c084fc" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #6b21a8" }}
                  labelStyle={{ color: "#c084fc" }}
                />
                <Line type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Créer une Alerte de Prix</DialogTitle>
            <DialogDescription className="text-purple-300">
              Pour {selectedCrypto?.name} ({selectedCrypto?.symbol.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-purple-300">Prix cible ({currency === "usd" ? "$" : "€"})</Label>
              <Input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Ex: 50000"
                className="bg-black/40 border-purple-500/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-purple-300">Condition</Label>
              <Select value={alertCondition} onValueChange={setAlertCondition}>
                <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Au-dessus</SelectItem>
                  <SelectItem value="below">En-dessous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addPriceAlert} className="bg-purple-600 hover:bg-purple-700">
              Créer l'alerte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
        <DialogContent className="bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Ajouter au Portfolio</DialogTitle>
            <DialogDescription className="text-purple-300">
              {selectedCrypto?.name} ({selectedCrypto?.symbol.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-purple-300">Quantité</Label>
              <Input
                type="number"
                value={portfolioAmount}
                onChange={(e) => setPortfolioAmount(e.target.value)}
                placeholder="Ex: 0.5"
                className="bg-black/40 border-purple-500/30 text-white"
                step="0.00000001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-purple-300">Prix d'achat ({currency === "usd" ? "$" : "€"})</Label>
              <Input
                type="number"
                value={portfolioPurchasePrice}
                onChange={(e) => setPortfolioPurchasePrice(e.target.value)}
                placeholder="Ex: 50000"
                className="bg-black/40 border-purple-500/30 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addPortfolioItem} className="bg-purple-600 hover:bg-purple-700">
              Ajouter au portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-purple-500/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-purple-300 text-sm">
            Données fournies par CoinGecko • Mise à jour automatique toutes les 60 secondes • ⭐ Favoris • 📈 Graphiques • 🔔 Alertes • 💼 Portfolio
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;