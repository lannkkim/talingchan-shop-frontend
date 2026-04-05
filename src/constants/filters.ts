export const COLORS = ["แดง", "ฟ้า", "เขียว", "ม่วง"];

export const COLOR_HEX_MAP: Record<string, string> = {
  "#FF0000": "แดง",
  "#FF4444": "แดง",
  "#00FFFF": "ฟ้า",
  "#00BFFF": "ฟ้า",
  "#0000FF": "ฟ้า",
  "#00FF00": "เขียว",
  "#6AA84F": "เขียว",
  "#008000": "เขียว",
  "#9900FF": "ม่วง",
  "#8B00FF": "ม่วง",
  "#800080": "ม่วง",
  "#FFFFFF": "ขาว",
  "#000000": "ดำ",
};

export const colorToThai = (color: string | null | undefined): string => {
  if (!color) return "-";
  if (!color.startsWith("#")) return color; // already Thai
  const upper = color.toUpperCase();
  return COLOR_HEX_MAP[upper] ?? color;
};
export const TYPES = ["Avatar", "Magic", "Life", "Construct"];
export const SUBTYPES = ["Normal", "Modification", "React", "Land"];
export const RARITIES = ["C", "R", "SR", "UR", "SCR", "CBR", "PR", "USEC"];
export const SYMBOLS = [
  "เทพ",
  "ยักษ์",
  "จอมเวทย์",
  "คน",
  "แมลง",
  "สัตว์",
  "รัททาทุย",
  "นรก",
  "ผี",
  "ปลา",
  "หุ่นยนต์",
  "สิ่งก่อสร้าง",
  "ต่างชาติ",
  "ต้นไม้",
  "เปรต",
  "ฤษี",
  "เอเลี่ยน",
  "กะปอม",
  "สัตว์มหัศจรรย์",
  "ทหาร",
];
export const PRINTS = [
  "BT01",
  "BT02",
  "BT03",
  "BT04",
  "BT05",
  "BT06",
  "BT07",
  "BT08",
  "CC01",
  "CC02",
  "ODY1",
  "PRE0",
  "PRMO",
  "SD01",
  "SD02",
  "SD03",
  "SD04",
  "SD05",
  "SD06",
  "SD07",
  "SL01",
];
export const GEMS = [0, 1, 2, 3, 4];
export const POWER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
