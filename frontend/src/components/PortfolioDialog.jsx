import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PortfolioDialog = ({ open, onOpenChange, selectedCrypto, currencySymbol, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const handleSubmit = async () => {
    if (!selectedCrypto || !amount || !purchasePrice) return;
    const success = await onSubmit(selectedCrypto, amount, purchasePrice);
    if (success) {
      setAmount("");
      setPurchasePrice("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="portfolio-dialog">
        <DialogHeader>
          <DialogTitle className="text-white font-heading">Ajouter au Portfolio</DialogTitle>
          <DialogDescription className="text-[#737373]">
            {selectedCrypto?.name} ({selectedCrypto?.symbol?.toUpperCase()})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Quantite</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.5"
              className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
              step="0.00000001"
              data-testid="portfolio-amount-input"
            />
          </div>
          <div>
            <Label className="text-[10px] text-[#737373] uppercase tracking-widest">
              Prix d'achat ({currencySymbol})
            </Label>
            <Input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="50000"
              className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
              data-testid="portfolio-price-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm font-body"
            data-testid="add-portfolio-button"
          >
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
