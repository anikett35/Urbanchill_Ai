'use client';

import { useState, useCallback, useRef } from 'react';
import { NOMINATIM_BASE, CityResult, AdministrativeLevel } from '@/lib/globeConfig';

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
        .map((r) => {
          const addr = r.address || {};
          const country = addr.country;
          const state = addr.state || addr.province || addr.region;
          const district = addr.state_district || addr.county || addr.district;
          const taluka = addr.subdistrict || addr.taluk || addr.tehsil || addr.municipality || addr.city;
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.village || addr.town || r.name;

          let level: AdministrativeLevel = 'area';
          const type = r.type || r.addresstype || '';
          if (type === 'country') level = 'country';
          else if (['state', 'province', 'region'].includes(type)) level = 'state';
          else if (['county', 'state_district', 'district'].includes(type)) level = 'district';
          else if (['subdistrict', 'taluk', 'tehsil', 'city', 'municipality'].includes(type)) level = 'taluka';
          else level = 'area';

          const bbox: [number, number, number, number] | undefined =
            Array.isArray(r.boundingbox) && r.boundingbox.length === 4
              ? [
                  parseFloat(r.boundingbox[0]), // minLat
                  parseFloat(r.boundingbox[1]), // maxLat
                  parseFloat(r.boundingbox[2]), // minLon
                  parseFloat(r.boundingbox[3]), // maxLon
                ]
              : undefined;

          return {
            name: r.name || area || taluka || r.display_name.split(',')[0].trim(),
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
            bbox,
            level,
            hierarchy: {
              country,
              state,
              district,
              taluka,
              area,
            },
          };
        });

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
          addr.suburb ||
          addr.neighbourhood ||
          addr.city ||
          addr.town ||
          addr.subdistrict ||
          addr.county ||
          addr.state ||
          data.name ||
          'Selected Location';

        const bbox: [number, number, number, number] | undefined =
          Array.isArray(data.boundingbox) && data.boundingbox.length === 4
            ? [
                parseFloat(data.boundingbox[0]),
                parseFloat(data.boundingbox[1]),
                parseFloat(data.boundingbox[2]),
                parseFloat(data.boundingbox[3]),
              ]
            : undefined;

        return {
          name,
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
          displayName: data.display_name ?? name,
          bbox,
          level: 'area',
          hierarchy: {
            country: addr.country,
            state: addr.state,
            district: addr.state_district || addr.county,
            taluka: addr.subdistrict || addr.city,
            area: addr.suburb || addr.neighbourhood || name,
          },
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
