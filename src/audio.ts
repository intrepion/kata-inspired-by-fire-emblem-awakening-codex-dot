let context: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let index = 0;
export function toggleAudio(enabled: boolean) {
  if (!enabled) {
    if (timer) clearInterval(timer);
    timer = null;
    void context?.suspend();
    return;
  }
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes = [220, 261.63, 329.63, 293.66, 220, 196, 261.63, 246.94];
    const play = () => {
      if (!context) return;
      const now = context.currentTime;
      [notes[index++ % notes.length], 110].forEach((freq, i) => {
        const o = context!.createOscillator(),
          g = context!.createGain();
        o.type = i ? "sine" : "triangle";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(i ? 0.015 : 0.025, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
        o.connect(g);
        g.connect(context!.destination);
        o.start(now);
        o.stop(now + 1.3);
      });
    };
    play();
    timer = setInterval(play, 650);
  } catch {
    /* Audio availability never prevents play. */
  }
}
export function cue() {
  try {
    if (!context || context.state !== "running") return;
    const o = context.createOscillator(),
      g = context.createGain();
    o.frequency.setValueAtTime(440, context.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1);
    g.gain.setValueAtTime(0.025, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    o.connect(g);
    g.connect(context.destination);
    o.start();
    o.stop(context.currentTime + 0.2);
  } catch {}
}
