import dayjs from "dayjs";

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function formatToBaseDate(input: string | Date): string {
  return dayjs(input).format("YYYYMMDD");
}
