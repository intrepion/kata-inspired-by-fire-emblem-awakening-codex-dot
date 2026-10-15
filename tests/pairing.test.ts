import { it, expect } from "vitest";
import {
  fresh,
  battle,
  command,
  preview,
  decodeSave,
  reachable,
  partnerOf,
  separationTiles,
} from "../src/domain";
const start = () => command(battle(fresh()), { type: "select", id: "mira" });
const pair = () => command(start(), { type: "pair", target: "bram" });
it("Pair Up shares a square, consumes only the joiner and hides the reserve from independent orders", () => {
  const s = pair(),
    m = s.units[0],
    b = s.units[1];
  expect(m.pairedTo).toBe("bram");
  expect(m.pos).toBe(b.pos);
  expect(m.acted).toBe(true);
  expect(b.acted).toBe(false);
  expect(s.selected).toBe("bram");
  expect(reachable(s, "mira")).toEqual([]);
  expect(command(s, { type: "select", id: "mira" }).selected).toBe("bram");
  expect(partnerOf(s, b)?.id).toBe("mira");
});
it("moving and canceling a pair moves both bodies; switching transfers activity without another move", () => {
  let s = pair();
  const destination = reachable(s, "bram")[0];
  s = command(s, { type: "move", pos: destination });
  expect(s.units[0].pos).toBe(destination);
  s = command(s, { type: "cancel" });
  expect(s.units[0].pos).toBe(50);
  expect(s.units[1].pos).toBe(50);
  s = command(s, { type: "select", id: "bram" });
  s = command(s, { type: "switch-pair" });
  expect(s.selected).toBe("mira");
  expect(s.units[0].pairedTo).toBeNull();
  expect(s.units[1].pairedTo).toBe("mira");
  expect(s.units[0].moved).toBe(true);
  expect(reachable(s, "mira")).toEqual([]);
  s = command(s, { type: "wait" });
  expect(s.units[0].acted).toBe(true);
  expect(s.units[1].acted).toBe(true);
});
it("Separate requires a free adjacent square and consumes both resulting actions", () => {
  let s = pair();
  expect(command(s, { type: "separate", pos: 51 })).toEqual(s);
  const pos = separationTiles(s, "bram")[0];
  s = command(s, { type: "separate", pos });
  expect(s.units[0].pairedTo).toBeNull();
  expect(s.units[0].pos).toBe(pos);
  expect(s.units[0].acted).toBe(true);
  expect(s.units[1].acted).toBe(true);
  expect(s.selected).toBeNull();
});
it("paired forecasts expose partner chances without rolling and battle preserves seeded results", () => {
  let s = pair();
  s.units[1].pos = 20;
  s.units[0].pos = 20;
  s.units[1].weapon = "axe";
  const before = s.rng,
    p = preview(s, "bram", "enemy0");
  expect(p?.attackerPartner?.partner).toBe("Mira");
  expect(p?.attackerPartner?.strikeChance).toBeGreaterThan(0);
  expect(p?.attackerPartner?.strikeChance).toBeLessThan(100);
  expect(s.rng).toBe(before);
  const a = command(s, { type: "attack", target: "enemy0" }),
    b = command(structuredClone(s), { type: "attack", target: "enemy0" });
  expect(a).toEqual(b);
  expect(a.rng).not.toBe(before);
  expect(preview(s, "mira", "enemy0")).toBeNull();
});
it("front death promotes a living reserve and does not make the pair independently targetable", () => {
  // Use a non-Mira front so the existing protagonist defeat contract still applies.
  let s = pair();
  s.units[1].hp = 1;
  s.units[1].pos = 20;
  s.units[0].pos = 20;
  s.units[1].atk = 1;
  s.rng = 1000;
  s = command(s, { type: "attack", target: "enemy0" });
  expect(s.units[1].hp).toBe(0);
  expect(s.units[0].hp).toBeGreaterThan(0);
  expect(s.units[0].pairedTo).toBeNull();
  expect(s.units[0].acted).toBe(true);
});
it("v1 migration keeps army/progression and v2 validates only explicit shared pair squares", () => {
  const original = battle(fresh()),
    old: any = structuredClone(original);
  old.version = 1;
  delete old.rng;
  delete old.checkpoint.rng;
  for (const u of [...old.units, ...old.checkpoint.units]) delete u.pairedTo;
  const migrated = decodeSave(JSON.stringify(old));
  expect(migrated?.version).toBe(2);
  expect(migrated?.units.map((u) => u.hp)).toEqual(
    original.units.map((u) => u.hp),
  );
  const s = pair();
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
  const bad = structuredClone(s);
  bad.units[0].pairedTo = null;
  expect(decodeSave(JSON.stringify(bad))).toBeNull();
  const cycle = structuredClone(s);
  cycle.units[1].pairedTo = "mira";
  expect(decodeSave(JSON.stringify(cycle))).toBeNull();
  const dead = structuredClone(s);
  dead.units[1].hp = 0;
  expect(decodeSave(JSON.stringify(dead))).toBeNull();
});

it("Dual Guard can trigger or fail at the displayed chance and reserve HP is not targeted", () => {
  for (const [seed, guarded] of [
    [12345, true],
    [1000, false],
  ] as const) {
    let s = pair();
    s.units[1].pos = 20;
    s.units[0].pos = 20;
    s.rng = seed;
    for (const e of s.units.filter(
      (u) => u.team === "enemy" && u.id !== "enemy0",
    ))
      e.hp = 0;
    const reserveHp = s.units[0].hp,
      frontHp = s.units[1].hp;
    s = command(command(s, { type: "end" }), { type: "enemy" });
    expect(s.units[0].hp).toBe(reserveHp);
    expect(s.units[1].hp).toBe(guarded ? frontHp : frontHp - 1);
    expect(s.log.some((line) => line.includes("Mira Dual Guard (15%)"))).toBe(
      guarded,
    );
  }
});
it("chapter retry restores its saved seed and unpairs recovered deployment without farming rolls", () => {
  let s = pair();
  const seed = s.checkpoint.rng;
  s.rng = 999;
  s.phase = "defeat";
  s = command(s, { type: "retry" });
  expect(s.rng).toBe(seed);
  expect(s.units.every((u) => u.pairedTo === null)).toBe(true);
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
});

it("a reserve cannot promise a Dual Strike when its front cannot counter at that range", () => {
  let s = command(command(battle(fresh()), { type: "select", id: "mira" }), {
    type: "pair",
    target: "sable",
  });
  s.units[0].pos = 20;
  s.units[2].pos = 20;
  const forecast = preview(s, "enemy0", "sable");
  expect(forecast?.counter).toBe(0);
  expect(forecast?.defenderPartner?.partner).toBe("Mira");
  expect(forecast?.defenderPartner?.strikeChance).toBe(0);
  expect(forecast?.defenderPartner?.strikeDamage).toBe(0);
  expect(forecast?.defenderPartner?.guardChance).toBe(15);
});
