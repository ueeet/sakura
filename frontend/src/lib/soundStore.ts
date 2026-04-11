"use client";

import { useEffect, useState } from "react";

const STORAGE_ENABLED = "admin_sound_enabled";
const STORAGE_VOLUME = "admin_sound_volume";

let enabled = true;
let volume = 0.7;

if (typeof window !== "undefined") {
  try {
    const e = localStorage.getItem(STORAGE_ENABLED);
    if (e !== null) enabled = e === "1";
    const v = parseFloat(localStorage.getItem(STORAGE_VOLUME) || "");
    if (!Number.isNaN(v)) volume = Math.max(0, Math.min(1, v));
  } catch {
    // ignore
  }
}

const listeners = new Set<() => void>();
function notify() {
  for (const fn of listeners) fn();
}

export const soundStore = {
  getEnabled: () => enabled,
  getVolume: () => volume,
  setEnabled(v: boolean) {
    enabled = v;
    try {
      localStorage.setItem(STORAGE_ENABLED, v ? "1" : "0");
    } catch {}
    notify();
  },
  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem(STORAGE_VOLUME, String(volume));
    } catch {}
    notify();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/** Хук для подписки React-компонента на изменения настроек звука */
export function useSoundSettings() {
  const [state, setState] = useState({ enabled, volume });
  useEffect(() => {
    return soundStore.subscribe(() => {
      setState({
        enabled: soundStore.getEnabled(),
        volume: soundStore.getVolume(),
      });
    });
  }, []);
  return {
    enabled: state.enabled,
    volume: state.volume,
    setEnabled: soundStore.setEnabled,
    setVolume: soundStore.setVolume,
  };
}

/**
 * Мягкое мелодичное уведомление через Web Audio API:
 * 3 ноты с медленной атакой, длинным затуханием и low-pass фильтром.
 */
export function playNotificationSound(vol: number) {
  if (vol <= 0) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    filter.Q.value = 0.7;

    const master = ctx.createGain();
    master.gain.value = 0.5 * vol;

    filter.connect(master);
    master.connect(ctx.destination);

    const notes = [
      { freq: 740, start: 0.0, peak: 0.32, dur: 1.4 },
      { freq: 880, start: 0.22, peak: 0.3, dur: 1.4 },
      { freq: 1109, start: 0.44, peak: 0.28, dur: 1.6 },
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = n.freq;
      osc.connect(gain);
      gain.connect(filter);

      const t0 = now + n.start;
      const tEnd = t0 + n.dur;

      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(n.peak, t0 + 0.08);
      gain.gain.linearRampToValueAtTime(n.peak * 0.5, t0 + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, tEnd);

      osc.start(t0);
      osc.stop(tEnd);
    }

    setTimeout(() => ctx.close().catch(() => {}), 2400);
  } catch {
    // ignore
  }
}
