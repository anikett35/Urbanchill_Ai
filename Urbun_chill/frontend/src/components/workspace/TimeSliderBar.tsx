'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimeSliderBarProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function TimeSliderBar({ currentYear, onYearChange }: TimeSliderBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onYearChange(currentYear >= 2026 ? 2018 : currentYear + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, currentYear, onYearChange]);

  const yearDelta = Number(((currentYear - 2018) * 0.28).toFixed(1));

  return (
    <div
      className="
        card card-border card-shadow
        flex items-center gap-4 px-5 py-3 rounded-2xl
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        border border-gray-200 dark:border-gray-700/80
        shadow-xl
        pointer-events-auto select-none
      "
      aria-label="Historical retrospective warming time slider"
    >
      {/* Play/Pause & Reset Actions */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
          className="
            button button-solid w-9 h-9 rounded-xl
            flex items-center justify-center
            shadow-xs
          "
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onYearChange(2026);
          }}
          title="Reset to current year (2026)"
          aria-label="Reset timeline"
          className="
            button button-default w-9 h-9 rounded-xl
            flex items-center justify-center cursor-pointer
          "
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scrub Slider & Indicators */}
      <div className="flex flex-col gap-1.5 min-w-[240px] sm:min-w-[320px]">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-primary" /> Reconstructed Historical Trend
          </span>
          <span className="font-bold text-primary font-mono">
            Year {currentYear} {currentYear < 2026 && <span className="text-orange-500 font-semibold">({((currentYear - 2026) * 0.32).toFixed(1)}°C)</span>}
          </span>
        </div>

        <input
          type="range"
          min={2018}
          max={2026}
          step={1}
          value={currentYear}
          onChange={(e) => {
            setIsPlaying(false);
            onYearChange(parseInt(e.target.value));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-primary"
          aria-label="Historical retrospective year slider"
        />

        <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-gray-400 font-medium">
          <span>2018</span>
          <span>2020</span>
          <span>2022</span>
          <span>2024</span>
          <span className="font-bold text-primary">2026</span>
        </div>
        <div className="text-[9px] text-gray-400 dark:text-gray-500 font-sans mt-0.5 leading-tight">
          Modeled retrospective trend based on the current analysis baseline; not direct historical satellite observations.
        </div>
      </div>
    </div>
  );
}
