import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useCryptoData(currency) {
  const [cryptoData, setCryptoData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(7);

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/crypto/markets?limit=50&currency=${currency}`);
      setCryptoData(response.data);
      setLoading(false);
      setLastUpdate(new Date());
    } catch (error) {
      logError("Error fetching crypto data:", error);
      setLoading(false);
    }
  }, [currency]);

  const fetchTrendingData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/crypto/trending`);
      setTrendingData(response.data);
    } catch (error) {
      logError("Error fetching trending data:", error);
    }
  }, []);

  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/crypto/global`);
      setGlobalStats(response.data);
    } catch (error) {
      logError("Error fetching global stats:", error);
    }
  }, []);

  const fetchFearGreed = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/crypto/fear-greed`);
      setFearGreed(response.data);
    } catch (error) {
      logError("Error fetching fear & greed:", error);
    }
  }, []);

  const fetchChartData = useCallback(
    async (cryptoId, days) => {
      try {
        const response = await axios.get(
          `${API}/crypto/chart/${cryptoId}?days=${days}&currency=${currency}`
        );
        const formatted = response.data.prices.map((item) => ({
          time: new Date(item.timestamp).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
            ...(days <= 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
          }),
          price: item.price,
        }));
        setChartData(formatted);
      } catch (error) {
        logError("Error fetching chart data:", error);
      }
    },
    [currency]
  );

  useEffect(() => {
    fetchCryptoData();
    fetchTrendingData();
    fetchGlobalStats();
    fetchFearGreed();

    const interval = setInterval(() => {
      fetchCryptoData();
      fetchTrendingData();
      fetchGlobalStats();
      fetchFearGreed();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchCryptoData, fetchTrendingData, fetchGlobalStats, fetchFearGreed]);

  return {
    cryptoData,
    trendingData,
    globalStats,
    fearGreed,
    loading,
    lastUpdate,
    chartData,
    chartDays,
    setChartDays,
    fetchCryptoData,
    fetchChartData,
  };
}
