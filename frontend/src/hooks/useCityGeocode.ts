'use client';

import { useState, useCallback, useRef } from 'react';
import { NOMINATIM_BASE, CityResult } from '@/lib/globeConfig';

export function useCityGeocode() {
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /** Debounced-friendly forward search — returns city suggestions for a query string */
  const search = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const url = new URL(`${NOMINATIM_BASE}/search`);
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '7');
      url.searchParams.set('addressdetails', '1');

      const res = await fetch(url.toString(), {
        signal: abortRef.current.signal,
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      });
      const data: any[] = await res.json();

      const mapped: CityResult[] = data
        .filter((r) => r.lat && r.lon)
        .map((r) => ({
          name: r.name || r.display_name.split(',')[0].trim(),
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          displayName: r.display_name,
        }));

      setResults(mapped);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.warn('[useCityGeocode] search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reverse-geocode a lat/lon to a CityResult.
   * Used when the user clicks directly on the globe.
   */
  const reverseGeocode = useCallback(
    async (lat: number, lon: number): Promise<CityResult | null> => {
      try {
        const url = new URL(`${NOMINATIM_BASE}/reverse`);
        url.searchParams.set('lat', String(lat));
        url.searchParams.set('lon', String(lon));
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('zoom', '10');

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'en-US,en;q=0.9' },
        });
        const data = await res.json();
        if (!data?.lat) return null;

        const addr = data.address ?? {};
        const name =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state ||
          data.name ||
          'Selected Location';

        return {
          name,
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
          displayName: data.display_name ?? name,
        };
      } catch {
        return null;
      }
    },
    []
  );

  const clearResults = useCallback(() => setResults([]), []);

  return { results, isLoading, search, reverseGeocode, clearResults };
}
