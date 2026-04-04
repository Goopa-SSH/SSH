import { useState, useCallback } from "react";
import axios from "axios";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useChartData(currency) {
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(7);

  const fetchChart = useCallback(
    async (cryptoId, days) => {
      try {
        const res = await axios.get(
          `${API}/crypto/chart/${cryptoId}?days=${days}&currency=${currency}`
        );
        const formatted = res.data.prices.map((item) => ({
          time: new Date(item.timestamp).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
            ...(days <= 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
          }),
          price: item.price,
        }));
        setChartData(formatted);
      } catch (err) {
        logError("Error fetching chart data:", err);
      }
    },
    [currency]
  );

  return { chartData, chartDays, setChartDays, fetchChart };
}
