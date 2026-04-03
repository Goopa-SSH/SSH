import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const PriceChange = ({ value, className = "" }) => {
  if (value === null || value === undefined) {
    return <span className="text-[#737373]">--</span>;
  }
  const positive = value > 0;
  return (
    <span
      className={`font-mono font-semibold inline-flex items-center gap-0.5 ${
        positive ? "text-[#00FFAA]" : "text-[#FF3B30]"
      } ${className}`}
      data-testid="price-change"
    >
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
};
