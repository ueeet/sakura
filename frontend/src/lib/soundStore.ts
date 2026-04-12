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
    return () => {
      listeners.delete(fn);
    };
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
 * Shared AudioContext + auto-unlock на первый жест пользователя.
 *
 * Браузеры (Chrome/Safari) создают AudioContext в состоянии `suspended`,
 * пока юзер не кликнул/тапнул по странице. Без resume() звук молчит.
 * Вешаем один раз listener на pointerdown/keydown, который разблокирует
 * контекст — дальше звук играет при любом push-событии.
 */
let sharedCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  sharedCtx = new AudioCtx();

  const unlock = () => {
    if (sharedCtx && sharedCtx.state === "suspended") {
      sharedCtx.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });

  return sharedCtx;
}

/**
 * Звонкое короткое уведомление (~0.7 сек) через Web Audio API.
 * Колокольчик из 2 нот, каждая = синусоида + октавная гармоника.
 * Low-pass фильтр срезает резкость на верхах.
 */
export function playNotificationSound(vol: number) {
  if (vol <= 0) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  // Пытаемся разблокировать контекст. Если пользователь ещё не
  // взаимодействовал со страницей — resume() откажет, и звук пропадёт
  // тихо. После первого клика/нажатия всё начнёт работать.
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
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

    // Две ноты: A5 → D6 (светлый мажорный интервал)
    const notes = [
      { freq: 880, start: 0.0, peak: 0.4, dur: 0.5 },
      { freq: 1175, start: 0.18, peak: 0.4, dur: 0.52 },
    ];

    for (const n of notes) {
      const t0 = now + n.start;
      const tEnd = t0 + n.dur;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = n.freq;
      osc.connect(gain);
      gain.connect(filter);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(n.peak, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, tEnd);
      osc.start(t0);
      osc.stop(tEnd);

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
  } catch {
    // ignore
  }
}
