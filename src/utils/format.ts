/**
 * Formats a number or string as Thai Baht (THB) currency.
 * @param value The value to format
 * @param showSymbol Whether to show the ฿ symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string,
  showSymbol: boolean = true,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  const formatted = num.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `฿${formatted}` : formatted;
};

/**
 * Formats a date string or Date object to a standard Thai locale string.
 * @param date The date to format
 * @param showTime Whether to include time in the output
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  showTime: boolean = false,
): string => {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(showTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };

  return d.toLocaleString("th-TH", options);
};
