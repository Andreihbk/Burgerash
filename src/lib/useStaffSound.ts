"use client";

import { useCallback, useRef, useState } from "react";

/**
 * "SUNET PORNIT/OPRIT" toggle + a double beep for new orders (staff screens). Audit R13.
 * The AudioContext is created on the first tap (browsers only allow sound after a user gesture).
 */
export function useStaffSound(frequency: number) {
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!soundOnRef.current || !ctx) return;
    [0, 0.25].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      gain.gain.value = 0.2;
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  }, [frequency]);

  function toggleSound() {
    if (!soundOn) {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
      soundOnRef.current = true;
      setSoundOn(true);
      beep();
    } else {
      soundOnRef.current = false;
      setSoundOn(false);
    }
  }

  return { soundOn, toggleSound, beep };
}
