import type { Unit } from "./domain";
export const colors: Record<string, string> = {
  mira: "#edbd6e",
  bram: "#79b899",
  sable: "#a5a1d4",
  ione: "#e7a6ac",
};
export function portrait(u: Unit): string {
  const ally = u.team === "ally",
    color = colors[u.id] ?? "#be7770";
  const hair =
    u.id === "mira"
      ? "#6b342d"
      : u.id === "bram"
        ? "#3b3028"
        : u.id === "sable"
          ? "#e2d9bb"
          : u.id === "ione"
            ? "#292c3c"
            : "#344247";
  return `<svg viewBox="0 0 80 88" aria-hidden="true"><path d="M5 88Q8 62 28 60H52Q73 65 76 88" fill="${color}"/><path d="M30 55H50V67Q40 73 30 67" fill="#bf906d"/><path d="M20 30Q20 8 40 9Q63 10 60 33L56 51Q42 68 26 51Z" fill="${ally ? "#ddaf85" : "#7d9291"}"/><path d="M19 36Q10 6 40 5Q69 5 61 39L51 24L31 21L21 42Z" fill="${hair}"/><path d="M28 39H33M47 39H52" stroke="#26343a" stroke-width="3" stroke-linecap="round"/><path d="M35 51Q40 54 45 51" stroke="#895346" stroke-width="2" fill="none"/>${u.id === "bram" ? '<path d="M24 49L31 62H48L58 48L49 53H31Z" fill="#3b3028"/>' : ""}${u.id === "sable" ? '<path d="M15 35L8 22L22 26M62 25L70 20L65 37" fill="#a5a1d4"/>' : ""}<path d="M25 69L40 80L55 69" stroke="#263d40" stroke-width="5" fill="none"/><circle cx="40" cy="80" r="4" fill="#ffe5a0"/></svg>`;
}
export const weapons: Record<string, string> = {
  blade: "⚔",
  axe: "◆",
  lance: "↑",
  bow: "⌁",
  staff: "✦",
};
export const landscape = `<svg viewBox="0 0 1100 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#253f4d"/><stop offset="1" stop-color="#71847c"/></linearGradient><radialGradient id="glow"><stop stop-color="#ffdd99" stop-opacity=".7"/><stop offset="1" stop-color="#ffdd99" stop-opacity="0"/></radialGradient></defs><rect width="1100" height="650" fill="url(#sky)"/><circle cx="810" cy="140" r="61" fill="#d9d1ae" opacity=".65"/><path d="M0 310L180 110L300 270L455 80L640 315L810 240L1100 350V650H0" fill="#304954"/><path d="M0 380L230 260L410 385L605 245L880 390L1100 315V650H0" fill="#3c5759"/><path d="M0 450Q220 310 470 448Q780 315 1100 445V650H0" fill="#294648"/><path d="M0 535Q400 445 1100 545V650H0" fill="#1b3334"/><path d="M750 320V200H768V171H776V200H807V171H815V200H833V325L807 308H776Z" fill="#223a41"/><path d="M785 233Q796 210 808 233V259H785Z" fill="#bbc7b2" opacity=".4"/><path d="M680 650L800 480L830 482L785 650" fill="#6c7360" opacity=".35"/><g fill="#182e2f"><path d="M68 620V290L15 365H48L0 440H47L0 535H68M1050 650V240L980 349H1025L954 445H1025L960 554H1050"/><path d="M163 650V385L110 471H150L104 550H151V650"/></g><ellipse cx="488" cy="546" rx="185" ry="140" fill="url(#glow)"/><g transform="translate(458 446)"><path d="M9 20Q14 0 25 0Q40 3 39 24L33 38L53 99H0L15 38Z" fill="#18282a"/><path d="M39 40L74 61" stroke="#1a292b" stroke-width="10"/><path d="M74 51V102M59 57H90V83H59Z" stroke="#efc379" stroke-width="3" fill="#ffdc97"/><path d="M21 92L8 141M30 93L40 141" stroke="#142528" stroke-width="10"/></g><g stroke="#c4cec0" opacity=".16" stroke-width="14"><path d="M100 390Q500 330 1000 380M0 430Q650 395 1100 450M0 560Q600 520 1000 570" fill="none"/></g></svg>`;
