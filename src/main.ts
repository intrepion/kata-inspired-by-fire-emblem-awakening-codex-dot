import "./style.css";
import {
  fresh,
  command,
  chapters,
  reachable,
  preview,
  distance,
  terrain,
  defense,
  supporters,
  bondRank,
  inRange,
  type State,
  type Unit,
  type Command,
} from "./domain";
import { decodeSave } from "./domain";
import { portrait, weapons, landscape } from "./art";
import { toggleAudio, cue } from "./audio";
const root = document.querySelector<HTMLDivElement>("#app")!;
const SAVE = "hollow-lanterns-v1";
let state: State = fresh();
let inspected: string | null = null;
let target: string | null = null;
let danger = false;
let help = false;
let resetting = false;
let audio = false;
let notice = "";
let enemyTimer: ReturnType<typeof setTimeout> | null = null;
try {
  const saved = localStorage.getItem(SAVE);
  if (saved) {
    const decoded = decodeSave(saved);
    if (decoded) {
      state = decoded;
      notice = "Campaign restored.";
    } else notice = "Unreadable save ignored. A new campaign is ready.";
  }
} catch {
  notice =
    "Storage unavailable. You can play, but progress will not survive reload.";
}
const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function save() {
  try {
    localStorage.setItem(SAVE, JSON.stringify(state));
    return true;
  } catch {
    notice = "Could not save: browser storage is unavailable.";
    return false;
  }
}
function dispatch(c: Command) {
  state = command(state, c);
  target = null;
  inspected = null;
  save();
  cue();
  render();
}
const button = (label: string, action: string, disabled = false, cls = "") =>
  `<button data-action="${action}" class="${cls}" ${disabled ? "disabled" : ""}>${label}</button>`;
const terrainNames: Record<string, string> = {
  ".": "Road",
  f: "Forest",
  r: "Ruins",
  "~": "Water",
  s: "Shrine",
};
function cards() {
  return state.units
    .filter((u) => u.team === "ally")
    .map(
      (u) =>
        `<button class="keeper ${u.id === state.selected ? "chosen" : ""} ${u.hp <= 0 ? "fallen" : ""}" data-select="${u.id}" ${state.phase !== "player" || u.hp <= 0 || u.acted || state.origin !== null ? "disabled" : ""} aria-label="Select ${u.name}"><div class="portrait">${portrait(u)}</div><div><strong>${u.name} <span>${weapons[u.weapon]}</span></strong><small>${u.role} · Lv ${u.level}${u.acted ? " · DONE" : ""}</small><div class="health"><i style="width:${(100 * u.hp) / u.maxHp}%"></i></div><small>${u.hp}/${u.maxHp} HP · ${u.xp}/30 XP</small></div></button>`,
    )
    .join("");
}
function tile(p: number, moves: number[], threat: Set<number>) {
  const u = state.units.find((v) => v.pos === p && v.hp > 0);
  const t = terrain(state, p);
  const beacon = chapters[state.chapter].beacons.includes(p);
  const pvw = state.selected && u ? preview(state, state.selected, u.id) : null;
  return `<button data-tile="${p}" class="tile t-${t === "." ? "road" : t === "~" ? "water" : t} ${moves.includes(p) ? "reachable" : ""} ${danger && threat.has(p) ? "danger" : ""} ${u?.id === state.selected ? "selected" : ""} ${pvw ? "attackable" : ""}" aria-label="Tile ${(p % 8) + 1},${Math.floor(p / 8) + 1}, ${terrainNames[t]}${beacon ? `, ${state.lit.includes(p) ? "lit" : "unlit"} beacon` : ""}${u ? `, ${u.name}, ${u.hp} HP` : ""}"><span class="terrain-art">${t === "f" ? "♠" : t === "r" ? "▥" : t === "s" ? "✧" : t === "~" ? "≈" : ""}</span>${beacon ? `<span class="beacon ${state.lit.includes(p) ? "lit" : ""}">♜</span>` : ""}${u ? `<span class="token ${u.team} ${u.acted ? "spent" : ""}">${portrait(u)}<b>${weapons[u.weapon]}</b><i style="--hp:${(100 * u.hp) / u.maxHp}%"></i></span>` : ""}<span class="coordinate">${String.fromCharCode(65 + (p % 8))}${Math.floor(p / 8) + 1}</span></button>`;
}
function panel() {
  const u = state.units.find((u) => u.id === (state.selected ?? inspected));
  if (!u)
    return `<div class="panel-label">FIELD NOTES</div><h2>Keep the light close.</h2><p>Select a keeper, then a highlighted square to move. Click an enemy to preview a strike.</p><div class="rule-card"><strong>Formation matters</strong><p>Adjacent allies grant +1 power and +1 defense. Shared attacks grow their bond; rank II grants +2 power.</p></div><div class="rule-card"><strong>Know your weapon</strong><p>Blade → Axe → Lance → Blade.<br>Advantage shifts power by 2. Bow strikes at exactly 2 tiles.</p></div><p class="muted">A move is provisional until an action. Cancel returns to the starting square.</p>`;
  const p = target ? preview(state, u.id, target) : null;
  const victim = state.units.find((v) => v.id === target);
  const active =
    state.phase === "player" && u.team === "ally" && !u.acted && u.hp > 0;
  const allies = state.units.filter((v) => v.team === "ally" && v.id !== u.id);
  return `<div class="panel-label">${u.team === "ally" ? "KEEPER" : "HOLLOW"} · ${u.role}</div><div class="detail-title"><div class="portrait big">${portrait(u)}</div><div><h2>${u.name}</h2><p>${u.weapon} · Lv ${u.level}<br>${u.hp} / ${u.maxHp} HP</p></div></div><div class="stats"><span><b>${u.atk}</b>Power</span><span><b>${u.def}</b>Armor</span><span><b>${u.move}</b>Move</span><span><b>${defense(state, u.pos)}</b>Terrain</span></div><p class="support">Support: ${
    supporters(state, u)
      .map(
        (v) =>
          `${v.name} (rank ${bondRank(state, u.id, v.id) === 2 ? "II" : bondRank(state, u.id, v.id) === 1 ? "I" : "—"})`,
      )
      .join(", ") || "No adjacent ally"
  }</p>${p && victim ? `<div class="forecast" role="status"><div class="panel-label">COMBAT FORECAST · CERTAIN HIT</div><h3>${u.name} → ${victim.name}</h3><div class="forecast-values"><span><b>${p.damage}</b>damage<br>${victim.hp} → ${victim.hp - p.damage} HP</span><span><b>${p.counter}</b>counter<br>${u.hp} → ${u.hp - p.counter} HP</span></div><p>${p.advantage > 0 ? "Weapon advantage +2" : p.advantage < 0 ? "Weapon disadvantage −2" : "Neutral weapon matchup"}${p.support.length ? ` · ${p.support.join(" + ")} support` : ""}</p>${button("Confirm strike", "strike", !active, "primary")}${button("Back to orders", "back")}</div>` : ""}${
    active && !p
      ? `<div class="actions">${button("Guard · +3 defense / heal 3", "guard")}${chapters[state.chapter].beacons.includes(u.pos) && !state.lit.includes(u.pos) ? button("Light watchfire", "light", false, "primary") : ""}${
          u.weapon === "staff"
            ? allies
                .filter(
                  (v) =>
                    v.hp > 0 && v.hp < v.maxHp && distance(u.pos, v.pos) <= 2,
                )
                .map((v) =>
                  button(
                    `Heal ${v.name} · +${Math.min(9, v.maxHp - v.hp)} HP`,
                    `heal:${v.id}`,
                  ),
                )
                .join("")
            : ""
        }${button("Wait", "wait")}${button(state.origin !== null ? "Undo move & cancel" : "Cancel selection", "cancel")}</div><small class="muted">Click an enemy in range for its exact combat preview.</small>`
      : ""
  }`;
}
function helpContent() {
  return `<div class="overlay"><section class="dialog help"><div class="eyebrow">KEEPER’S HANDBOOK</div><h2>One lantern. Four keepers.</h2><p>Move once, then attack, heal, guard, wait, or light a beacon. You can act without moving. Cancel / Escape undoes a move until an action commits it. End round sends the Hollow forward; enemy actions resolve after the phase banner.</p><p><b>Terrain:</b> Forest costs 2 movement and adds 2 defense. Ruins add 1 defense. Water blocks movement. Shrines restore 5 HP at the next allied round. Units block passage. Bow range is exactly 2; all other attacks have range 1. Ione heals up to 9 HP within 2 tiles.</p><p><b>Bonds:</b> Any adjacent living ally grants +1 attack and +1 defense. Each supported attack adds 1 bond point. Rank I at 2 points, rank II at 4; rank II adds another point of attack. Benefits do not stack with multiple allies.</p><p><b>Growth:</b> Attacks earn 10 XP, kills 20, heals 10, beacons 15. Every 30 XP grants +2 maximum HP and +1 power. Camp lets you train one ally once (+30 XP).</p><p><b>Defeat & recovery:</b> No permadeath. Fallen keepers return fully healed next battle. Mira falling or the round limit expiring loses the chapter. Retry restores the chapter-start army and bonds; failed attempts cannot farm progression.</p><p>Progress autosaves after each order. Reload also restores a provisional move and completes an interrupted enemy phase. Sound is an original synthesized theme and starts only when enabled.</p>${button("Return to the field", "help", false, "primary")}</section></div>`;
}
function render() {
  const ch = chapters[state.chapter];
  let content = "";
  if (state.phase === "title") {
    content = `<main class="title-screen"><div class="landscape">${landscape}</div><section class="title-copy"><div class="eyebrow">AN ORIGINAL TACTICAL TALE</div><h1>Lanterns<br><em>of the Hollow</em></h1><p>When the valley forgets its own names,<br>four friends remember how to stand together.</p>${button("Carry the first lantern", "story", false, "primary large")}<div class="title-meta">3 CHAPTERS · 4 KEEPERS · ONE SHARED LIGHT</div></section></main>`;
  } else if (state.phase === "story") {
    content = `<main class="story-screen"><div class="landscape">${landscape}</div><section class="story-copy"><div class="eyebrow">${ch.subtitle}</div><h1>${ch.title}</h1>${ch.story.map((p) => `<p>${p}</p>`).join("")}<div class="mission">${ch.objective} · ${ch.limit} rounds</div>${button("Take the field", "begin", false, "primary large")}</section></main>`;
  } else if (state.phase === "ending") {
    content = `<main class="story-screen ending"><div class="landscape">${landscape}</div><section class="story-copy"><div class="eyebrow">EPILOGUE · THE NAMES RETURN</div><h1>The valley<br><em>remembers.</em></h1><p>At sunrise, the bell cracks. From its hollow heart come a thousand names, carried home on the wind.</p><p>The orchard keeper wakes to find four lanterns at his door. Mira leaves her blade beside the hearth. Bram plants an ash sapling. Sable redraws the road. Ione sings until everyone remembers the words.</p><p>They do not build a kingdom without grief. They build a home where nobody has to carry it alone.</p><div class="ending-army">${state.units
      .filter((u) => u.team === "ally")
      .map(
        (u) =>
          `<div>${portrait(u)}<strong>${u.name}</strong><small>Level ${u.level}</small></div>`,
      )
      .join(
        "",
      )}</div><div class="mission">CAMPAIGN COMPLETE · THANK YOU FOR CARRYING THE LIGHT</div>${button("Begin a new tale", "reset", false, "primary")}</section></main>`;
  } else if (state.phase === "camp") {
    content = `<main class="camp"><div class="eyebrow">BETWEEN THE WATCHFIRES</div><h1>A little warmth.</h1><p class="camp-dialogue">${ch.camp}</p><p>All fallen keepers recover before the next battle. Choose one companion to train: +30 XP.</p><div class="training">${state.units
      .filter((u) => u.team === "ally")
      .map(
        (u) =>
          `<section>${portrait(u)}<h2>${u.name}</h2><p>Lv ${u.level} · ${u.atk} power · ${u.maxHp} HP</p>${button(`Train ${u.name}`, `train:${u.id}`, state.trained)}</section>`,
      )
      .join(
        "",
      )}</div>${state.trained ? '<p class="mission">Training complete. The road is waiting.</p>' : ""}${button("Continue to the next chapter", "next", !state.trained, "primary large")}</main>`;
  } else {
    const moves = state.selected ? reachable(state, state.selected) : [];
    const threat = new Set<number>();
    state.units
      .filter((u) => u.team === "enemy" && u.hp > 0)
      .forEach((u) => {
        for (let p = 0; p < 56; p++) {
          if (inRange(u, { ...u, pos: p })) threat.add(p);
        }
      });
    content = `<main class="battle"><section class="field"><div class="battle-heading"><div><div class="eyebrow">${ch.subtitle}</div><h1>${ch.title}</h1></div><div class="round"><b>${state.round}</b><span>ROUND / ${ch.limit}</span></div></div><div class="objective"><span>◆</span> ${ch.objective}${state.chapter === 1 ? ` · ${state.lit.length}/2 lit` : ""}<b>${state.phase === "enemy" ? "HOLLOW PHASE" : "KEEPER PHASE"}</b></div><div class="board-wrap"><div class="board" aria-label="Tactical battlefield">${Array.from({ length: 56 }, (_, p) => tile(p, moves, threat)).join("")}</div>${state.phase === "enemy" ? '<div class="phase-banner" role="status"><span>THE HOLLOW ADVANCES</span><small>Enemy orders resolving…</small></div>' : ""}</div><div class="field-controls">${button(danger ? "Hide attack ranges" : "Show enemy attack ranges", "danger", false, danger ? "active" : "")}${button("End round →", "end", state.phase !== "player" || state.origin !== null, "primary")}<span class="muted">Blue: movement · Coral: target · Gold: selected</span></div><div class="keepers">${cards()}</div><div class="legend"><span>♠ Forest · 2 move / +2 armor</span><span>▥ Ruins · +1 armor</span><span>✧ Shrine · +5 HP / round</span><span>≈ Water · impassable</span></div></section><aside class="sidebar"><section class="orders">${panel()}</section><section class="journal"><div class="panel-label">THE LAST ORDERS</div><ol aria-live="polite">${state.log
      .slice(-6)
      .reverse()
      .map((l) => `<li>${escape(l)}</li>`)
      .join(
        "",
      )}</ol></section></aside></main>${state.phase === "victory" || state.phase === "defeat" ? `<div class="overlay"><section class="dialog"><div class="eyebrow">${state.phase === "victory" ? "THE LIGHT HOLDS" : "A LANTERN FELL"}</div><h1>${state.phase === "victory" ? "The road opens." : "Gather your courage."}</h1><p>${state.phase === "victory" ? (state.chapter === 2 ? "The Warden falls silent. The names begin to return." : "Your companions have pushed back the Hollow. Rest, share a story, and prepare for the road ahead.") : "Mira fell or the last toll sounded. No one is lost forever. Retry restores your army and bonds to the chapter’s beginning."}</p>${button(state.phase === "victory" ? (state.chapter === 2 ? "Hear the ending" : "Rest at the watchfire") : "Retry this chapter", state.phase === "victory" ? "continue" : "retry", false, "primary large")}</section></div>` : ""}`;
  }
  root.innerHTML = `<header><a class="brand" href="#" data-action="help"><span>✦</span> LANTERNS <small>OF THE HOLLOW</small></a><nav>${button(audio ? "Sound on" : "Sound off", "audio")}${button("Save", "save")}${button("How to play", "help")}${button("New campaign", "reset")}</nav></header>${notice ? `<div class="notice" role="status">${escape(notice)}</div>` : ""}${content}<footer>A name is a light someone keeps for you. <span>Original art, story & synthesized score.</span></footer>${help ? helpContent() : ""}${resetting ? `<div class="overlay"><section class="dialog"><h2>Start a new campaign?</h2><p>This replaces the saved campaign. Your current chapter and bonds will be lost.</p>${button("Keep this tale", "keep", false, "primary")}${button("Erase save & start over", "confirm-reset")}</section></div>` : ""}`;
  root.querySelectorAll<HTMLElement>("[data-action]").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        handle(el.dataset.action!);
      }),
  );
  root.querySelectorAll<HTMLElement>("[data-select]").forEach(
    (el) =>
      (el.onclick = () => {
        target = null;
        dispatch({ type: "select", id: el.dataset.select! });
      }),
  );
  root
    .querySelectorAll<HTMLElement>("[data-tile]")
    .forEach((el) => (el.onclick = () => clickTile(Number(el.dataset.tile))));
  if (state.phase === "enemy" && !enemyTimer) {
    enemyTimer = setTimeout(() => {
      enemyTimer = null;
      dispatch({ type: "enemy" });
    }, 1200);
  }
}
function clickTile(p: number) {
  if (state.phase !== "player") return;
  const unit = state.units.find((u) => u.pos === p && u.hp > 0);
  if (unit?.team === "ally") {
    if (state.origin === null && !unit.acted) {
      dispatch({ type: "select", id: unit.id });
    } else {
      inspected = unit.id;
      render();
    }
    return;
  }
  if (unit?.team === "enemy") {
    if (state.selected && preview(state, state.selected, unit.id)) {
      target = unit.id;
      render();
    } else {
      inspected = unit.id;
      render();
    }
    return;
  }
  if (state.selected) dispatch({ type: "move", pos: p });
}
function handle(action: string) {
  if (action === "audio") {
    audio = !audio;
    toggleAudio(audio);
    render();
    return;
  }
  if (action === "help") {
    help = !help;
    render();
    return;
  }
  if (action === "danger") {
    danger = !danger;
    render();
    return;
  }
  if (action === "save") {
    if (save()) notice = "Saved on this browser.";
    render();
    return;
  }
  if (action === "reset") {
    resetting = true;
    render();
    return;
  }
  if (action === "keep") {
    resetting = false;
    render();
    return;
  }
  if (action === "confirm-reset") {
    if (enemyTimer) {
      clearTimeout(enemyTimer);
      enemyTimer = null;
    }
    resetting = false;
    notice = "New campaign ready.";
    dispatch({ type: "reset" });
    return;
  }
  if (action === "back") {
    target = null;
    render();
    return;
  }
  if (action === "strike" && target) {
    dispatch({ type: "attack", target });
    return;
  }
  if (action.startsWith("heal:")) {
    dispatch({ type: "heal", target: action.slice(5) });
    return;
  }
  if (action.startsWith("train:")) {
    dispatch({ type: "train", id: action.slice(6) });
    return;
  }
  dispatch({ type: action } as Command);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (resetting) {
      resetting = false;
      render();
    } else if (help) {
      help = false;
      render();
    } else if (target) {
      target = null;
      render();
    } else dispatch({ type: "cancel" });
  }
});
render();
