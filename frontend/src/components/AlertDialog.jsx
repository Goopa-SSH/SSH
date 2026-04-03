import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AlertDialog = ({ open, onOpenChange, selectedCrypto, currencySymbol, onSubmit }) => {
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("above");

  const handleSubmit = async () => {
    if (!selectedCrypto || !price) return;
    const success = await onSubmit(selectedCrypto, price, condition);
    if (success) {
      setPrice("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-[#262626] rounded-sm" data-testid="alert-dialog">
        <DialogHeader>
          <DialogTitle className="text-white font-heading">Creer une Alerte</DialogTitle>
          <DialogDescription className="text-[#737373]">
            {selectedCrypto?.name} ({selectedCrypto?.symbol?.toUpperCase()})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] text-[#737373] uppercase tracking-widest">
              Prix cible ({currencySymbol})
            </Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
              className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2 font-mono"
              data-testid="alert-price-input"
            />
          </div>
          <div>
            <Label className="text-[10px] text-[#737373] uppercase tracking-widest">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="bg-[#111111] border-[#262626] text-white rounded-sm mt-2" data-testid="alert-condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                <SelectItem value="above">Au-dessus</SelectItem>
                <SelectItem value="below">En-dessous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-sm font-body"
            data-testid="create-alert-button"
          >
            Creer l'alerte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
