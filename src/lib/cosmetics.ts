// Things to buy with pesos. Purely for fun: nothing here changes how you learn.

export type CosmeticKind = "theme" | "cardBack" | "celebration";

export interface Cosmetic {
  id: string;
  kind: CosmeticKind;
  es: string;
  en: string;
  price: number;
  /** Swatch colors for the shop. */
  swatch: string[];
}

export const COSMETICS: Cosmetic[] = [
  // Themes. "night" and "light" are free and always owned.
  { id: "talavera", kind: "theme", es: "Talavera", en: "Blue and white tile", price: 150, swatch: ["#F5F1E8", "#1F4E9C", "#E0B13A"] },
  { id: "jacaranda", kind: "theme", es: "Jacaranda", en: "Purple spring night", price: 200, swatch: ["#1E1626", "#9B6BD3", "#F2A93B"] },
  { id: "mar", kind: "theme", es: "Mar de Cortés", en: "Deep sea and sand", price: 250, swatch: ["#0F1F24", "#2FA3A0", "#F2C46B"] },

  // Card backs for Parejas and Lotería.
  { id: "clasico", kind: "cardBack", es: "Clásico", en: "Terracotta flags", price: 0, swatch: ["#B4532F", "#F2A93B"] },
  { id: "azulejo", kind: "cardBack", es: "Azulejo", en: "Painted tile", price: 80, swatch: ["#1F4E9C", "#F5F1E8"] },
  { id: "cempasuchil", kind: "cardBack", es: "Cempasúchil", en: "Marigold", price: 100, swatch: ["#E8891C", "#FFD27A"] },
  { id: "noche", kind: "cardBack", es: "Noche estrellada", en: "Starry night", price: 120, swatch: ["#1B2340", "#F2E2A8"] },

  // Celebrations when you win.
  { id: "papel", kind: "celebration", es: "Papel picado", en: "Paper flags", price: 0, swatch: ["#F2A93B", "#D2694A", "#4F7BC9"] },
  { id: "flores", kind: "celebration", es: "Lluvia de flores", en: "Marigold petals", price: 120, swatch: ["#E8891C", "#FFC24A", "#C2432B"] },
  { id: "estrellas", kind: "celebration", es: "Estrellitas", en: "Shooting stars", price: 150, swatch: ["#FFE7A3", "#F2A93B", "#FFFFFF"] },
  { id: "pinata", kind: "celebration", es: "Piñata", en: "Candy burst", price: 200, swatch: ["#D9578C", "#3F8A6B", "#E0B13A"] },
];

export function cosmetic(id: string) {
  return COSMETICS.find((c) => c.id === id);
}

/** Free things everyone has. */
export const FREE = new Set(["night", "light", "clasico", "papel"]);
