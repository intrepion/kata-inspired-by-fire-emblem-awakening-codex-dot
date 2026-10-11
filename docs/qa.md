# Verification record — 2026-10-11

## Real browser gameplay

User's Mac Chrome, visible localhost tab, controlled through the supported Cua browser APIs. Playwright locators performed normal button/grid clicks and a keyboard Escape. No browser state injection, debug commands, autoplay or simulated combat substituted for gameplay.

Two complete campaigns reached the epilogue. Successful chapter rounds: Orchard 3, Watchfires 5, Warden 3. The second campaign used the reviewed transition fixes and explicitly reloaded both next-chapter story screens, including chapter III after lighting both beacons. Ending also survived save and reload.

Observed tactical choices:

- Guarded formation at the first choke; supported kills consumed one action despite a double-click confirmation.
- Mira's disadvantaged attack at the ruined crossing forecast 7 damage and 5 counter; actual HP changed 11→4 for the enemy and 26→21 for Mira. Sable finished with a supported range-two shot.
- Ione reached 1 HP in the watchfire fight. The others cleared the archer, and Ione retreated to the first beacon and guarded: 1→4 HP, then 2 damage left 2 HP. Lighting both beacons won the objective, separate from rout mechanics.
- Rank-II Mira/Sable support persisted into the Warden battle. Mira forecast 9 damage and 8 counter: Warden 29→20, Mira 24→16. Sable's subsequent forecast 10 damage/0 counter left Warden at 10. Ione healed Mira for 9; enemy retaliation and the tower archer left Mira at 13. Final strike killed the Warden, raised Mira to level 4, and preserved her forecast 13 current HP.
- Camp training raised Bram and then Sable; training choices locked afterward. Allies fully recovered at chapter deployment.

Additional normal-control checks: invalid water/blocked movement rejected; provisional movement saved/reloaded and cancelled; Escape undid a move and dismissed help; enemy phase reload resumed once and advanced round 2→3; explicit Save worked; reset cancellation retained the ending; reset confirmation produced a fresh title save; enemy inspection returned to the same provisional orders; current enemy range overlay toggled. Deliberately ending ten watchfire rounds without objectives produced defeat, a fallen Sable, and a reloadable retry that restored all chapter-start HP/XP/bonds.

Final inspection regression check: with Mira provisionally moved, inspecting Ione and Bram exposed their details and Back to orders without Guard/Wait actions. Returning restored Mira’s orders; inspecting an enemy also returned correctly, and Undo restored Mira’s original tile. Reset and reload left the user a fresh title screen. Both independent reviewers confirmed the corresponding source correction.

Responsive checks: default desktop (1185×690), mobile override (390×844, final strike and ending), tablet override (820×1024, grid/range controls). DOM measurements at mobile/tablet found scrollWidth equal to viewport width. Overrides were reset. Full-page screenshots were saved and inspected; controls remain scrollable on smaller screens. Some Chrome extension warnings appeared, not application errors.

## Automated domain evidence

22 tests through public domain functions and commands, strict TypeScript, production build and dependency audit. Controlled domain fixtures exercise lethal counter/level interaction, malformed saves, invalid origins, label injection, full journal camp training, chapter-specific beacon clearing, fallen ally recovery and deployment onto a different terrain map. These are automated domain tests, distinct from the real browser playthrough above.

Initial dependency advisories were removed by upgrading Vite/Vitest; final audit reports zero vulnerabilities. CI runs npm ci, npm run check, and npm audit --audit-level=moderate.

## Remaining limits

The soundtrack toggle and error-free playback initiation were checked; speaker audibility and subjective musical quality were not verified. Mobile tests use a Chrome viewport, not a physical touchscreen. Cross-browser behavior, screen-reader navigation and unavailable-storage behavior were not manually exercised. Save parsing and malformed data are domain-tested. The campaign is intentionally short, with three hand-authored maps and deterministic enemy AI.

## Local server

Port 5195 was chosen after inspecting existing listeners; prior game servers were preserved. scripts/launch.mjs detached the server from the task terminal and verified HTTP 200; the Chrome tab loaded it afterward. No persistent service, boot/login hook, network exposure beyond loopback or security settings were changed. The local browser save is reset to a fresh campaign for the user after verification.

## Screenshots

- [Title](../evidence/title.jpg)
- [Final battle forecast](../evidence/final-forecast.jpg)
- [Ending](../evidence/ending.jpg)
- [Defeat](../evidence/defeat.jpg)
- [Bonds](../evidence/bonds.jpg)
- [Watchfire victory](../evidence/watchfires.jpg)
- [Chapter III story reload](../evidence/chapter-transition-reload.jpg)
- [Mobile combat](../evidence/mobile-combat.jpg)
- [Mobile ending](../evidence/mobile-ending.jpg)
- [Tablet field](../evidence/tablet-field.jpg)
