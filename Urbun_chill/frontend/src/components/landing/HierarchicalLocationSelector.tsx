'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Globe2,
  MapPin,
  ChevronRight,
  Search,
  Building,
  Landmark,
  Compass,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { CityResult, AdministrativeLevel } from '@/lib/globeConfig';
import { NOMINATIM_BASE } from '@/lib/globeConfig';

interface HierarchicalLocationSelectorProps {
  onLocationSelected: (result: CityResult) => void;
  className?: string;
}

// ── Built-in Curated Administrative Hierarchy for Instant Drilldown ────────
// Complemented by live OpenStreetMap Nominatim API for any place worldwide

interface DistrictNode {
  name: string;
  lat: number;
  lon: number;
  bbox: [number, number, number, number];
  talukas: Record<string, TalukaNode>;
}

interface TalukaNode {
  name: string;
  lat: number;
  lon: number;
  bbox: [number, number, number, number];
  areas: string[];
}

interface StateNode {
  name: string;
  lat: number;
  lon: number;
  bbox: [number, number, number, number];
  districts: Record<string, DistrictNode>;
}

const HIERARCHY_DATA: Record<string, { name: string; lat: number; lon: number; bbox: [number, number, number, number]; states: Record<string, StateNode> }> = {
  India: {
    name: 'India',
    lat: 20.5937,
    lon: 78.9629,
    bbox: [6.75, 35.5, 68.16, 97.4],
    states: {
      Maharashtra: {
        name: 'Maharashtra',
        lat: 19.7515,
        lon: 75.7139,
        bbox: [15.6, 22.03, 72.6, 80.9],
        districts: {
          Pune: {
            name: 'Pune District',
            lat: 18.5204,
            lon: 73.8567,
            bbox: [17.89, 19.39, 73.32, 75.16],
            talukas: {
              Haveli: {
                name: 'Haveli Taluka',
                lat: 18.5089,
                lon: 73.9259,
                bbox: [18.28, 18.74, 73.63, 74.20],
                areas: ['Kothrud', 'Baner', 'Hinjawadi', 'Shivaji Nagar', 'Hadapsar', 'Koregaon Park', 'Viman Nagar', 'Wakad', 'Katraj', 'Aundh'],
              },
              'Pune City': {
                name: 'Pune City Taluka',
                lat: 18.5204,
                lon: 73.8567,
                bbox: [18.44, 18.58, 73.78, 73.96],
                areas: ['Shivaji Nagar', 'Camp', 'Deccan Gymkhana', 'Swargate', 'Kasba Peth', 'Bibwewadi', 'Kalyani Nagar', 'Bavdhan'],
              },
              Mulshi: {
                name: 'Mulshi Taluka',
                lat: 18.5583,
                lon: 73.5125,
                bbox: [18.42, 18.72, 73.38, 73.72],
                areas: ['Hinjawadi Phase 1-3', 'Pirangut', 'Paud', 'Lavasa', 'Sus'],
              },
              Baramati: {
                name: 'Baramati Taluka',
                lat: 18.1517,
                lon: 74.5772,
                bbox: [18.01, 18.35, 74.35, 74.80],
                areas: ['Baramati MIDC', 'Bhigwan Road', 'Malegaon', 'Jalochi'],
              },
              Maval: {
                name: 'Maval Taluka',
                lat: 18.7497,
                lon: 73.5656,
                bbox: [18.62, 18.91, 73.35, 73.75],
                areas: ['Talegaon Dabhade', 'Lonavala', 'Kamshet', 'Somatane'],
              },
              Shirur: {
                name: 'Shirur Taluka',
                lat: 18.8256,
                lon: 74.3789,
                bbox: [18.65, 19.05, 74.15, 74.60],
                areas: ['Ranjangaon MIDC', 'Shirur Town', 'Sanaswadi', 'Shikrapur'],
              },
            },
          },
          'Mumbai Suburban': {
            name: 'Mumbai Suburban District',
            lat: 19.1136,
            lon: 72.8697,
            bbox: [18.98, 19.27, 72.78, 72.98],
            talukas: {
              Andheri: {
                name: 'Andheri Taluka',
                lat: 19.1197,
                lon: 72.8464,
                bbox: [19.08, 19.16, 72.80, 72.89],
                areas: ['Andheri West', 'Andheri East', 'Versova', 'Lokhandwala', 'Juhu', 'Marol', 'MIDC Industrial Area'],
              },
              Kurla: {
                name: 'Kurla Taluka',
                lat: 19.0688,
                lon: 72.8789,
                bbox: [19.02, 19.11, 72.84, 72.93],
                areas: ['Bandra Kurla Complex (BKC)', 'Chembur', 'Ghatkopar', 'Kurla West', 'Tilak Nagar'],
              },
              Borivali: {
                name: 'Borivali Taluka',
                lat: 19.2288,
                lon: 72.8541,
                bbox: [19.18, 19.28, 72.80, 72.92],
                areas: ['Borivali West', 'Kandivali', 'Malad West', 'Gorai', 'Charkop'],
              },
            },
          },
          Thane: {
            name: 'Thane District',
            lat: 19.2183,
            lon: 72.9781,
            bbox: [19.05, 19.45, 72.85, 73.35],
            talukas: {
              Thane: {
                name: 'Thane Taluka',
                lat: 19.2183,
                lon: 72.9781,
                bbox: [19.15, 19.28, 72.92, 73.05],
                areas: ['Ghodbunder Road', 'Naupada', 'Vartak Nagar', 'Majiwada', 'Kopri'],
              },
              Kalyan: {
                name: 'Kalyan Taluka',
                lat: 19.2437,
                lon: 73.1355,
                bbox: [19.18, 19.32, 73.08, 73.22],
                areas: ['Kalyan West', 'Dombivli East', 'Dombivli West', 'Khadakpada'],
              },
            },
          },
        },
      },
      'Delhi NCR': {
        name: 'Delhi NCR',
        lat: 28.6139,
        lon: 77.2090,
        bbox: [28.40, 28.88, 76.84, 77.35],
        districts: {
          'New Delhi': {
            name: 'New Delhi District',
            lat: 28.6139,
            lon: 77.2090,
            bbox: [28.55, 28.68, 77.15, 77.26],
            talukas: {
              Chanakyapuri: {
                name: 'Chanakyapuri Division',
                lat: 28.5983,
                lon: 77.1856,
                bbox: [28.56, 28.63, 77.15, 77.22],
                areas: ['Diplomatic Enclave', 'Connaught Place', 'Khan Market', 'Lodi Colony', 'Barakhamba'],
              },
            },
          },
          'South Delhi': {
            name: 'South Delhi District',
            lat: 28.5402,
            lon: 77.2186,
            bbox: [28.45, 28.58, 77.12, 77.30],
            talukas: {
              HauzKhas: {
                name: 'Hauz Khas Division',
                lat: 28.5494,
                lon: 77.2001,
                bbox: [28.50, 28.58, 77.16, 77.25],
                areas: ['Hauz Khas Village', 'Greater Kailash', 'Saket', 'Green Park', 'Malviya Nagar'],
              },
            },
          },
        },
      },
      Karnataka: {
        name: 'Karnataka',
        lat: 15.3173,
        lon: 75.7139,
        bbox: [11.59, 18.45, 74.05, 78.58],
        districts: {
          'Bengaluru Urban': {
            name: 'Bengaluru Urban District',
            lat: 12.9716,
            lon: 77.5946,
            bbox: [12.80, 13.15, 77.45, 77.75],
            talukas: {
              'Bengaluru South': {
                name: 'Bengaluru South Taluka',
                lat: 12.9250,
                lon: 77.5938,
                bbox: [12.85, 12.96, 77.52, 77.66],
                areas: ['Koramangala', 'Jayanagar', 'JP Nagar', 'BTM Layout', 'Electronic City Phase 1'],
              },
              'Bengaluru East': {
                name: 'Bengaluru East Taluka',
                lat: 12.9866,
                lon: 77.6742,
                bbox: [12.93, 13.04, 77.62, 77.78],
                areas: ['Whitefield', 'Indiranagar', 'Marathahalli', 'Bellandur Tech Corridor', 'Mahadevapura'],
              },
            },
          },
        },
      },
    },
  },
  'United States': {
    name: 'United States',
    lat: 37.0902,
    lon: -95.7129,
    bbox: [24.52, 49.38, -124.73, -66.95],
    states: {
      Arizona: {
        name: 'Arizona',
        lat: 34.0489,
        lon: -111.0937,
        bbox: [31.33, 37.00, -114.81, -109.04],
        districts: {
          'Maricopa County': {
            name: 'Maricopa County',
            lat: 33.4484,
            lon: -112.0740,
            bbox: [32.84, 34.05, -113.35, -111.04],
            talukas: {
              'Phoenix Metro': {
                name: 'Phoenix Metro Area',
                lat: 33.4484,
                lon: -112.0740,
                bbox: [33.30, 33.65, -112.25, -111.90],
                areas: ['Downtown Phoenix', 'Roosevelt Row', 'Camelback East', 'Encanto', 'South Mountain', 'Biltmore Area'],
              },
              Scottsdale: {
                name: 'Scottsdale City Sector',
                lat: 33.4942,
                lon: -111.9261,
                bbox: [33.42, 33.72, -111.96, -111.82],
                areas: ['Old Town Scottsdale', 'McCormick Ranch', 'North Scottsdale', 'Gainey Ranch'],
              },
              Tempe: {
                name: 'Tempe City Sector',
                lat: 33.4255,
                lon: -111.9400,
                bbox: [33.36, 33.45, -111.97, -111.88],
                areas: ['ASU Campus District', 'Tempe Town Lake', 'Mill Avenue District'],
              },
            },
          },
        },
      },
    },
  },
  'United Arab Emirates': {
    name: 'United Arab Emirates',
    lat: 23.4241,
    lon: 53.8478,
    bbox: [22.63, 26.08, 51.58, 56.38],
    states: {
      Dubai: {
        name: 'Emirate of Dubai',
        lat: 25.2048,
        lon: 55.2708,
        bbox: [24.75, 25.35, 54.90, 55.60],
        districts: {
          'Dubai Urban': {
            name: 'Dubai Central District',
            lat: 25.2048,
            lon: 55.2708,
            bbox: [25.00, 25.30, 55.10, 55.45],
            talukas: {
              'Bur Dubai / Downtown': {
                name: 'Downtown & Coastal Sector',
                lat: 25.1972,
                lon: 55.2744,
                bbox: [25.15, 25.24, 55.22, 55.32],
                areas: ['Downtown Dubai', 'Business Bay', 'DIFC Financial Centre', 'Dubai Marina', 'Jumeirah Beach'],
              },
            },
          },
        },
      },
    },
  },
  Singapore: {
    name: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    bbox: [1.13, 1.47, 103.60, 104.05],
    states: {
      Singapore: {
        name: 'Central Region',
        lat: 1.3521,
        lon: 103.8198,
        bbox: [1.20, 1.45, 103.70, 103.95],
        districts: {
          'Singapore Metropolis': {
            name: 'Singapore Metropolis',
            lat: 1.3521,
            lon: 103.8198,
            bbox: [1.22, 1.42, 103.75, 103.92],
            talukas: {
              'Central Area': {
                name: 'Central Business District',
                lat: 1.2833,
                lon: 103.8500,
                bbox: [1.26, 1.32, 103.82, 103.88],
                areas: ['Marina Bay', 'Raffles Place', 'Orchard Road', 'Jurong East', 'Tanjong Pagar'],
              },
            },
          },
        },
      },
    },
  },
};

export default function HierarchicalLocationSelector({
  onLocationSelected,
  className = '',
}: HierarchicalLocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedTaluka, setSelectedTaluka] = useState<string>('Haveli');
  const [selectedArea, setSelectedArea] = useState<string>('Kothrud');

  // Custom search / live fallback state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [liveResults, setLiveResults] = useState<CityResult[]>([]);

  // Navigation options
  const countryNode = HIERARCHY_DATA[selectedCountry];
  const states = useMemo(() => (countryNode?.states ? Object.keys(countryNode.states) : []), [countryNode]);
  const stateNode = countryNode?.states?.[selectedState];
  const districts = useMemo(() => (stateNode?.districts ? Object.keys(stateNode.districts) : []), [stateNode]);
  const districtNode = stateNode?.districts?.[selectedDistrict];
  const talukas = useMemo(() => (districtNode?.talukas ? Object.keys(districtNode.talukas) : []), [districtNode]);
  const talukaNode = districtNode?.talukas?.[selectedTaluka];
  const areas = useMemo(() => talukaNode?.areas || [], [talukaNode]);

  // Live Geocode on-demand via Nominatim to guarantee authentic bounding boxes
  const resolveAndLaunch = useCallback(
    async (
      name: string,
      query: string,
      fallbackLat: number,
      fallbackLon: number,
      fallbackBbox: [number, number, number, number],
      level: AdministrativeLevel
    ) => {
      setIsSearching(true);
      try {
        const url = new URL(`${NOMINATIM_BASE}/search`);
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        url.searchParams.set('addressdetails', '1');

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'en-US,en;q=0.9' },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            const item = data[0];
            const bbox: [number, number, number, number] =
              Array.isArray(item.boundingbox) && item.boundingbox.length === 4
                ? [
                    parseFloat(item.boundingbox[0]),
                    parseFloat(item.boundingbox[1]),
                    parseFloat(item.boundingbox[2]),
                    parseFloat(item.boundingbox[3]),
                  ]
                : fallbackBbox;

            const addr = item.address || {};
            onLocationSelected({
              name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              displayName: item.display_name,
              bbox,
              level,
              hierarchy: {
                country: addr.country || selectedCountry,
                state: addr.state || selectedState,
                district: addr.state_district || addr.county || selectedDistrict,
                taluka: addr.subdistrict || addr.city || selectedTaluka,
                area: name,
              },
            });
            setIsSearching(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to verified local node coordinates and bounding box
      }

      onLocationSelected({
        name,
        lat: fallbackLat,
        lon: fallbackLon,
        displayName: `${name}, ${selectedTaluka}, ${selectedDistrict}, ${selectedState}, ${selectedCountry}`,
        bbox: fallbackBbox,
        level,
        hierarchy: {
          country: selectedCountry,
          state: selectedState,
          district: selectedDistrict,
          taluka: selectedTaluka,
          area: name,
        },
      });
      setIsSearching(false);
    },
    [onLocationSelected, selectedCountry, selectedState, selectedDistrict, selectedTaluka]
  );

  // Live Free-form Search for ANY place in the world
  const handleLiveSearch = async (queryText: string) => {
    if (!queryText.trim() || queryText.length < 2) {
      setLiveResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const url = new URL(`${NOMINATIM_BASE}/search`);
      url.searchParams.set('q', queryText);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '5');
      url.searchParams.set('addressdetails', '1');

      const res = await fetch(url.toString(), {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: CityResult[] = data.map((item: any) => {
          const addr = item.address || {};
          const bbox: [number, number, number, number] | undefined =
            Array.isArray(item.boundingbox) && item.boundingbox.length === 4
              ? [
                  parseFloat(item.boundingbox[0]),
                  parseFloat(item.boundingbox[1]),
                  parseFloat(item.boundingbox[2]),
                  parseFloat(item.boundingbox[3]),
                ]
              : undefined;

          return {
            name: item.name || addr.suburb || addr.city || item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            displayName: item.display_name,
            bbox,
            level: 'area',
            hierarchy: {
              country: addr.country,
              state: addr.state,
              district: addr.state_district || addr.county,
              taluka: addr.subdistrict || addr.city,
              area: item.name || addr.suburb,
            },
          };
        });
        setLiveResults(mapped);
      }
    } catch {
      setLiveResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const [showHierarchy, setShowHierarchy] = useState(false);

  return (
    <div className={`w-full text-left space-y-3.5 ${className}`}>
      {/* ── Primary Omnisearch Bar ── */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleLiveSearch(e.target.value);
            }}
            placeholder="Search any locality, taluka, district, or city worldwide..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-800/90 border border-gray-700/80 text-xs sm:text-sm font-medium text-gray-100 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-primary absolute right-3.5 animate-spin pointer-events-none" />
          )}
        </div>

        {/* Instant Search Results Dropdown */}
        {liveResults.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-2 p-1.5 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl space-y-1 max-h-56 overflow-y-auto">
            {liveResults.map((r, i) => (
              <button
                key={`${r.lat}-${r.lon}-${i}`}
                type="button"
                onClick={() => {
                  setLiveResults([]);
                  setSearchQuery('');
                  onLocationSelected(r);
                }}
                className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-100 group-hover:text-white truncate">{r.name}</div>
                    <div className="text-[11px] text-gray-400 truncate">{r.displayName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                    {r.level || 'area'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Presets (Popular Hubs) ── */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-gray-400 text-xs font-medium mr-1">Popular:</span>
        {[
          { name: 'Pune', desc: 'Pune, Maharashtra, India', lat: 18.5204, lon: 73.8567, bbox: [18.28, 18.74, 73.63, 74.20], level: 'district' },
          { name: 'Kothrud', desc: 'Kothrud, Pune, Maharashtra', lat: 18.5074, lon: 73.8077, bbox: [18.48, 18.53, 73.78, 73.83], level: 'area' },
          { name: 'Haveli', desc: 'Haveli Taluka, Pune, Maharashtra', lat: 18.5089, lon: 73.9259, bbox: [18.28, 18.74, 73.63, 74.20], level: 'taluka' },
          { name: 'Mumbai', desc: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777, bbox: [18.90, 19.28, 72.77, 72.99], level: 'district' },
          { name: 'Dubai', desc: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, bbox: [24.75, 25.35, 54.90, 55.60], level: 'state' },
          { name: 'Phoenix', desc: 'Phoenix, Arizona, USA', lat: 33.4484, lon: -112.074, bbox: [33.29, 33.91, -112.32, -111.92], level: 'district' },
        ].map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => {
              onLocationSelected({
                name: item.name,
                lat: item.lat,
                lon: item.lon,
                displayName: item.desc,
                bbox: item.bbox as [number, number, number, number],
                level: item.level as any,
                hierarchy: { country: 'Global', state: '', district: item.name, taluka: item.name, area: item.name },
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-primary/20 border border-gray-700/80 hover:border-primary/40 text-gray-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* ── Expandable Administrative Drilldown ── */}
      <div className="pt-2 border-t border-gray-800">
        <button
          type="button"
          onClick={() => setShowHierarchy(!showHierarchy)}
          className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-200 transition-colors py-1 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Browse administrative hierarchy (Country → State → Taluka → Ward)</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showHierarchy ? 'rotate-90 text-primary' : ''}`} />
        </button>

        {showHierarchy && (
          <div className="mt-2.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700/60 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Country */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedCountry(c);
                    const firstState = Object.keys(HIERARCHY_DATA[c]?.states || {})[0] || '';
                    setSelectedState(firstState);
                    const firstDist = Object.keys(HIERARCHY_DATA[c]?.states?.[firstState]?.districts || {})[0] || '';
                    setSelectedDistrict(firstDist);
                    const firstTal = Object.keys(HIERARCHY_DATA[c]?.states?.[firstState]?.districts?.[firstDist]?.talukas || {})[0] || '';
                    setSelectedTaluka(firstTal);
                    const firstArea = HIERARCHY_DATA[c]?.states?.[firstState]?.districts?.[firstDist]?.talukas?.[firstTal]?.areas[0] || '';
                    setSelectedArea(firstArea);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 outline-none focus:border-primary cursor-pointer"
                >
                  {Object.keys(HIERARCHY_DATA).map((c) => (
                    <option key={c} value={c} className="bg-gray-800 text-gray-100">{c}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const s = e.target.value;
                    setSelectedState(s);
                    const firstDist = Object.keys(stateNode?.districts || {})[0] || '';
                    setSelectedDistrict(firstDist);
                    const firstTal = Object.keys(stateNode?.districts?.[firstDist]?.talukas || {})[0] || '';
                    setSelectedTaluka(firstTal);
                    const firstArea = stateNode?.districts?.[firstDist]?.talukas?.[firstTal]?.areas[0] || '';
                    setSelectedArea(firstArea);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 outline-none focus:border-primary cursor-pointer"
                >
                  {states.map((s) => (
                    <option key={s} value={s} className="bg-gray-800 text-gray-100">{s}</option>
                  ))}
                </select>
              </div>

              {/* District / Taluka */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">Taluka / Sub-district</label>
                <select
                  value={selectedTaluka}
                  onChange={(e) => {
                    const t = e.target.value;
                    setSelectedTaluka(t);
                    const firstArea = talukaNode?.areas[0] || '';
                    setSelectedArea(firstArea);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 outline-none focus:border-primary cursor-pointer"
                >
                  {talukas.map((t) => (
                    <option key={t} value={t} className="bg-gray-800 text-gray-100">{t}</option>
                  ))}
                </select>
              </div>

              {/* Specific Ward / Area */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">Area / Ward</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full py-1.5 px-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 outline-none focus:border-primary cursor-pointer"
                >
                  {areas.map((a) => (
                    <option key={a} value={a} className="bg-gray-800 text-gray-100">{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const query = `${selectedArea || selectedTaluka}, ${selectedDistrict}, ${selectedState}, ${selectedCountry}`;
                const fallbackBbox: [number, number, number, number] = talukaNode?.bbox || [
                  districtNode?.lat ? districtNode.lat - 0.03 : 18.5,
                  districtNode?.lat ? districtNode.lat + 0.03 : 18.56,
                  districtNode?.lon ? districtNode.lon - 0.03 : 73.8,
                  districtNode?.lon ? districtNode.lon + 0.03 : 73.86,
                ];
                resolveAndLaunch(
                  selectedArea || selectedTaluka,
                  query,
                  talukaNode?.lat || 18.5204,
                  talukaNode?.lon || 73.8567,
                  fallbackBbox,
                  'area'
                );
              }}
              className="w-full py-2 px-4 rounded-xl bg-primary hover:bg-primary-mild text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <span>Explore {selectedArea || selectedTaluka}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
