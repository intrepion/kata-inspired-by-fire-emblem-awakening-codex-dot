export type Weapon = "blade" | "axe" | "lance" | "bow" | "staff";
export type Phase =
  | "title"
  | "story"
  | "player"
  | "enemy"
  | "victory"
  | "defeat"
  | "camp"
  | "ending";
export interface Unit {
  id: string;
  name: string;
  role: string;
  weapon: Weapon;
  team: "ally" | "enemy";
  pos: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  move: number;
  level: number;
  xp: number;
  acted: boolean;
  moved: boolean;
  guard: boolean;
}
export interface Army {
  units: Unit[];
  bonds: Record<string, number>;
}
export interface State {
  version: 1;
  chapter: number;
  phase: Phase;
  round: number;
  units: Unit[];
  bonds: Record<string, number>;
  lit: number[];
  selected: string | null;
  origin: number | null;
  log: string[];
  checkpoint: Army;
  trained: boolean;
}
export interface Chapter {
  title: string;
  subtitle: string;
  objective: string;
  limit: number;
  map: string[];
  beacons: number[];
  story: string[];
  camp: string;
  enemies: [string, Weapon, number, number, number, number][];
}
export const WIDTH = 8,
  HEIGHT = 7;
export const chapters: Chapter[] = [
  {
    title: "The Ash Orchard",
    subtitle: "I · A name carried home",
    objective: "Defeat every enemy",
    limit: 12,
    map: [
      "........",
      "..ff....",
      "...f..f.",
      "..~..ff.",
      "..~.....",
      ".s......",
      "........",
    ],
    beacons: [],
    story: [
      "The bell rang once. By morning, nobody remembered the orchard keeper.",
      "Mira ties his lantern to her spearless blade. “If the Hollow can steal a name, we can carry it back.”",
      "Her childhood friend Bram bars the road. Sable scans the trees. Ione listens for a voice beneath the ash.",
    ],
    camp: "Bram: “You still rush ahead.” Mira: “Then stay close enough to stop me.” Their laughter is the first sound the fog has not swallowed.",
    enemies: [
      ["Ash Raider", "axe", 21, 14, 6, 1],
      ["Hollow Pike", "lance", 29, 15, 6, 2],
      ["Cinder Scout", "bow", 14, 12, 5, 1],
    ],
  },
  {
    title: "The Two Watchfires",
    subtitle: "II · What the dark cannot take",
    objective: "Light both beacons with an action",
    limit: 10,
    map: [
      "....f...",
      "..~.f...",
      "..~.....",
      "..r..r..",
      "...~....",
      ".s.~....",
      "........",
    ],
    beacons: [20, 30],
    story: [
      "At the crossing, two watchfires have gone cold. Beyond them the drowned road leads to the bell tower.",
      "Sable: “I used to guide travellers here. Now I cannot remember their faces.”",
      "Ione hands her a flame. “You remember the way. For tonight, that is enough.” Light both watchfires before the fog closes.",
    ],
    camp: "Sable: “I remembered one face when the fires caught.” Ione: “Then we have already won something.” They share a quiet cup of orchard tea.",
    enemies: [
      ["Mist Reaver", "blade", 22, 17, 7, 2],
      ["Sunken Guard", "lance", 12, 18, 7, 3],
      ["Fog Archer", "bow", 31, 14, 6, 1],
      ["Ash Raider", "axe", 4, 16, 7, 2],
    ],
  },
  {
    title: "The Bell of Forgotten Names",
    subtitle: "III · All our voices",
    objective: "Defeat the Bell Warden",
    limit: 14,
    map: [
      "..r..r..",
      "..ff....",
      "...rr...",
      "..~..~..",
      "..~..~..",
      ".s......",
      "........",
    ],
    beacons: [],
    story: [
      "The Warden waits beneath a bell cast from stolen names. It promises Mira a kingdom with no grief.",
      "Mira: “Grief means we had someone worth remembering.” Bram raises his axe. Sable draws. Ione sings the orchard keeper’s name.",
      "Break the Warden before the final toll. Keep your companions close; even the strongest lantern burns brighter beside another.",
    ],
    camp: "",
    enemies: [
      ["Bell Warden", "lance", 11, 38, 10, 4],
      ["Oathless Blade", "blade", 20, 20, 8, 3],
      ["Oathless Axe", "axe", 22, 20, 8, 2],
      ["Tower Archer", "bow", 7, 16, 7, 2],
    ],
  },
];
const keeper = (
  id: string,
  name: string,
  role: string,
  weapon: Weapon,
  pos: number,
  hp: number,
  atk: number,
  def: number,
  move: number,
): Unit => ({
  id,
  name,
  role,
  weapon,
  pos,
  hp,
  maxHp: hp,
  atk,
  def,
  move,
  team: "ally",
  level: 1,
  xp: 0,
  acted: false,
  moved: false,
  guard: false,
});
export function fresh(): State {
  const units = [
    keeper("mira", "Mira", "Dawnblade", "blade", 49, 26, 11, 3, 4),
    keeper("bram", "Bram", "Oakguard", "axe", 50, 28, 12, 4, 3),
    keeper("sable", "Sable", "Wayfinder", "bow", 48, 22, 10, 2, 4),
    keeper("ione", "Ione", "Flamebinder", "staff", 51, 22, 8, 2, 4),
  ];
  return {
    version: 1,
    chapter: 0,
    phase: "title",
    round: 1,
    units,
    bonds: {},
    lit: [],
    selected: null,
    origin: null,
    log: [],
    checkpoint: { units: structuredClone(units), bonds: {} },
    trained: false,
  };
}
export const distance = (a: number, b: number) =>
  Math.abs((a % 8) - (b % 8)) + Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
export const terrain = (s: State, p: number) =>
  chapters[s.chapter].map[Math.floor(p / 8)]?.[p % 8] ?? "~";
export const defense = (s: State, p: number) =>
  terrain(s, p) === "f" ? 2 : terrain(s, p) === "r" ? 1 : 0;
export const bondKey = (a: string, b: string) => [a, b].sort().join(":");
export const bondRank = (s: State, a: string, b: string) =>
  Math.min(2, Math.floor((s.bonds[bondKey(a, b)] ?? 0) / 2));
export function supporters(s: State, u: Unit): Unit[] {
  return s.units.filter(
    (v) =>
      v.team === u.team &&
      v.hp > 0 &&
      v.id !== u.id &&
      distance(u.pos, v.pos) === 1,
  );
}
export function reachable(s: State, id: string): number[] {
  const u = s.units.find((u) => u.id === id);
  if (!u || u.hp <= 0 || u.moved || u.acted || s.phase !== "player") return [];
  return walk(s, u, u.move);
}
function walk(s: State, u: Unit, budget: number): number[] {
  const costs = new Map<number, number>([[u.pos, 0]]),
    queue = [u.pos];
  while (queue.length) {
    const p = queue.shift()!;
    for (const n of [p - 8, p + 8, p - 1, p + 1]) {
      if (
        n < 0 ||
        n >= 56 ||
        distance(p, n) !== 1 ||
        terrain(s, n) === "~" ||
        s.units.some((v) => v.hp > 0 && v.id !== u.id && v.pos === n)
      )
        continue;
      const c = costs.get(p)! + (terrain(s, n) === "f" ? 2 : 1);
      if (c <= budget && c < (costs.get(n) ?? Infinity)) {
        costs.set(n, c);
        queue.push(n);
      }
    }
  }
  return [...costs.keys()].filter((p) => p !== u.pos);
}
function recoveredKeepers(units: Unit[]): Unit[] {
  const deployment: Record<string, number> = {
    mira: 49,
    bram: 50,
    sable: 48,
    ione: 51,
  };
  return units
    .filter((u) => u.team === "ally")
    .map((u) => ({
      ...u,
      hp: u.maxHp,
      pos: deployment[u.id],
      acted: false,
      moved: false,
      guard: false,
    }));
}
export function battle(s: State): State {
  const n = structuredClone(s);
  n.units = recoveredKeepers(n.units);
  n.checkpoint = { units: structuredClone(n.units), bonds: { ...n.bonds } };
  for (const [i, e] of chapters[n.chapter].enemies.entries()) {
    n.units.push({
      ...keeper(`enemy${i}`, e[0], "Hollow", e[1], e[2], e[3], e[4], e[5], 3),
      team: "enemy",
    });
  }
  n.phase = "player";
  n.round = 1;
  n.selected = null;
  n.origin = null;
  n.lit = [];
  n.log = ["The keepers take the field."];
  return n;
}
export function inRange(a: Unit, b: Unit): boolean {
  const d = distance(a.pos, b.pos);
  return a.weapon === "bow" ? d === 2 : d === 1;
}
export function advantage(a: Weapon, b: Weapon): number {
  return (
    { blade: "axe", axe: "lance", lance: "blade" } as Partial<
      Record<Weapon, Weapon>
    >
  )[a] === b
    ? 2
    : (
          { blade: "axe", axe: "lance", lance: "blade" } as Partial<
            Record<Weapon, Weapon>
          >
        )[b] === a
      ? -2
      : 0;
}
function damage(s: State, a: Unit, b: Unit): number {
  const friends = supporters(s, a);
  const support = friends.length
    ? 1 + Number(friends.some((v) => bondRank(s, a.id, v.id) >= 2))
    : 0;
  return Math.max(
    1,
    a.atk +
      advantage(a.weapon, b.weapon) +
      support -
      b.def -
      defense(s, b.pos) -
      (b.guard ? 3 : 0) -
      (supporters(s, b).length ? 1 : 0),
  );
}
export function preview(
  s: State,
  attacker: string,
  target: string,
): {
  damage: number;
  counter: number;
  support: string[];
  advantage: number;
} | null {
  const a = s.units.find((u) => u.id === attacker),
    b = s.units.find((u) => u.id === target);
  if (!a || !b || a.hp <= 0 || b.hp <= 0 || a.team === b.team || !inRange(a, b))
    return null;
  const hit = damage(s, a, b);
  return {
    damage: Math.min(b.hp, hit),
    counter: b.hp > hit && inRange(b, a) ? Math.min(a.hp, damage(s, b, a)) : 0,
    support: supporters(s, a).map((u) => u.name),
    advantage: advantage(a.weapon, b.weapon),
  };
}
export function healPreview(s: State, healer: string, target: string): number {
  const a = s.units.find((u) => u.id === healer),
    b = s.units.find((u) => u.id === target);
  if (
    !a ||
    !b ||
    a.weapon !== "staff" ||
    a.team !== "ally" ||
    b.team !== "ally" ||
    a.hp <= 0 ||
    b.hp <= 0 ||
    a.id === b.id ||
    distance(a.pos, b.pos) > 2
  )
    return 0;
  return Math.min(9, b.maxHp - b.hp);
}
function xp(s: State, u: Unit, amount: number) {
  if (u.team !== "ally") return;
  u.xp += amount;
  while (u.xp >= 30) {
    u.xp -= 30;
    u.level++;
    u.maxHp += 2;
    // Growth increases capacity, never alters the HP shown in a combat forecast.
    u.atk++;
    s.log.push(`${u.name} reached level ${u.level}: +2 maximum HP, +1 power.`);
  }
}
function strike(s: State, a: Unit, b: Unit) {
  const p = preview(s, a.id, b.id);
  if (!p) return;
  const supportersBefore = a.team === "ally" ? supporters(s, a) : [];
  b.hp -= p.damage;
  a.hp -= p.counter;
  s.log.push(
    `${a.name} → ${b.name}: ${p.damage} damage${p.counter ? `, ${p.counter} counter` : `, no counter`}.`,
  );
  for (const v of supportersBefore) {
    const key = bondKey(a.id, v.id);
    s.bonds[key] = (s.bonds[key] ?? 0) + 1;
    s.log.push(`${a.name} + ${v.name}: bond strengthened.`);
  }
  xp(s, a, b.hp === 0 ? 20 : 10);
}
function outcome(s: State) {
  if (
    !s.units.some((u) => u.id === "mira" && u.hp > 0) ||
    !s.units.some((u) => u.team === "ally" && u.hp > 0)
  ) {
    s.phase = "defeat";
    s.log.push("Mira’s lantern fell. The chapter can be retried.");
  } else if (
    (s.chapter === 0 && !s.units.some((u) => u.team === "enemy" && u.hp > 0)) ||
    (s.chapter === 1 && s.lit.length === 2) ||
    (s.chapter === 2 && !s.units.some((u) => u.id === "enemy0" && u.hp > 0))
  ) {
    s.phase = "victory";
    s.log.push("The Hollow recedes.");
  }
  if (s.phase === "victory" || s.phase === "defeat") {
    s.selected = null;
    s.origin = null;
  }
}
export type Command =
  | {
      type:
        | "story"
        | "begin"
        | "cancel"
        | "end"
        | "enemy"
        | "retry"
        | "continue"
        | "next"
        | "reset";
    }
  | { type: "select"; id: string }
  | { type: "move"; pos: number }
  | { type: "attack" | "heal"; target: string }
  | { type: "wait" | "guard" | "light" }
  | { type: "train"; id: string };
export function command(s: State, c: Command): State {
  const n = structuredClone(s);
  const u = n.units.find((v) => v.id === n.selected);
  const active =
    n.phase === "player" && u && u.hp > 0 && u.team === "ally" && !u.acted;
  if (c.type === "reset") return fresh();
  if (c.type === "story" && n.phase === "title") {
    n.phase = "story";
    return n;
  }
  if (c.type === "begin" && n.phase === "story") return battle(n);
  if (c.type === "retry" && n.phase === "defeat") {
    n.units = structuredClone(n.checkpoint.units);
    n.bonds = { ...n.checkpoint.bonds };
    return battle(n);
  }
  if (c.type === "continue" && n.phase === "victory") {
    n.phase = n.chapter === 2 ? "ending" : "camp";
    n.selected = null;
    n.origin = null;
    n.trained = false;
    return n;
  }
  if (c.type === "train" && n.phase === "camp" && !n.trained) {
    const v = n.units.find((v) => v.id === c.id && v.team === "ally");
    if (v) {
      xp(n, v, 30);
      n.trained = true;
      n.log = n.log.slice(-24);
    }
    return n;
  }
  if (c.type === "next" && n.phase === "camp" && n.trained) {
    n.chapter++;
    n.units = recoveredKeepers(n.units);
    n.lit = [];
    n.round = 1;
    n.phase = "story";
    return n;
  }
  if (c.type === "select" && n.phase === "player") {
    const v = n.units.find((v) => v.id === c.id);
    if (v?.team === "ally" && v.hp > 0 && !v.acted && n.origin === null)
      n.selected = v.id;
    return n;
  }
  if (c.type === "cancel" && n.phase === "player") {
    if (u && n.origin !== null) {
      u.pos = n.origin;
      u.moved = false;
    }
    n.origin = null;
    n.selected = null;
    return n;
  }
  if (
    c.type === "move" &&
    active &&
    !u.moved &&
    reachable(n, u.id).includes(c.pos)
  ) {
    n.origin = u.pos;
    u.pos = c.pos;
    u.moved = true;
    return n;
  }
  let consumed = false;
  if (active && c.type === "attack") {
    const b = n.units.find((v) => v.id === c.target);
    if (b && preview(n, u.id, b.id)) {
      strike(n, u, b);
      consumed = true;
    }
  }
  if (active && c.type === "heal" && u.weapon === "staff") {
    const b = n.units.find((v) => v.id === c.target);
    const heal = healPreview(n, u.id, c.target);
    if (b && heal > 0) {
      b.hp += heal;
      xp(n, u, 10);
      n.log.push(`${u.name} restores ${heal} HP to ${b.name}.`);
      consumed = true;
    }
  }
  if (
    active &&
    c.type === "light" &&
    chapters[n.chapter].beacons.includes(u.pos) &&
    !n.lit.includes(u.pos)
  ) {
    n.lit.push(u.pos);
    n.log.push(`${u.name} lights a watchfire.`);
    xp(n, u, 15);
    consumed = true;
  }
  if (active && (c.type === "wait" || c.type === "guard")) {
    u.guard = c.type === "guard";
    if (u.guard) {
      const heal = Math.min(3, u.maxHp - u.hp);
      u.hp += heal;
      n.log.push(`${u.name} guards (+3 defense), restores ${heal} HP.`);
    }
    consumed = true;
  }
  if (consumed && u) {
    u.acted = true;
    n.origin = null;
    n.selected = null;
    outcome(n);
  }
  if (c.type === "end" && n.phase === "player") {
    if (n.origin !== null) return s;
    n.phase = "enemy";
    n.selected = null;
    return n;
  }
  if (c.type === "enemy" && n.phase === "enemy") {
    for (const e of n.units.filter((v) => v.team === "enemy" && v.hp > 0)) {
      const living = n.units.filter((v) => v.team === "ally" && v.hp > 0);
      if (!living.length) break;
      let targets = living.filter((a) => inRange(e, a));
      if (!targets.length) {
        const choices = [e.pos, ...walk(n, e, e.move)];
        const best = choices.sort(
          (a, b) =>
            Math.min(...living.map((v) => distance(a, v.pos))) -
              Math.min(...living.map((v) => distance(b, v.pos))) ||
            defense(n, b) - defense(n, a) ||
            a - b,
        )[0];
        e.pos = best;
        targets = living.filter((a) => inRange(e, a));
      }
      targets.sort((a, b) => a.hp - b.hp || a.id.localeCompare(b.id));
      if (targets[0]) strike(n, e, targets[0]);
      outcome(n);
      if (n.phase !== "enemy") break;
    }
    if (n.phase === "enemy") {
      n.round++;
      if (n.round > chapters[n.chapter].limit) {
        n.phase = "defeat";
        n.log.push("The last toll sounded. Time ran out.");
      } else {
        n.phase = "player";
        for (const a of n.units) {
          a.acted = false;
          a.moved = false;
          a.guard = false;
          if (a.team === "ally" && a.hp > 0 && terrain(n, a.pos) === "s")
            a.hp = Math.min(a.maxHp, a.hp + 5);
        }
        n.log.push(`Round ${n.round}. The keepers act.`);
      }
    }
  }
  n.log = n.log.slice(-24);
  return n;
}
// Validate complete structure and critical invariants before touching untrusted persisted state.
export function decodeSave(raw: string): State | null {
  try {
    const s: unknown = JSON.parse(raw);
    if (!s || typeof s !== "object") return null;
    const n = s as State;
    const integer = (v: unknown, min: number, max: number) =>
      typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
    const army = (v: unknown): v is Unit[] =>
      Array.isArray(v) &&
      v.length >= 4 &&
      v.length <= 8 &&
      v.every(
        (u) =>
          u &&
          typeof u === "object" &&
          typeof u.id === "string" &&
          /^(mira|bram|sable|ione|enemy[0-3])$/.test(u.id) &&
          typeof u.name === "string" &&
          u.name.length < 40 &&
          typeof u.role === "string" &&
          u.role.length < 40 &&
          ["blade", "axe", "lance", "bow", "staff"].includes(u.weapon) &&
          ["ally", "enemy"].includes(u.team) &&
          integer(u.pos, 0, 55) &&
          integer(u.hp, 0, u.maxHp) &&
          integer(u.maxHp, 1, 100) &&
          integer(u.atk, 1, 50) &&
          integer(u.def, 0, 30) &&
          integer(u.move, 1, 6) &&
          integer(u.level, 1, 30) &&
          integer(u.xp, 0, 29) &&
          ["acted", "moved", "guard"].every((k) => typeof u[k] === "boolean"),
      ) &&
      new Set(v.map((u) => u.id)).size === v.length &&
      ["mira", "bram", "sable", "ione"].every((id) =>
        v.some((u) => u.id === id && u.team === "ally"),
      );
    const bonds = (b: unknown) =>
      !!b &&
      typeof b === "object" &&
      !Array.isArray(b) &&
      Object.entries(b).every(
        ([k, v]) =>
          /^(mira|bram|sable|ione):(mira|bram|sable|ione)$/.test(k) &&
          integer(v, 0, 10000),
      );
    if (
      n.version !== 1 ||
      !integer(n.chapter, 0, 2) ||
      ![
        "title",
        "story",
        "player",
        "enemy",
        "victory",
        "defeat",
        "camp",
        "ending",
      ].includes(n.phase) ||
      !integer(n.round, 1, 15) ||
      !army(n.units) ||
      !bonds(n.bonds) ||
      !n.checkpoint ||
      !army(n.checkpoint.units) ||
      n.checkpoint.units.some((u) => u.team !== "ally") ||
      !bonds(n.checkpoint.bonds) ||
      typeof n.trained !== "boolean" ||
      !Array.isArray(n.lit) ||
      n.lit.some((p) => !chapters[n.chapter].beacons.includes(p)) ||
      new Set(n.lit).size !== n.lit.length ||
      !Array.isArray(n.log) ||
      n.log.length > 24 ||
      !n.log.every((t) => typeof t === "string" && t.length < 200) ||
      !(
        n.selected === null ||
        n.units.some(
          (u) =>
            u.id === n.selected && u.team === "ally" && u.hp > 0 && !u.acted,
        )
      ) ||
      !(n.origin === null || integer(n.origin, 0, 55)) ||
      (n.origin !== null && n.selected === null)
    )
      return null;
    const keepers = fresh().units;
    for (const u of [...n.units, ...n.checkpoint.units]) {
      const known = keepers.find((k) => k.id === u.id);
      if (
        known
          ? u.name !== known.name ||
            u.role !== known.role ||
            u.team !== "ally" ||
            u.weapon !== known.weapon
          : u.team !== "enemy" ||
            u.role !== "Hollow" ||
            !chapters.some(
              (ch) => ch.enemies[Number(u.id.slice(5))]?.[0] === u.name,
            )
      )
        return null;
    }
    if (n.origin !== null) {
      const selected = n.units.find((u) => u.id === n.selected)!;
      if (
        n.phase !== "player" ||
        !selected.moved ||
        n.origin === selected.pos ||
        terrain(n, n.origin) === "~" ||
        n.units.some(
          (u) => u.hp > 0 && u.id !== selected.id && u.pos === n.origin,
        )
      )
        return null;
    }
    const living = n.units.filter((u) => u.hp > 0);
    if (
      new Set(living.map((u) => u.pos)).size !== living.length ||
      living.some((u) => terrain(n, u.pos) === "~")
    )
      return null;
    return n;
  } catch {
    return null;
  }
}
