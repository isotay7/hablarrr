"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useStore } from "@/lib/store";
import { isDue } from "@/lib/srs";
import { sfx } from "@/lib/sounds";
import { DeckTarget } from "./DeckFly";
import { Icon, type IconName } from "./Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Hoy", icon: "home" },
  { href: "/chill", label: "Chill", icon: "feed" },
  { href: "/leer", label: "Leer", icon: "book" },
  { href: "/repasar", label: "Repasar", icon: "deck" },
  { href: "/progreso", label: "Progreso", icon: "rings" },
];

export function TabBar() {
  const pathname = usePathname();
  const { data } = useStore();
  const due = data.deck.filter((c) => isDue(c)).length;

  return (
    <nav aria-label="Main" className="pb-safe shrink-0 border-t border-line bg-nav">
      <ul className="mx-auto grid h-[76px] max-w-3xl grid-cols-5 px-2">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="relative">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                onClick={() => sfx.tap()}
                className={`relative flex h-full flex-col items-center justify-center gap-1 text-[13px] ${
                  active ? "font-bold text-accent-text" : "font-semibold text-muted"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute top-2 h-9 w-14 rounded-full bg-learn"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">
                  {t.icon === "deck" ? (
                    <DeckTarget>
                      <Icon name={t.icon} size={26} />
                    </DeckTarget>
                  ) : (
                    <Icon name={t.icon} size={26} />
                  )}
                  {t.icon === "deck" && due > 0 && (
                    <span className="absolute -right-3 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra-soft px-1 text-[11px] font-extrabold text-white">
                      {due > 99 ? "99+" : due}
                    </span>
                  )}
                </span>
                <span className="relative">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
