"use client";

import { Bell, BellOff, Volume2, VolumeX, Play } from "lucide-react";
import { useSoundSettings, playNotificationSound } from "@/lib/soundStore";

export function SoundSettings() {
  const { enabled, volume, setEnabled, setVolume } = useSoundSettings();

  const preview = () => playNotificationSound(enabled ? volume : 0);

  // Процент от 0..1 для CSS-градиента
  const pct = Math.round(volume * 100);

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3 space-y-3">
      {/* Заголовок + переключатель */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Bell className="h-4 w-4 text-forest" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Звук уведомлений</span>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          aria-pressed={enabled}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
            enabled
              ? "bg-forest border-forest"
              : "bg-muted border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Громкость */}
      <div className={enabled ? "" : "opacity-40 pointer-events-none"}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Громкость
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {pct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="relative flex-1">
            {/* Кастомный трек */}
            <div className="absolute inset-y-0 left-0 right-0 my-auto h-1.5 rounded-full bg-muted" />
            <div
              className="absolute inset-y-0 left-0 my-auto h-1.5 rounded-full bg-forest"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Громкость уведомлений"
              className="relative w-full h-4 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-forest
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-forest
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-grab
                [&::-moz-range-track]:bg-transparent"
            />
          </div>
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>

        <button
          type="button"
          onClick={preview}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-forest/50 transition-colors"
        >
          <Play className="h-3 w-3" />
          Проверить
        </button>
      </div>
    </div>
  );
}
