import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useMarketData(currency) {
  const [cryptoData, setCryptoData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchMarkets = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/crypto/markets?limit=50&currency=${currency}`
      );
      setCryptoData(res.data);
      setLastUpdate(new Date());
    } catch (err) {
      logError("Error fetching markets:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/crypto/trending`);
      setTrendingData(res.data);
    } catch (err) {
      logError("Error fetching trending:", err);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    // Stagger trending fetch to avoid parallel CoinGecko hits
    const trendTimer = setTimeout(fetchTrending, 2000);
    const id = setInterval(() => {
      fetchMarkets();
      setTimeout(fetchTrending, 2000);
    }, 60000);
    return () => {
      clearTimeout(trendTimer);
      clearInterval(id);
    };
  }, [fetchMarkets, fetchTrending]);

  return { cryptoData, trendingData, loading, lastUpdate, fetchMarkets };
}
