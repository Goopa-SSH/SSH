import { useState, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("cryptoFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((cryptoId) => {
    setFavorites((prev) => {
      const next = prev.includes(cryptoId)
        ? prev.filter((id) => id !== cryptoId)
        : [...prev, cryptoId];
      localStorage.setItem("cryptoFavorites", JSON.stringify(next));
      sonnerToast.success(
        prev.includes(cryptoId) ? "Retire des favoris" : "Ajoute aux favoris"
      );
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
