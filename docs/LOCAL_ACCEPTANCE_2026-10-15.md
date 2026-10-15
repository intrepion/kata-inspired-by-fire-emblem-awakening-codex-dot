# Fire Emblem Awakening — normal-input native acceptance (2026-10-15)

Origin: http://fidelity-oblivion-20261015.localhost:5195/ . Dedicated QA tab, no existing user saves altered. Fixed overhead 8×7 tactical grid; normal mouse selection, tile orders, Pair Up/Switch/Separate, forecast confirmation, End round and Save. No browser/game-state injection.

Fresh campaign → Take field → Mira paired behind Bram. One shared square; reserved unit card disabled. Shared movement to B5, undo and repeat, then Switch front to Mira spent movement. After Guard and the enemy phase, Save/reload visibly restored Round 2 with Mira front, Bram reserve, shared B5 tile and HP intact (`reload-pair.jpg`). After moving Ione out of B6, Mira reached D6 and previewed Hollow Pike: base9/counter3, Bram Dual Strike35%/+12, Dual Guard15%. Confirm strike visibly dealt9; an actual seeded Bram Dual Strike dealt the remaining6, defeated the Pike and strengthened the bond (`paired-forecast.jpg`, `dual-strike.jpg`). This is an observed chance outcome, not forced probability evidence.

Round3 Separate Bram to D5 visibly put the two units on separate squares and ended both actions (`separated.jpg`). Sable fought the Scout and Raider with normal bow range/counters, reached level2. Bram then moved to D4 and killed the last Raider in Round4. All three foes defeated; THE LIGHT HOLDS / The road opens appeared. Save followed by reload restored that exact victory (`victory-reloaded.jpg`). All four allies survived; Sable9/24HP, Mira26, Bram28, Ione22. No native defect or source change needed.

Existing checks:31 tests, strict typecheck, production build and diff check pass; independent Standards and Specification reviews passed. Native scope is the first chapter with paired formation, shared orders, Switch, actual Dual Strike, Separate and two persistence points. Dual Guard did not trigger on this route; front-death promotion, invalid saves and wider probability coverage remain automated/review evidence. No full campaign claim.


## Local evidence locations

Evidence directory: `qa/fidelity-2026-10-15/`. The record above is copied from the central project acceptance file.

- [reload-pair.jpg](qa/fidelity-2026-10-15/reload-pair.jpg)
- [dual-strike.jpg](qa/fidelity-2026-10-15/dual-strike.jpg)
- [victory-reloaded.jpg](qa/fidelity-2026-10-15/victory-reloaded.jpg)

## Included native captures

- [reload-pair.jpg](qa/fidelity-2026-10-15/reload-pair.jpg)
- [dual-strike.jpg](qa/fidelity-2026-10-15/dual-strike.jpg)
- [victory-reloaded.jpg](qa/fidelity-2026-10-15/victory-reloaded.jpg)
