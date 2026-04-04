import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useGlobalStats() {
  const [globalStats, setGlobalStats] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);

  const fetchGlobal = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/crypto/global`);
      setGlobalStats(res.data);
    } catch (err) {
      logError("Error fetching global stats:", err);
    }
  }, []);

  const fetchFearGreed = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/crypto/fear-greed`);
      setFearGreed(res.data);
    } catch (err) {
      logError("Error fetching fear & greed:", err);
    }
  }, []);

  useEffect(() => {
    fetchGlobal();
    fetchFearGreed();
    const id = setInterval(() => {
      fetchGlobal();
      fetchFearGreed();
    }, 60000);
    return () => clearInterval(id);
  }, [fetchGlobal, fetchFearGreed]);

  return { globalStats, fearGreed };
}
