import type { Phrase } from "@/content/types";

// El puesto de tacos: a short branching scene. At each moment the taquero says
// something and you answer with a phrase you know. Good answers earn tips.

export interface Say {
  es: string;
  en: string;
}

export interface GoodAnswer {
  /** A Stage 1 phrase id. */
  id: string;
  tip: number;
  reply: Say;
  /** Where the scene goes next; the next moment in order when missing. */
  goto?: string;
  /** Only offered when this phrase is also learned (it's needed later on). */
  needs?: string;
}

export interface Moment {
  id: string;
  /** What you see happen, in English. */
  action: string;
  line: Say;
  good: GoodAnswer[];
  /** Branch-only moments are skipped in the normal order. */
  branch?: boolean;
}

export const TACO_SCENE: Moment[] = [
  {
    id: "llegar",
    action: "You walk up to a busy taco stand. The grill sizzles.",
    line: { es: "¡Buenas, joven! Pásele, pásele.", en: "Evening, young man! Come on up." },
    good: [
      { id: "f24", tip: 5, reply: { es: "¡Buenas noches! ¿Qué le doy?", en: "Good evening! What can I get you?" } },
      { id: "f01", tip: 4, reply: { es: "¡Hola! ¿Qué le doy?", en: "Hi! What can I get you?" } },
      { id: "f23", tip: 4, reply: { es: "Buenas tardes. ¿Qué le doy?", en: "Good afternoon. What can I get you?" } },
    ],
  },
  {
    id: "pedir",
    action: "He wipes his hands and waits for your order.",
    line: { es: "¿Qué le doy?", en: "What can I get you?" },
    good: [
      {
        id: "f31",
        tip: 6,
        reply: { es: "¡Dos de pastor, marchando!", en: "Two al pastor, coming right up!" },
      },
    ],
  },
  {
    id: "llevar",
    action: "The tacos land on the plate.",
    line: { es: "¿Para aquí o para llevar?", en: "For here or to go?" },
    good: [
      {
        id: "f32",
        tip: 5,
        reply: { es: "Para llevar. Ahorita se los envuelvo.", en: "To go. I’ll wrap them up right now." },
      },
    ],
  },
  {
    id: "tomar",
    action: "He points at the big jars of agua fresca.",
    line: { es: "¿Algo de tomar?", en: "Anything to drink?" },
    good: [
      { id: "f12", tip: 5, reply: { es: "Un agua, ¡claro que sí!", en: "A water, of course!" } },
      { id: "f19", tip: 4, reply: { es: "Le doy una de horchata, ¡está buenísima!", en: "I’ll give you a horchata, it’s great!" } },
      { id: "f20", tip: 3, reply: { es: "Va, sin bebida.", en: "Okay, no drink." } },
    ],
  },
  {
    id: "probar",
    action: "He hands you a tortilla chip with salsa to try.",
    line: { es: "Pruebe la salsa, joven. ¿Qué tal?", en: "Try the salsa, young man. How is it?" },
    good: [
      { id: "f47", tip: 6, reply: { es: "¡Verdad que sí! Es receta de mi mamá.", en: "Right? It’s my mom’s recipe." } },
      { id: "f33", tip: 6, reply: { es: "¡Gracias! Es receta de mi mamá.", en: "Thanks! It’s my mom’s recipe." } },
      { id: "f04", tip: 3, reply: { es: "De nada. ¿Pica mucho?", en: "You’re welcome. Is it very spicy?" } },
    ],
  },
  {
    id: "mas",
    action: "He bags everything up.",
    line: { es: "¿Algo más?", en: "Anything else?" },
    good: [
      { id: "f38", tip: 5, reply: { es: "Muy bien.", en: "Very good." } },
      { id: "f20", tip: 3, reply: { es: "Muy bien.", en: "Very good." } },
    ],
  },
  {
    id: "precio",
    action: "He holds out the bag. Time to ask the price.",
    line: { es: "Aquí tiene sus tacos.", en: "Here are your tacos." },
    good: [
      { id: "f10", tip: 5, reply: { es: "Son ochenta pesos.", en: "That’s eighty pesos." } },
      { id: "f04", tip: 3, reply: { es: "De nada. Son ochenta pesos.", en: "You’re welcome. That’s eighty pesos." } },
    ],
  },
  {
    id: "pagar",
    action: "You reach for your wallet.",
    line: { es: "¿Cómo va a pagar?", en: "How are you going to pay?" },
    good: [
      { id: "f30", tip: 5, reply: { es: "Perfecto, gracias.", en: "Perfect, thanks." }, goto: "despedida" },
      {
        id: "f29",
        tip: 3,
        reply: { es: "Uy, no, joven. Aquí puro efectivo.", en: "Oh, no, young man. Cash only here." },
        goto: "efectivo",
        needs: "f30",
      },
    ],
  },
  {
    id: "efectivo",
    branch: true,
    action: "He shrugs and smiles. Cash it is.",
    line: { es: "¿Trae efectivo?", en: "Do you have cash?" },
    good: [{ id: "f30", tip: 4, reply: { es: "Perfecto, gracias.", en: "Perfect, thanks." } }],
  },
  {
    id: "despedida",
    action: "He hands you your change and the bag.",
    line: { es: "¡Gracias, joven! ¡Provecho!", en: "Thanks, young man! Enjoy!" },
    good: [
      { id: "f50", tip: 6, reply: { es: "¡Igualmente! Vuelva pronto.", en: "You too! Come back soon." } },
      { id: "f49", tip: 5, reply: { es: "¡Hasta luego! Vuelva pronto.", en: "See you! Come back soon." } },
      { id: "f04", tip: 4, reply: { es: "A usted. ¡Vuelva pronto!", en: "Thank you. Come back soon!" } },
    ],
  },
];

/** Funny reactions to answers that make no sense here, some for particular phrases. */
export const WEIRD: Record<string, Say> = {
  f11: { es: "¿El baño? Joven, esto es un puesto en la calle.", en: "The bathroom? Young man, this is a street stand." },
  f35: { es: "¿Lleno? Esto es un puesto de tacos, no una gasolinera.", en: "Fill it up? This is a taco stand, not a gas station." },
  f36: { es: "¿Una reservación? Jaja, aquí ni hay mesas.", en: "A reservation? Haha, there aren’t even tables here." },
  f44: { es: "¿¡Un doctor!? ¿Tan picosa está la salsa?", en: "A doctor!? Is the salsa that spicy?" },
  f46: { es: "¿Al centro? Yo no soy taxista, joven.", en: "Downtown? I’m not a taxi driver, young man." },
  f39: { es: "¡Qué bien! Entonces me deja buena propina, ¿no?", en: "Nice! Then you’ll leave a good tip, right?" },
  f21: { es: "¿Inglés? Mmm… taco. ¡Very good!", en: "English? Hmm… taco. Very good!" },
  f45: { es: "¿Una farmacia? ¡Pero si ni ha probado la salsa!", en: "A pharmacy? You haven’t even tried the salsa yet!" },
  f26: { es: "¿El hotel? Ni idea, joven. Yo solo sé de tacos.", en: "The hotel? No idea, young man. I only know tacos." },
  f37: { es: "Hora de tacos, joven. Siempre es hora de tacos.", en: "Taco time, young man. It’s always taco time." },
  f43: { es: "Ay, ¿se siente mal? Pues aquí tenemos caldo… no, es broma.", en: "Oh, you feel sick? Well, we have soup… no, kidding." },
};

export const WEIRD_GENERIC: Say[] = [
  { es: "¿Mande? Jaja, ¿cómo dijo?", en: "Pardon? Haha, what did you say?" },
  { es: "Ay, joven, ¿se siente bien?", en: "Oh, young man, are you feeling okay?" },
  { es: "Jaja, ¡qué chistoso es usted!", en: "Haha, you’re a funny one!" },
  { es: "¿Cómo? No le entendí, joven.", en: "What? I didn’t catch that, young man." },
  { es: "Mmm… la señora de atrás se está riendo.", en: "Hmm… the lady behind you is laughing." },
];

/** The moments you'd actually play, in order. */
export const MAIN_PATH = TACO_SCENE.filter((m) => !m.branch);

/** Good answers you can give at a moment, given what you've learned. */
export function usableGood(m: Moment, learned: Set<string>): GoodAnswer[] {
  return m.good.filter((g) => learned.has(g.id) && (!g.needs || learned.has(g.needs)));
}

/** The stand opens when every moment on the main path has an answer you know. */
export function tacoStandReady(learned: Phrase[]) {
  const ids = new Set(learned.map((p) => p.id));
  const have = MAIN_PATH.filter((m) => usableGood(m, ids).length > 0).length;
  return { ready: have === MAIN_PATH.length, have, need: MAIN_PATH.length };
}
