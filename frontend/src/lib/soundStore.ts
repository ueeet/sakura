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
 * Звонкое короткое уведомление (~0.7 сек) через Web Audio API.
 * Колокольчик из 2 нот, каждая = синусоида + октавная гармоника.
 * Low-pass фильтр срезает резкость на верхах.
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

    // Low-pass на ~4кГц убирает звенящие верхи, оставляя яркость
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;

    const master = ctx.createGain();
    master.gain.value = 0.55 * vol;

    filter.connect(master);
    master.connect(ctx.destination);

    // Две ноты: A5 → C#6 (мажорная терция, светлая)
    const notes = [
      { freq: 880, start: 0.0, peak: 0.4, dur: 0.5 }, // A5
      { freq: 1175, start: 0.18, peak: 0.4, dur: 0.52 }, // D6
    ];

    for (const n of notes) {
      const t0 = now + n.start;
      const tEnd = t0 + n.dur;

      // Основной тон
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = n.freq;
      osc.connect(gain);
      gain.connect(filter);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(n.peak, t0 + 0.012); // быстрая атака
      gain.gain.exponentialRampToValueAtTime(0.0001, tEnd);
      osc.start(t0);
      osc.stop(tEnd);

      // Октавная гармоника — добавляет звонкости как у колокола
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.type = "sine";
      harm.frequency.value = n.freq * 2;
      harm.connect(harmGain);
      harmGain.connect(filter);
      harmGain.gain.setValueAtTime(0, t0);
      harmGain.gain.linearRampToValueAtTime(n.peak * 0.35, t0 + 0.012);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, tEnd * 0.95);
      harm.start(t0);
      harm.stop(tEnd);
    }

    setTimeout(() => ctx.close().catch(() => {}), 900);
  } catch {
    // ignore
  }
}
