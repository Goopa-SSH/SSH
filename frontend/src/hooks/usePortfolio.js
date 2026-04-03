import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast as sonnerToast } from "sonner";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState([]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      logError("Error fetching portfolio:", error);
    }
  }, []);

  const addPortfolioItem = useCallback(
    async (crypto, amount, purchasePrice) => {
      try {
        await axios.post(`${API}/portfolio`, {
          crypto_id: crypto.id,
          crypto_name: crypto.name,
          crypto_symbol: crypto.symbol,
          amount: parseFloat(amount),
          purchase_price: parseFloat(purchasePrice),
        });
        sonnerToast.success("Ajoute au portfolio");
        fetchPortfolio();
        return true;
      } catch (error) {
        logError("Error adding portfolio item:", error);
        sonnerToast.error("Erreur lors de l'ajout");
        return false;
      }
    },
    [fetchPortfolio]
  );

  const deletePortfolioItem = useCallback(
    async (itemId) => {
      try {
        await axios.delete(`${API}/portfolio/${itemId}`);
        sonnerToast.success("Retire du portfolio");
        fetchPortfolio();
      } catch (error) {
        logError("Error deleting portfolio item:", error);
      }
    },
    [fetchPortfolio]
  );

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, addPortfolioItem, deletePortfolioItem };
}
