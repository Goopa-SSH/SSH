import { useState, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast as sonnerToast } from "sonner";
import { logError } from "@/utils/logger";
import { ConversionResult } from "@/components/ConversionResult";

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

const CryptoSelect = ({ value, onChange, testId }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid={testId}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-[#0A0A0A] border-[#262626]">
      {CRYPTO_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const ConverterTab = () => {
  const [from, setFrom] = useState("bitcoin");
  const [to, setTo] = useState("ethereum");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);

  const handleConvert = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/crypto/convert?from_crypto=${from}&to_crypto=${to}&amount=${amount}`
      );
      setResult(res.data);
    } catch (err) {
      logError("Error converting:", err);
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
          <CryptoSelect value={from} onChange={setFrom} testId="convert-from" />
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
          <CryptoSelect value={to} onChange={setTo} testId="convert-to" />
        </div>
      </div>

      <Button
        onClick={handleConvert}
        className="w-full bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm mt-6 font-body font-semibold"
        data-testid="convert-button"
      >
        Convertir
      </Button>

      {result && <ConversionResult result={result} amount={amount} from={from} to={to} />}
    </div>
  );
};
