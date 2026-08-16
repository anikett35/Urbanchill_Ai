'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityGeocode } from '@/hooks/useCityGeocode';
import { useDebounce } from '@/hooks/useDebounce';
import type { CityResult } from '@/lib/globeConfig';

interface CitySearchBarProps {
  onCitySelected: (city: CityResult) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  activeCityName?: string;
  isAnalyzing?: boolean;
}

export default function CitySearchBar({
  onCitySelected,
  onFocus,
  onBlur,
  placeholder = 'Locate city or coordinate…',
  autoFocus = false,
  activeCityName,
  isAnalyzing = false,
}: CitySearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 260);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, search, clearResults } = useCityGeocode();

  // Fire search when debounced query changes
  useEffect(() => {
    search(debouncedQuery);
    setActiveIndex(-1);
  }, [debouncedQuery, search]);

  // Open dropdown when results arrive
  useEffect(() => {
    if (results.length > 0) setIsOpen(true);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback(
    (city: CityResult) => {
      setQuery(city.name);
      setIsOpen(false);
      clearResults();
      onCitySelected(city);
    },
    [onCitySelected, clearResults]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && results[activeIndex]) {
            handleSelect(results[activeIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, activeIndex, handleSelect]
  );

  const handleClear = () => {
    setQuery('');
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-end pointer-events-auto"
    >
      {/* Search Input Bar (HUD style) */}
      <div
        className={`
          relative flex items-center
          transition-all duration-300 ease-out
          ${isFocused || query ? 'w-72 sm:w-80' : 'w-60 sm:w-68'}
        `}
      >
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          id="city-search-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="city-search-results"
          aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') {
              clearResults();
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={activeCityName ? `City: ${activeCityName}` : placeholder}
          className="
            w-full pl-9 pr-8 py-2.5 rounded-xl
            bg-slate-950/85 backdrop-blur-xl
            border border-white/15
            text-white placeholder-slate-400
            text-xs sm:text-sm font-medium
            outline-none
            focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20
            hover:border-white/25
            transition-all duration-200
            shadow-xl shadow-black/50
          "
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-2.5 flex items-center p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sub-label instrument telemetry */}
      <div className="flex items-center gap-1.5 mt-1.5 mr-1 text-[10px] font-mono tracking-wider text-slate-400 uppercase select-none">
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAnalyzing ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAnalyzing ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </span>
        {isAnalyzing ? (
          <span className="text-amber-400">Telemetry Ingesting…</span>
        ) : activeCityName ? (
          <span>{activeCityName} • Live feed</span>
        ) : (
          <span>Satellite Feed Active</span>
        )}
      </div>

      {/* Autocomplete dropdown (right-aligned so it expands leftward) */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul
            ref={listRef}
            id="city-search-results"
            role="listbox"
            aria-label="City suggestions"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              absolute z-50 top-full right-0 mt-2
              w-72 sm:w-88
              bg-slate-950/95 backdrop-blur-2xl
              border border-white/15 rounded-2xl
              shadow-2xl shadow-black/80
              overflow-hidden
            "
          >
            <div className="px-3.5 py-2 border-b border-white/8 text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Matched Cities ({results.length})
            </div>
            {results.map((city, i) => (
              <li
                key={`${city.lat}-${city.lon}`}
                id={`city-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`
                  flex items-start gap-3 px-4 py-2.5 cursor-pointer
                  transition-colors duration-100
                  ${i === activeIndex
                    ? 'bg-red-500/20 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                  }
                  ${i !== results.length - 1 ? 'border-b border-white/5' : ''}
                `}
              >
                <MapPin className={`
                  w-3.5 h-3.5 mt-0.5 flex-shrink-0
                  ${i === activeIndex ? 'text-red-400' : 'text-slate-400'}
                `} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs truncate text-white">{city.name}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{city.displayName}</div>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

