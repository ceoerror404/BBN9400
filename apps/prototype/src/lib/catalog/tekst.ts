/** Kleine letters, zonder accenten: "Plissé" wordt "plisse". Om namen en filterwaarden te vergelijken. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
