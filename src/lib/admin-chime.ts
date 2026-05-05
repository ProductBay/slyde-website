export type ChimeType = "user" | "lead";

export function playAdminChime(type: ChimeType) {
  try {
    const ctx = new AudioContext();

    const notes: [number, number][] =
      type === "user"
        ? [[880, 0], [1100, 0.18]]   // bright high ding — new user registration
        : [[660, 0], [880, 0.18]];   // warm lower ding  — new Slyder lead

    for (const [freq, offset] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);

      gain.gain.setValueAtTime(0, ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.55);

      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.6);
    }

    setTimeout(() => ctx.close(), 2000);
  } catch {
    // AudioContext unavailable
  }
}
