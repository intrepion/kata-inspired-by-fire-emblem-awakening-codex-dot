# Lanterns of the Hollow

Delegated decisions, 2026-10-11. No interactive design interview occurred. The user authorized recommended choices and a complete new private repository.

An original three-chapter tactical RPG: a fogbound valley, four lantern keepers, and a bell that feeds on forgotten names. Readable 8×7 maps use forest (two movement, two defense), water (impassable), ruins (one defense), roads and healing shrines. One move and one action per ally per round. Preview all damage and counter damage deterministically before confirmation; blade beats axe, axe beats lance, lance beats blade (+2/-2 attack). Bow attacks exactly at distance two; staff heals at distance one or two and attacks at distance one.

Adjacent living allies grant bond support: +1 attack/+1 defense, becoming +2 attack at bond rank 2. Shared attacks build bond points and persist across chapters. Four roles: blade leader, axe guardian, bow scout, staff healer. Combat grants XP and deterministic levels; camp offers one training choice per chapter. All allies recover after battle; there is no permadeath. Leader falling, all allies falling, or exceeding chapter round limit causes defeat. Retry restores the chapter-start snapshot, including progression, to prevent farming.

Chapter 1 routs the invaders; chapter 2 lights two beacons with an action; chapter 3 defeats the Bell Warden. Story, camp dialogue, training, final ending, save/reload, reset confirmation, help and synthesized audio must be present. Invalid actions are rejected at the domain boundary, independent of UI state. Cancel undoes an uncommitted move; attacks cannot be repeated. Enemy phase is visibly announced and locked, then resolved atomically. Saves during enemy phase resume it once. Validate untrusted saves and handle unavailable storage.

Tests at authorized seams: public movement reachability, battle commands, combat preview, enemy turn, progression and save decoding. This maps the user's explicitly requested domain tests to the implementation. Normal-control Chrome playthrough must be distinguished from domain simulations. No debug cheat controls shipped.
