import { useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useNotifications() {
  const permissionRef = useRef(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const notifiedRef = useRef(new Set());

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      permissionRef.current = result;
    }
  }, []);

  const sendNotification = useCallback((title, body) => {
    if (permissionRef.current !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: title,
      });
    } catch (err) {
      logError("Notification error:", err);
    }
  }, []);

  const checkAlerts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/alerts/check`);
      const triggered = res.data?.triggered || [];
      for (const alert of triggered) {
        const key = `${alert.id}-${alert.current_price.toFixed(0)}`;
        if (notifiedRef.current.has(key)) continue;
        notifiedRef.current.add(key);
        const direction = alert.condition === "above" ? "au-dessus" : "en-dessous";
        sendNotification(
          `${alert.crypto_name} (${alert.crypto_symbol.toUpperCase()})`,
          `Prix ${direction} de $${alert.target_price} — Actuellement $${alert.current_price.toLocaleString()}`
        );
      }
    } catch (err) {
      logError("Error checking alerts:", err);
    }
  }, [sendNotification]);

  useEffect(() => {
    requestPermission();
    // Stagger alert check to avoid CoinGecko rate limit cascade
    const timer = setTimeout(checkAlerts, 5000);
    const id = setInterval(checkAlerts, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
    };
  }, [requestPermission, checkAlerts]);

  return { requestPermission, permissionGranted: permissionRef.current === "granted" };
}
