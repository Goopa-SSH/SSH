export const ConversionResult = ({ result, amount, from, to }) => (
  <div
    className="mt-6 bg-[#111111] border border-[#262626] rounded-sm p-6 text-center"
    data-testid="conversion-result"
  >
    <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2">
      Resultat
    </p>
    <p className="font-mono font-bold text-3xl text-white">
      {result.result.toFixed(8)}
    </p>
    <p className="text-[#A3A3A3] text-sm mt-2 font-mono">
      {amount} {from.toUpperCase()} = {result.result.toFixed(8)}{" "}
      {to.toUpperCase()}
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
);
