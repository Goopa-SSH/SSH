import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Fetch crypto markets data
  const fetchCryptoData = async () => {
    try {
      const response = await axios.get(`${API}/crypto/markets?limit=50`);
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

  useEffect(() => {
    fetchCryptoData();
    fetchTrendingData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchTrendingData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter crypto data based on search
  const filteredCryptoData = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">₿</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Crypto Portal</h1>
                <p className="text-purple-300 text-sm">
                  Suivi en temps réel des cryptomonnaies
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-300">Dernière mise à jour</p>
              <p className="text-sm text-white font-mono">
                {lastUpdate.toLocaleTimeString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    variant={
                      cryptoData[0]?.price_change_percentage_24h > 0
                        ? "default"
                        : "destructive"
                    }
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
              <CardTitle className="text-emerald-300 text-sm">Tendances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{trendingData.length}</p>
              <p className="text-xs text-emerald-200 mt-1">Cryptos en tendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/30">
            <TabsTrigger value="markets" className="data-[state=active]:bg-purple-600">
              📊 Marchés
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              🔥 Tendances
            </TabsTrigger>
            <TabsTrigger value="converter" className="data-[state=active]:bg-purple-600">
              💱 Convertisseur
            </TabsTrigger>
          </TabsList>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher une cryptomonnaie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-purple-500/30 text-white placeholder:text-purple-300"
              />
              <Button 
                onClick={fetchCryptoData}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🔄 Actualiser
              </Button>
            </div>

            {/* Crypto Table */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 bg-purple-500/20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCryptoData.map((crypto) => (
                  <Card
                    key={crypto.id}
                    className="bg-black/40 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer"
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
                              <h3 className="text-lg font-bold text-white">
                                {crypto.name}
                              </h3>
                              <Badge variant="outline" className="text-purple-300 border-purple-500/50">
                                {crypto.symbol.toUpperCase()}
                              </Badge>
                              {crypto.market_cap_rank && (
                                <Badge className="bg-purple-600">
                                  #{crypto.market_cap_rank}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-purple-300">
                              Market Cap: {formatNumber(crypto.market_cap)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-2xl font-bold text-white">
                            ${crypto.current_price.toLocaleString()}
                          </p>
                          {crypto.price_change_percentage_24h !== null && (
                            <Badge
                              variant={
                                crypto.price_change_percentage_24h > 0
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-sm"
                            >
                              {crypto.price_change_percentage_24h > 0 ? "↑" : "↓"}{" "}
                              {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                            </Badge>
                          )}
                          {crypto.high_24h && crypto.low_24h && (
                            <p className="text-xs text-purple-300">
                              24h: ${crypto.low_24h.toFixed(2)} - $
                              {crypto.high_24h.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                          <div className="text-2xl font-bold text-purple-400">
                            #{index + 1}
                          </div>
                          <img
                            src={crypto.thumb}
                            alt={crypto.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{crypto.name}</h4>
                            <p className="text-sm text-purple-300">
                              {crypto.symbol.toUpperCase()}
                            </p>
                          </div>
                          {crypto.market_cap_rank && (
                            <Badge className="bg-purple-600">
                              Rang #{crypto.market_cap_rank}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                        {convertAmount} {convertFrom.toUpperCase()} ={" "}
                        {convertResult.result.toFixed(8)} {convertTo.toUpperCase()}
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-1">
                        <p className="text-xs text-emerald-300">
                          Prix {convertFrom.toUpperCase()}: $
                          {convertResult.from_price_usd.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-300">
                          Prix {convertTo.toUpperCase()}: $
                          {convertResult.to_price_usd.toLocaleString()}
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

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-purple-500/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-purple-300 text-sm">
            Données fournies par CoinGecko • Mise à jour automatique toutes les 60 secondes
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
