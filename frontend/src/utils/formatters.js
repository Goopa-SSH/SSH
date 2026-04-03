export const formatNumber = (num, currencySymbol = "$") => {
  if (num >= 1e12) return `${currencySymbol}${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${currencySymbol}${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${currencySymbol}${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${currencySymbol}${(num / 1e3).toFixed(2)}K`;
  return `${currencySymbol}${num.toFixed(2)}`;
};

export const formatPrice = (price, currencySymbol = "$") => {
  if (price >= 1) {
    return `${currencySymbol}${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return `${currencySymbol}${price.toFixed(6)}`;
};
