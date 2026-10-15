# Pair Up mechanics slice — 2026-10-15

Baseline `746767b5d00c8151d56131e66e1a7dedc6d13002` was clean. Existing preview 5195 / PID8093 was inspected and left running. This adds one Awakening-specific formation contract to the existing three-chapter campaign.

## Research and settled defaults

Read Nintendo's [Fire Emblem Awakening electronic manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/fire_emblem__awakening_1/ElectronicManual_Nintendo3DS_FireEmblemAwakening_EN.pdf), sections 11–13 (PDF pp28–34), before design. It establishes pairing by sharing an allied square, an enhanced main unit as the sole mover/attacker/defender, switching the main unit without another move, adjacent separation, and chance-based Dual Strike/Guard assistance that improves with support relationships.

User-delegated Grill with Docs/Implement defaults follow the focused plan. Pair Up is explicit from an adjacent ally. Joining spends the joining unit's action; the existing front retains its prior activity. Switching transfers remaining activity and spends movement. Separating ends both resulting units' actions. These conservative action rules prevent an additional turn through pair manipulation. Front statistics receive a bounded +2 power/armor, plus existing support; authored partner chances are 35/50/65% strike and 15/25/35% guard at ranks 0/I/II. These numbers are deliberately approximate, not a claim of original formulas.

## Implemented contract

- Pair Up behind an adjacent unpaired ally. Both occupy the front's square; only the front appears as a selectable field token and legal attack/heal target. The reserve is identified on the token and disabled status card.
- Movement and provisional cancellation carry both positions. Switch changes the front with shared remaining action and no further movement. Separate buttons list only free, legal adjacent squares and consume both actions.
- The partner's identity, Dual Strike chance/damage and Dual Guard chance appear in the combat forecast. Base damage remains distinct from uncertain assistance. The reserve needs a compatible weapon range for a follow-up; a staff reserve can guard but cannot strike.
- Committed battle consumes a saved deterministic seed; previews do not. Both strike and legal counter can receive partner assistance; a defender front that cannot counter shows zero Dual Strike while retaining Dual Guard, and the combat log records triggered strikes/guards and failed strike checks. The front is the enemy target. If it falls, its living reserve takes the square with the pair's remaining activity; Mira's existing defeat condition still applies if Mira herself falls.
- Pair/action state and the seed use validated version 2 saves under the established `hollow-lanterns-v1` key. Existing v1 armies/checkpoints migrate to unpaired units and a defined initial seed, preserving ranks, bonds, HP, casualties and chapter/phase. Overlap is accepted only for one explicit living allied reserve/front relation; cycles, multiple reserves, dead fronts and unrelated overlap are rejected.
- A retry restores the chapter-start seed, army and bonds. New chapter deployment recovers and unpairs the army at its established deployment squares.

Public seams: `command`, `preview`, `reachable`, `pairTargets`, `partnerOf`, `separationTiles`, `decodeSave`. Simulation fixtures are distinct from normal-input browser evidence. The subsequent ordinary-input native route is recorded in [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md).

## Planned normal-input acceptance route

1. Begin the Ash Orchard. Select Mira at B7 and choose Pair Up behind Bram at C7. Confirm one token with Mira as reserve and that her card cannot issue separate orders.
2. Move Bram's pair to a highlighted square, cancel, and verify both return. Move again and choose Switch front to Mira. Verify the front changes and movement is spent while its remaining action is available.
3. Approach an enemy across subsequent rounds. Preview an attack and inspect partner identity, strike/guard probabilities and base counter. Commit and compare the battle log with the displayed assistance types. Save and reload a paired mid-battle position; keep the same relationship and seed progression.
4. On a later active turn choose Separate to one of the offered adjacent cells. Both units must finish that phase. End the round, observe enemy counterplay, and continue the first chapter through its ordinary objective.
5. Reload an existing unpaired v1 save if available: retain army/chapter/bonds, then pair normally. Existing three-map progression, retry and ending remain available.

## Checks and scope

Focused tests cover pair creation/selection, shared movement/cancellation, switch/no-extra-move, legal separation/no-extra-action, seeded forecast purity/replay, successful and failed Dual Guard, front death, v1 migration/pair-aware validation and retry seed restoration. Existing weapon/terrain/range, enemy-phase, checkpoint and chapter/ending tests remain required. 31/31 tests, strict TypeScript, production build (`index-DUuWEwlz.js`) and `git diff --check` passed. Independent Standards/spec reviews found and verified the defender-counter forecast correction. Normal-input first-chapter, Pair Up/Switch/Separate, actual Dual Strike and pair/victory reload acceptance passed; see the exact executed coverage and limits in [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md).

This does not add original hit/critical/speed doubling formulas, weapon durability, inventories, classes, deployment choices, marriage, child units or a full campaign.


Native acceptance attempt 2026-10-15T11:24:27.423261+00:00: after exclusive access was granted, the initial computer-use inventory reported that the Mac is locked and could not be unlocked automatically. No tab or game interaction occurred. At that historical attempt this project’s normal-input acceptance was unverified; the worker stopped input and released access to the parent. After manual unlock and explicit exclusive-access regrant, the completed native route superseded that pending status. Existing source/tests/build results remain valid. No security changes or keep-awake workaround was attempted.


## Observed native acceptance — completed 2026-10-15

Fixed overhead tactical grid; ordinary orders verified shared Pair Up movement/undo, Switch, actual Dual Strike, Separate, all three foes defeated with all four allies alive, and paired/victory save-reload. Native Dual Guard and front-death promotion are not claimed. Full observed sequence, reload results, screenshots and limits: [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md). No source changes or rebuild were needed during native QA. Dedicated QA tab closed and exclusive access released; preview left available.
