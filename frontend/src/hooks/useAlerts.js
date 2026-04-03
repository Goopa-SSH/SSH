import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast as sonnerToast } from "sonner";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      logError("Error fetching alerts:", error);
    }
  }, []);

  const addPriceAlert = useCallback(
    async (crypto, targetPrice, condition) => {
      try {
        await axios.post(`${API}/alerts`, {
          crypto_id: crypto.id,
          crypto_name: crypto.name,
          crypto_symbol: crypto.symbol,
          target_price: parseFloat(targetPrice),
          condition,
        });
        sonnerToast.success("Alerte creee");
        fetchAlerts();
        return true;
      } catch (error) {
        logError("Error creating alert:", error);
        sonnerToast.error("Erreur lors de la creation");
        return false;
      }
    },
    [fetchAlerts]
  );

  const deleteAlert = useCallback(
    async (alertId) => {
      try {
        await axios.delete(`${API}/alerts/${alertId}`);
        sonnerToast.success("Alerte supprimee");
        fetchAlerts();
      } catch (error) {
        logError("Error deleting alert:", error);
      }
    },
    [fetchAlerts]
  );

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, addPriceAlert, deleteAlert };
}
