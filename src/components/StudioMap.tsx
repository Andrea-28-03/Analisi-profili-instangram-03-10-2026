import React, { useState, useEffect, useMemo, useRef } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
  MapPin,
  Globe2,
  Building2,
  ExternalLink,
  Sparkles,
  Compass,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { ProfilePreview } from "./ProfilePreview";

// Geocoding Cache
const GEOCODE_CACHE_KEY = "curator_geocode_cache_v1";

interface GeocodeCache {
  [cityCountry: string]: [number, number] | null;
}

const getGeocodeCache = (): GeocodeCache => {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveGeocodeCache = (cache: GeocodeCache) => {
  localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
};

let geocodeQueue: string[] = [];
let isGeocoding = false;

const paperMapProvider = (x: number, y: number, z: number) => {
  return `https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}`;
};

const darkMapProvider = (x: number, y: number, z: number) => {
  return `https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;
};

interface StudioMapProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
  theme?: 'light' | 'dark';
}

export const StudioMap: React.FC<StudioMapProps> = ({ profiles, onSelectProfile, theme = 'light' }) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);
  const [coordsCache, setCoordsCache] = useState<GeocodeCache>(getGeocodeCache());
  const [geocodingProgress, setGeocodingProgress] = useState({ total: 0, current: 0 });
  const [selectedCityOnMap, setSelectedCityOnMap] = useState<string | null>(null);

  // Map interactive center & zoom for click-to-zoom
  const [center, setCenter] = useState<[number, number]>([35, 10]);
  const [zoom, setZoom] = useState<number>(2.5);

  const activeMapProvider = theme === 'dark' ? darkMapProvider : paperMapProvider;

  // Group profiles by Country -> Cities -> Studios
  const countryMap: Record<
    string,
    {
      countryCode: string;
      cities: Record<string, InstagramProfile[]>;
      totalCount: number;
    }
  > = {};

  let unlocatedCount = 0;
  const uniqueCitiesToGeocode = new Set<string>();

  profiles.forEach((p) => {
    const ai = p.aiAnalysis;
    const country = ai?.locationCountry || "Posizione da definire";
    const city = ai?.locationCity || "Città non specificata";

    if (!ai?.locationCountry || !ai?.locationCity) {
      unlocatedCount++;
    } else {
      uniqueCitiesToGeocode.add(`${city}, ${country}`);
    }

    if (!countryMap[country]) {
      countryMap[country] = {
        countryCode: ai?.countryCode || "",
        cities: {},
        totalCount: 0,
      };
    }

    countryMap[country].totalCount++;

    if (!countryMap[country].cities[city]) {
      countryMap[country].cities[city] = [];
    }
    countryMap[country].cities[city].push(p);
  });

  const sortedCountries = Object.entries(countryMap).sort(
    (a, b) => b[1].totalCount - a[1].totalCount
  );

  const displayCountries = selectedCountryFilter
    ? sortedCountries.filter(([c]) => c === selectedCountryFilter)
    : sortedCountries;

  // Geocoding effect
  useEffect(() => {
    const pendingList: string[] = [];
    uniqueCitiesToGeocode.forEach((loc) => {
      if (coordsCache[loc] === undefined) {
        pendingList.push(loc);
      }
    });

    if (pendingList.length > 0) {
      setGeocodingProgress({ total: pendingList.length, current: 0 });
      geocodeQueue = [...pendingList];

      const processQueue = async () => {
        if (isGeocoding || geocodeQueue.length === 0) return;
        isGeocoding = true;

        while (geocodeQueue.length > 0) {
          const loc = geocodeQueue.shift()!;
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                loc
              )}&limit=1`,
              {
                headers: {
                  "User-Agent": "CuratorAI-Applet/1.0",
                },
              }
            );
            const data = await resp.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              setCoordsCache((prev) => {
                const next = { ...prev, [loc]: [lat, lon] as [number, number] };
                saveGeocodeCache(next);
                return next;
              });
            } else {
              setCoordsCache((prev) => {
                const next = { ...prev, [loc]: null };
                saveGeocodeCache(next);
                return next;
              });
            }
          } catch (e) {
            console.error("Geocoding failed for", loc, e);
          }

          setGeocodingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          await new Promise((r) => setTimeout(r, 1100));
        }

        isGeocoding = false;
      };

      processQueue();
    }
  }, [profiles]);

  const mapMarkers = useMemo(() => {
    const markers: {
      locationStr: string;
      coords: [number, number];
      count: number;
      profiles: InstagramProfile[];
    }[] = [];

    const cityToProfiles: Record<string, InstagramProfile[]> = {};
    profiles.forEach((p) => {
      if (p.aiAnalysis?.locationCity && p.aiAnalysis?.locationCountry) {
        const key = `${p.aiAnalysis.locationCity}, ${p.aiAnalysis.locationCountry}`;
        if (!cityToProfiles[key]) cityToProfiles[key] = [];
        cityToProfiles[key].push(p);
      }
    });

    Object.entries(cityToProfiles).forEach(([loc, profs]) => {
      const coords = coordsCache[loc];
      if (coords) {
        markers.push({
          locationStr: loc,
          coords,
          count: profs.length,
          profiles: profs,
        });
      }
    });

    return markers;
  }, [profiles, coordsCache]);

  const containerBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#FFF9E6] border-[#E5DFD2]';

  const handleZoomToCity = (cityName: string, countryName: string) => {
    const key = `${cityName}, ${countryName}`;
    const coords = coordsCache[key];
    if (coords) {
      setCenter(coords);
      setZoom(7.5);
      setSelectedCityOnMap(key);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${containerBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E63946] text-xs font-hand font-bold uppercase tracking-wide mb-1">
              <Compass className="w-4 h-4 text-[#E63946]" />
              <span>Mappatura Geografica del Taccuino</span>
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight">
              Sedi degli Studi & Hub Internazionali (Click per Zoom)
            </h2>
            <p className="text-xs mt-1 max-w-2xl leading-relaxed font-sans opacity-80">
              Esplora la concentrazione geografica. Clicca sui pin nella mappa o sulle città nei riquadri sottostanti per centrare e zoomare automaticamente sul luogo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`${subBoxBg} rounded-xl p-3 text-center border-2 min-w-[90px] shadow-xs`}>
              <div className="text-2xl font-typewriter font-bold">
                {Object.keys(countryMap).filter((k) => k !== "Posizione da definire").length}
              </div>
              <div className="text-[10px] font-hand font-bold uppercase opacity-80">Paesi</div>
            </div>
            <div className={`${subBoxBg} rounded-xl p-3 text-center border-2 min-w-[90px] shadow-xs`}>
              <div className="text-2xl font-typewriter font-bold text-[#E63946]">
                {profiles.filter((p) => p.aiAnalysis?.locationCity).length}
              </div>
              <div className="text-[10px] font-hand font-bold uppercase opacity-80">Città</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className={`${containerBg} border-2 rounded-2xl overflow-hidden h-[480px] relative shadow-doodle-sm transition-colors`}>
        <Map
          provider={activeMapProvider}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          minZoom={2}
        >
          {mapMarkers.map((marker) => {
            const MapMarker = Marker as any;
            return (
              <MapMarker
                key={marker.locationStr}
                width={40}
                anchor={marker.coords}
              >
                <div
                  onClick={() => {
                    setSelectedCityOnMap(selectedCityOnMap === marker.locationStr ? null : marker.locationStr);
                    setCenter(marker.coords);
                    setZoom(7.5);
                  }}
                  className={`relative flex items-center justify-center cursor-pointer group transition-transform ${
                    selectedCityOnMap === marker.locationStr ? "scale-125 z-20" : "hover:scale-110 z-10"
                  }`}
                  title={`${marker.locationStr} (Clicca per zoom)`}
                >
                  {/* Crayon Pin Badge */}
                  <div className={`w-8 h-8 rounded-full border-2 border-[#1C1A17] shadow-doodle-sm flex items-center justify-center font-hand font-bold text-xs ${
                    selectedCityOnMap === marker.locationStr
                      ? "bg-[#FF5E8E] text-white"
                      : "bg-[#FFD13B] text-[#1C1A17]"
                  }`}>
                    {marker.count}
                  </div>
                </div>
              </MapMarker>
            );
          })}

          {/* Sticky Note City Overlay Popup */}
          {selectedCityOnMap && coordsCache[selectedCityOnMap] && (
            <Overlay anchor={coordsCache[selectedCityOnMap]!} offset={[0, 45]}>
              <div className={`${containerBg} border-2 rounded-xl shadow-doodle-lg p-3.5 min-w-[240px] max-w-[300px] z-50`}>
                <div className="flex items-center justify-between border-b border-current opacity-90 pb-2 mb-2">
                  <div className="font-hand font-bold text-base truncate">
                    📍 {selectedCityOnMap.split(',')[0]}
                  </div>
                  <button onClick={() => setSelectedCityOnMap(null)} className="opacity-70 hover:opacity-100 p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {mapMarkers.find(m => m.locationStr === selectedCityOnMap)?.profiles.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProfile(p)}
                      className={`group p-2 rounded-lg border cursor-pointer transition-colors ${subBoxBg} hover:border-[#FF5E8E]`}
                    >
                      <div className="text-xs font-bold truncate">
                        {p.aiAnalysis?.displayName || p.username}
                      </div>
                      <div className="text-[11px] opacity-75 font-typewriter">
                        @{p.username}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Overlay>
          )}
        </Map>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCountries.map(([country, data]) => (
          <div
            key={country}
            className={`${containerBg} rounded-2xl border-2 p-4 shadow-doodle-sm flex flex-col justify-between transition-colors`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-current opacity-20 pb-2 mb-3">
                <div className="flex items-center gap-2 opacity-100">
                  {data.countryCode && (
                    <span className="font-typewriter text-xs font-bold bg-[#FFD13B] text-[#1C1A17] px-1.5 py-0.5 rounded-md border border-[#1C1A17]">
                      {data.countryCode}
                    </span>
                  )}
                  <h3 className="font-hand font-bold text-base">
                    {country}
                  </h3>
                </div>
                <span className="font-typewriter text-xs opacity-75">
                  {data.totalCount} {data.totalCount === 1 ? "studio" : "studi"}
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(data.cities).map(([city, cityProfiles]) => (
                  <div key={city} className={`${subBoxBg} p-2.5 rounded-xl border`}>
                    <div 
                      onClick={() => handleZoomToCity(city, country)}
                      className="font-hand font-bold text-xs text-[#E63946] mb-1 flex items-center justify-between cursor-pointer hover:underline"
                      title="Clicca per zoomare sulla mappa in questa città"
                    >
                      <span>📍 {city} ({cityProfiles.length})</span>
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cityProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onSelectProfile(p)}
                          className={`px-2 py-0.5 text-[11px] border rounded-md font-sans transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#181716] border-[#38332E] hover:bg-[#38332E]' : 'bg-[#FFF] border-[#1C1A17] hover:bg-[#FFD13B]'}`}
                        >
                          {p.aiAnalysis?.displayName || p.username}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
