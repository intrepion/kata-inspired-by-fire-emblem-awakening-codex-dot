# Standards

Keep combat, movement, progression and save validation in a pure domain module. Commands enforce phase, occupancy, range, action consumption and terminal states. UI renders state and sends commands; it must not implement a second combat rule set. Use strict TypeScript, original local assets, accessible named controls, and no production debug shortcuts. Test behavior through public domain seams. Distinguish normal visible browser controls from simulations in evidence.
