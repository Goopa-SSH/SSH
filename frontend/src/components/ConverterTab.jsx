import { useState, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast as sonnerToast } from "sonner";
import { logError } from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CRYPTO_OPTIONS = [
  { value: "bitcoin", label: "Bitcoin (BTC)" },
  { value: "ethereum", label: "Ethereum (ETH)" },
  { value: "binancecoin", label: "BNB" },
  { value: "cardano", label: "Cardano (ADA)" },
  { value: "solana", label: "Solana (SOL)" },
  { value: "ripple", label: "XRP" },
  { value: "polkadot", label: "Polkadot (DOT)" },
  { value: "dogecoin", label: "Dogecoin (DOGE)" },
];

export const ConverterTab = () => {
  const [from, setFrom] = useState("bitcoin");
  const [to, setTo] = useState("ethereum");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);

  const handleConvert = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API}/crypto/convert?from_crypto=${from}&to_crypto=${to}&amount=${amount}`
      );
      setResult(response.data);
    } catch (error) {
      logError("Error converting:", error);
      sonnerToast.error("Erreur de conversion");
    }
  }, [from, to, amount]);

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm p-6" data-testid="converter-tab">
      <p className="font-heading font-bold text-white mb-1">Convertisseur Crypto</p>
      <p className="text-[#737373] text-sm mb-6">Conversion entre cryptomonnaies</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-[10px] text-[#737373] uppercase tracking-widest">De</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="convert-from">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-[#262626]">
              {CRYPTO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Montant</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
            min="0"
            step="0.01"
            data-testid="convert-amount"
          />
        </div>
        <div>
          <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Vers</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="convert-to">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-[#262626]">
              {CRYPTO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleConvert}
        className="w-full bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm mt-6 font-body font-semibold"
        data-testid="convert-button"
      >
        Convertir
      </Button>

      {result && (
        <div className="mt-6 bg-[#111111] border border-[#262626] rounded-sm p-6 text-center" data-testid="conversion-result">
          <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">Resultat</p>
          <p className="font-mono font-bold text-3xl text-white">{result.result.toFixed(8)}</p>
          <p className="text-[#A3A3A3] text-sm mt-2 font-mono">
            {amount} {from.toUpperCase()} = {result.result.toFixed(8)} {to.toUpperCase()}
          </p>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#262626]">
            <span className="text-xs text-[#737373] font-mono">
              {from.toUpperCase()}: ${result.from_price_usd?.toLocaleString()}
            </span>
            <span className="text-xs text-[#737373] font-mono">
              {to.toUpperCase()}: ${result.to_price_usd?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
