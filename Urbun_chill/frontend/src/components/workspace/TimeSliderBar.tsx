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
        flex items-center gap-4 px-5 py-3 rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-2xl shadow-black/20
        pointer-events-auto
      "
      aria-label="Historical time slider control"
    >
      {/* Play/Pause & Reset Actions */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
          className="
            w-9 h-9 rounded-xl
            bg-primary hover:bg-primary-deep
            text-white
            flex items-center justify-center
            shadow-sm transition-colors
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
            w-9 h-9 rounded-xl
            bg-gray-100 dark:bg-gray-700
            hover:bg-gray-200 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-200
            flex items-center justify-center
            transition-colors
          "
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scrub Slider & Indicators */}
      <div className="flex flex-col gap-1.5 min-w-[240px] sm:min-w-[320px]">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-primary" /> Historical Satellite Series
          </span>
          <span className="font-bold text-primary font-mono">
            Year {currentYear} {currentYear > 2018 && <span className="text-orange-500 font-semibold">(+{yearDelta}°C anomaly)</span>}
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
          aria-label="Historical year slider"
        />

        <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500 font-medium">
          <span>2018</span>
          <span>2020</span>
          <span>2022</span>
          <span>2024</span>
          <span className="font-bold text-primary">2026</span>
        </div>
      </div>
    </div>
  );
}
