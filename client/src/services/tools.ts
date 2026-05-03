export function getTimeStr(date: Date | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  const m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
  const h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
  return `${h}:${m}`;
}
export async function hashSHA256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function cleanName(name: string): string {
  return name
    .replace(/[^\p{L}\s-]/gu, "") // убираем эмодзи и спецсимволы
    .toLowerCase()
    .trim();
}
