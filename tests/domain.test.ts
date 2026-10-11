import { describe, it, expect } from "vitest";
import {
  fresh,
  battle,
  reachable,
  command,
  preview,
  decodeSave,
} from "../src/domain";
describe("public battle seam", () => {
  it("cannot walk into water, occupied squares, or beyond movement", () => {
    const s = battle(fresh());
    const cells = reachable(s, "mira");
    expect(cells).not.toContain(0);
    expect(cells).not.toContain(49);
    expect(cells).toContain(25);
  });
});
describe("combat and lifecycle", () => {
  it("shows exact advantage damage and counter, then consumes the action once", () => {
    let s = battle(fresh());
    s.units.find((u) => u.id === "mira")!.pos = 20;
    s.units.find((u) => u.id === "bram")!.pos = 28;
    // Blade 11 + advantage 2 + support 1 - armor 1 - enemy support 1 = 12.
    expect(preview(s, "mira", "enemy0")).toEqual({
      damage: 12,
      counter: 1,
      support: ["Bram"],
      advantage: 2,
    });
    s = command(s, { type: "select", id: "mira" });
    s = command(s, { type: "attack", target: "enemy0" });
    expect(s.units.find((u) => u.id === "enemy0")!.hp).toBe(2);
    expect(s.units.find((u) => u.id === "mira")!.hp).toBe(25);
    expect(command(s, { type: "attack", target: "enemy0" })).toEqual(s);
    expect(s.bonds["bram:mira"]).toBe(1);
  });
  it("cancellation restores a move and cannot erase a committed action", () => {
    let s = command(battle(fresh()), { type: "select", id: "mira" });
    s = command(s, { type: "move", pos: 25 });
    expect(s.origin).toBe(49);
    expect(command(s, { type: "end" })).toEqual(s);
    s = command(s, { type: "cancel" });
    expect(s.units[0].pos).toBe(49);
    expect(s.units[0].moved).toBe(false);
    s = command(s, { type: "select", id: "mira" });
    s = command(s, { type: "guard" });
    s = command(s, { type: "cancel" });
    expect(s.units[0].acted).toBe(true);
  });
  it("rejects invalid moves and friendly strikes", () => {
    const s = command(battle(fresh()), { type: "select", id: "mira" });
    expect(command(s, { type: "move", pos: 34 })).toEqual(s);
    expect(command(s, { type: "move", pos: 50 })).toEqual(s);
    expect(command(s, { type: "attack", target: "bram" })).toEqual(s);
  });
  it("enemy phase is locked and resolves only once", () => {
    const s = command(battle(fresh()), { type: "end" });
    expect(s.phase).toBe("enemy");
    expect(command(s, { type: "select", id: "mira" })).toEqual(s);
    const next = command(s, { type: "enemy" });
    expect(next.round).toBe(2);
    expect(next.phase).toBe("player");
    expect(command(next, { type: "enemy" })).toEqual(next);
  });
  it("enemy formations remain reloadable without generating keeper bonds", () => {
    let s = battle(fresh());
    s.units[0].pos = 20;
    s.units[1].pos = 28;
    s = command(s, { type: "end" });
    s = command(s, { type: "enemy" });
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
  });
  it("retry restores chapter progression and casualties", () => {
    let s = battle(fresh());
    s.units[0].hp = 0;
    s.units[1].atk = 20;
    s.bonds["bram:mira"] = 7;
    s.phase = "defeat";
    s = command(s, { type: "retry" });
    expect(s.phase).toBe("player");
    expect(s.units[0].hp).toBe(26);
    expect(s.units[1].atk).toBe(12);
    expect(s.bonds).toEqual({});
  });
  it("levels deterministically and trains only one keeper at camp", () => {
    let s = battle(fresh());
    s.phase = "victory";
    s = command(s, { type: "continue" });
    s = command(s, { type: "train", id: "sable" });
    expect(s.units[2].level).toBe(2);
    expect(s.units[2].maxHp).toBe(24);
    expect(s.units[2].atk).toBe(11);
    expect(command(s, { type: "train", id: "mira" })).toEqual(s);
    s = command(s, { type: "next" });
    expect(s.chapter).toBe(1);
    expect(s.phase).toBe("story");
    s = command(s, { type: "begin" });
    expect(s.units[2].hp).toBe(24);
  });
  it("beacons require being on the square and cost an action", () => {
    let s = fresh();
    s.chapter = 1;
    s = battle(s);
    s = command(s, { type: "select", id: "mira" });
    expect(command(s, { type: "light" })).toEqual(s);
    s.units[0].pos = 20;
    s = command(s, { type: "light" });
    expect(s.lit).toEqual([20]);
    expect(s.units[0].acted).toBe(true);
  });
  it("healing excludes dead units and respects range and missing HP", () => {
    let s = command(battle(fresh()), { type: "select", id: "ione" });
    expect(command(s, { type: "heal", target: "bram" })).toEqual(s);
    s.units[1].hp = 10;
    s = command(s, { type: "heal", target: "bram" });
    expect(s.units[1].hp).toBe(19);
    expect(s.units[3].xp).toBe(10);
  });
  it("bow has exact range two and no adjacent counter", () => {
    const s = battle(fresh());
    s.units[2].pos = 19;
    expect(preview(s, "sable", "enemy0")?.counter).toBe(0);
    s.units[2].pos = 20;
    expect(preview(s, "sable", "enemy0")).toBeNull();
  });
  it("round limit causes defeat and terminal actions cannot mutate battle", () => {
    let s = battle(fresh());
    s.round = 12;
    s = command(s, { type: "end" });
    s = command(s, { type: "enemy" });
    expect(s.phase).toBe("defeat");
    expect(command(s, { type: "end" })).toEqual(s);
    expect(command(s, { type: "enemy" })).toEqual(s);
  });
  it("saves restore provisional movement, enemy phase, and reject malformed data", () => {
    let s = command(battle(fresh()), { type: "select", id: "mira" });
    s = command(s, { type: "move", pos: 25 });
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
    expect(decodeSave("{bad")).toBeNull();
    expect(decodeSave(JSON.stringify({ ...s, chapter: 8 }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...s, checkpoint: {} }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...s, lit: [20] }))).toBeNull();
  });
});
describe("independent review regressions", () => {
  it("a lethal counter stays lethal even when the attack earns a level", () => {
    let s = battle(fresh());
    s.units[0].pos = 20;
    s.units[1].pos = 28;
    s.units[0].hp = 1;
    s.units[0].xp = 20;
    expect(preview(s, "mira", "enemy0")?.counter).toBe(1);
    s = command(s, { type: "select", id: "mira" });
    s = command(s, { type: "attack", target: "enemy0" });
    expect(s.units[0].hp).toBe(0);
    expect(s.phase).toBe("defeat");
  });
  it("camp training at the journal limit remains reloadable", () => {
    let s = battle(fresh());
    s.log = Array(24).fill("An order.");
    s.phase = "victory";
    s = command(s, { type: "continue" });
    s = command(s, { type: "train", id: "mira" });
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
  });
  it("rejects a provisional origin occupied by another keeper or blocked by water", () => {
    let s = command(battle(fresh()), { type: "select", id: "mira" });
    s = command(s, { type: "move", pos: 25 });
    expect(decodeSave(JSON.stringify({ ...s, origin: 50 }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...s, origin: 34 }))).toBeNull();
  });
});
it("rejects tampered character labels in untrusted saves", () => {
  const s = battle(fresh());
  s.units[0].name = "<img src=x onerror=alert(1)>";
  expect(decodeSave(JSON.stringify(s))).toBeNull();
});
it("surviving level growth preserves the final HP displayed by the forecast", () => {
  let s = battle(fresh());
  s.units[0].pos = 20;
  s.units[1].pos = 28;
  s.units[0].xp = 20;
  s.units[0].hp = 15;
  s = command(s, { type: "select", id: "mira" });
  s = command(s, { type: "attack", target: "enemy0" });
  expect(s.units[0].hp).toBe(14);
  expect(s.units[0].maxHp).toBe(28);
});
it("chapter transitions recover and redeploy the army before a story save", () => {
  let s = fresh();
  s.chapter = 1;
  s = battle(s);
  s.lit = [20, 30];
  s.units[2].pos = 34;
  s.units[2].hp = 0;
  s.phase = "victory";
  s = command(s, { type: "continue" });
  s = command(s, { type: "train", id: "sable" });
  s = command(s, { type: "next" });
  expect(s.units.every((u) => u.team === "ally")).toBe(true);
  expect(s.units[2].hp).toBe(24);
  expect(s.units[2].pos).toBe(48);
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it("forest costs two movement rather than one", () => {
  const s = battle(fresh());
  s.units[0].pos = 9;
  s.units[0].move = 2;
  expect(reachable(s, "mira")).toContain(10);
  expect(reachable(s, "mira")).not.toContain(11);
});
it("lighting the second beacon ends battle and final victory leads to the ending", () => {
  let s = fresh();
  s.chapter = 1;
  s = battle(s);
  s.lit = [20];
  s.units[0].pos = 30;
  s = command(s, { type: "select", id: "mira" });
  s = command(s, { type: "light" });
  expect(s.phase).toBe("victory");
  s.chapter = 2;
  s = command(s, { type: "continue" });
  expect(s.phase).toBe("ending");
  expect(command(s, { type: "end" })).toEqual(s);
});
it("rank-II support improves attack without stacking multiple supporters", () => {
  const s = battle(fresh());
  s.units[0].pos = 20;
  s.units[1].pos = 28;
  s.units[2].pos = 19;
  expect(preview(s, "mira", "enemy0")?.damage).toBe(12);
  s.bonds["bram:mira"] = 4;
  expect(preview(s, "mira", "enemy0")?.damage).toBe(13);
  s.bonds["mira:sable"] = 4;
  expect(preview(s, "mira", "enemy0")?.damage).toBe(13);
});
