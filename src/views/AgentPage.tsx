import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Menu } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logo from "@/assets/photo_2026-02-17_16-00-19_photo_x2_2560x2560_2pass_moreDetail-Photoroom.png";
import markerIconImage from "@/assets/marker.png";
import { cn } from "@/lib/utils";
import { getAgents, getCities, getCommunes, getDepartments, getQuartiers } from "@/api/agents";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type DataItem = Record<string, any>;

const extractData = (response: any) => {
  return (
    response?.items ||
    response?.data ||
    response?.item?.data ||
    response?.item ||
    (Array.isArray(response) ? response : [])
  );
};

const useDataLoader = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (apiFunction: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      const extracted = extractData(response);
      setData(Array.isArray(extracted) ? extracted : []);
      return extracted;
    } catch (err: any) {
      setError(err?.message || String(err));
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, loadData, setData };
};

const formatLatLng = (lat?: number, lng?: number) => {
  const latText = typeof lat === "number" && Number.isFinite(lat) ? lat.toFixed(6) : "—";
  const lngText = typeof lng === "number" && Number.isFinite(lng) ? lng.toFixed(6) : "—";
  return { latText, lngText };
};


const createCustomMarkerIcon = (isHighlighted = false) =>
  L.icon({
    iconUrl: markerIconImage,
    iconSize: isHighlighted ? ([45, 45] as [number, number]) : ([35, 35] as [number, number]),
    iconAnchor: isHighlighted ? ([22, 45] as [number, number]) : ([17, 35] as [number, number]),
    popupAnchor: [0, -35] as [number, number],
  });

const MapInstanceExposer = ({ mapRef }: { mapRef: React.MutableRefObject<any> }) => {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
};

const MapBoundsUpdater = ({
  bounds,
  agentsCount,
  isHovering,
  lastZoomedAgent,
}: {
  bounds: Array<[number, number]> | null;
  agentsCount: number;
  isHovering: boolean;
  lastZoomedAgent: string | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (isHovering || lastZoomedAgent) return;
    if (bounds && agentsCount > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, agentsCount, isHovering, lastZoomedAgent, map]);
  return null;
};

const MapControlsContainer = ({ onLocationUpdate }: { onLocationUpdate: (v: { lat: number; lng: number }) => void }) => {
  const map = useMap();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.2, easeLinearity: 0.25 });
        onLocationUpdate({ lat: latitude, lng: longitude });
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let msg = "Erreur lors de la récupération de votre position.";
        if (error.code === error.PERMISSION_DENIED) msg = "L'accès à la géolocalisation a été refusé.";
        if (error.code === error.POSITION_UNAVAILABLE) msg = "Les informations de localisation ne sont pas disponibles.";
        if (error.code === error.TIMEOUT) msg = "La demande de localisation a expiré.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="leaflet-top leaflet-left" style={{ zIndex: 1000 }}>
      <div
        className="leaflet-control leaflet-bar"
        style={{
          border: "none",
          background: "transparent",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={() => map.zoomIn()}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-lg border border-gray-300 transition-all duration-200 flex items-center justify-center"
          style={{ width: "48px", height: "48px", cursor: "pointer" }}
          title="Zoom avant"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-lg border border-gray-300 transition-all duration-200 flex items-center justify-center"
          style={{ width: "48px", height: "48px", cursor: "pointer" }}
          title="Zoom arrière"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleGetCurrentPosition}
          disabled={isLoading}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-lg border border-gray-300 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ width: "48px", height: "48px" }}
          title="Centrer sur ma position"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

type FilterConfig = {
  label: string;
  placeholder: string;
  getValue: (item: any) => string;
  getLabel: (item: any) => string;
  getKey: (item: any, index: number) => string;
  dependentFilters: Array<keyof FiltersState>;
  requires?: keyof FiltersState;
};

type FiltersState = {
  department: string;
  city: string;
  commune: string;
  quartier: string;
};

const FILTER_CONFIG: Record<keyof FiltersState, FilterConfig> = {
  department: {
    label: "Département",
    placeholder: "Sélectionner un département",
    getValue: (item) => String(item.codeDepartement || item.id || ""),
    getLabel: (item) =>
      String(item.libelleDepartement || item.nomDepartement || item.nom || item.libelle || ""),
    getKey: (item, index) => String(item.codeDepartement || item.id || `dept-${index}`),
    dependentFilters: ["city", "commune", "quartier"],
  },
  city: {
    label: "Ville",
    placeholder: "Sélectionner une ville",
    getValue: (item) => String(item.idWVille || item.id || ""),
    getLabel: (item) => String(item.libelleVille || item.nomVille || item.nom || item.libelle || ""),
    getKey: (item, index) => String(item.idWVille || item.id || `city-${index}`),
    dependentFilters: ["commune", "quartier"],
    requires: "department",
  },
  commune: {
    label: "Commune",
    placeholder: "Sélectionner une commune",
    getValue: (item) => String(item.idwCommunes || item.id || ""),
    getLabel: (item) =>
      String(item.libelleCommune || item.nomCommune || item.nom || item.libelle || ""),
    getKey: (item, index) => String(item.idwCommunes || item.id || `commune-${index}`),
    dependentFilters: ["quartier"],
    requires: "city",
  },
  quartier: {
    label: "Quartier",
    placeholder: "Sélectionner un quartier",
    getValue: (item) => String(item.idQuartier || item.id || ""),
    getLabel: (item) =>
      String(item.libelleQuartier || item.nomQuartier || item.nom || item.libelle || ""),
    getKey: (item, index) => String(item.idQuartier || item.id || `quartier-${index}`),
    dependentFilters: [],
    requires: "commune",
  },
};

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  getValue,
  getLabel,
  getKey,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: any[];
  disabled: boolean;
  placeholder: string;
  getValue: (item: any) => string;
  getLabel: (item: any) => string;
  getKey: (item: any, index: number) => string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007F68] focus:border-transparent bg-white"
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={getKey(option, index)} value={getValue(option)}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AgentPage() {
  const SHOW_FILTERS = false;

  const [filters, setFilters] = useState<FiltersState>({
    department: "",
    city: "",
    commune: "",
    quartier: "",
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const departmentsLoader = useDataLoader();
  const citiesLoader = useDataLoader();
  const communesLoader = useDataLoader();
  const quartiersLoader = useDataLoader();

  // Filters drawer is optional; keep it closed when filters are disabled.
  const [drawerOpen, setDrawerOpen] = useState(SHOW_FILTERS);

  // Do not auto-request geolocation on mount (avoids browser provider warnings).
  // Users can still trigger geolocation via the map control button.

  useEffect(() => {
    if (SHOW_FILTERS) {
      departmentsLoader.loadData(() => getDepartments());
    }
    // Always load agents immediately (no filters required)
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback(
    (filterName: keyof FiltersState, value: string) => {
      setFilters((prev) => {
        const next: FiltersState = { ...prev, [filterName]: value } as FiltersState;
        FILTER_CONFIG[filterName].dependentFilters.forEach((dep) => {
          next[dep] = "";
        });
        return next;
      });

      FILTER_CONFIG[filterName].dependentFilters.forEach((dep) => {
        const loader =
          dep === "city" ? citiesLoader : dep === "commune" ? communesLoader : dep === "quartier" ? quartiersLoader : null;
        loader?.setData([]);
      });
    },
    [citiesLoader, communesLoader, quartiersLoader]
  );

  useEffect(() => {
    if (filters.department) citiesLoader.loadData(() => getCities(filters.department));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department]);

  useEffect(() => {
    if (filters.city) communesLoader.loadData(() => getCommunes(filters.city));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city]);

  useEffect(() => {
    if (filters.commune) quartiersLoader.loadData(() => getQuartiers(filters.commune));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.commune]);

  const loadAgents = useCallback(async () => {
    try {
      setGlobalLoading(true);
      setGlobalError(null);
      const response = await getAgents(filters.commune);
      if (response?.hasError) {
        setGlobalError(response?.status?.message || "Erreur lors de la récupération des points de vente");
        setAgents([]);
        return;
      }
      const agentsData =
        response?.items ||
        response?.data?.items ||
        response?.data ||
        response?.item?.data ||
        response?.item ||
        (Array.isArray(response) ? response : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
    } catch (err: any) {
      setGlobalError("Erreur lors du chargement des points de vente. Veuillez réessayer plus tard.");
      setAgents([]);
    } finally {
      setGlobalLoading(false);
    }
  }, [filters.commune]);

  useEffect(() => {
    if (SHOW_FILTERS && filters.commune) {
      loadAgents();
      setDrawerOpen(false);
    }
  }, [filters.commune, loadAgents]);

  const isLoading =
    globalLoading ||
    (SHOW_FILTERS && departmentsLoader.loading) ||
    (SHOW_FILTERS && citiesLoader.loading) ||
    (SHOW_FILTERS && communesLoader.loading) ||
    (SHOW_FILTERS && quartiersLoader.loading);
  const error =
    globalError ||
    (SHOW_FILTERS && departmentsLoader.error) ||
    (SHOW_FILTERS && citiesLoader.error) ||
    (SHOW_FILTERS && communesLoader.error) ||
    (SHOW_FILTERS && quartiersLoader.error);

  const agentsWithCoords = useMemo(() => {
    return (agents || [])
      .filter((a) => a.latitude && a.longitude)
      .map((a, index) => ({
        id: a.codeAgence || a.login || a.telephone || `agent-${index}`,
        lat: parseFloat(a.latitude),
        lng: parseFloat(a.longitude),
        ...a,
      }));
  }, [agents]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (agentsWithCoords.length > 0) return [agentsWithCoords[0].lat, agentsWithCoords[0].lng];
    if (userLocation) return [userLocation.lat, userLocation.lng];
    return [5.36, -4.0083];
  }, [agentsWithCoords, userLocation]);

  const mapRef = useRef<any>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const lastZoomedAgentRef = useRef<string | null>(null);

  const markerIcon = useMemo(() => createCustomMarkerIcon(false), []);
  const highlightedMarkerIcon = useMemo(() => createCustomMarkerIcon(true), []);

  const bounds = agentsWithCoords.length > 0 ? agentsWithCoords.map((a) => [a.lat, a.lng] as [number, number]) : null;

  const flyToAgent = useCallback((agent: any) => {
    if (!mapRef.current || !agent) return;
    const lat = parseFloat(agent.lat ?? agent.latitude);
    const lng = parseFloat(agent.lng ?? agent.longitude);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    const map = mapRef.current;
    if (!map || typeof map.flyTo !== "function") return;

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    try {
      if (typeof map.stop === "function") map.stop();
      if (map._panAnim?.stop) map._panAnim.stop();
      if (map._zoomAnim?.stop) map._zoomAnim.stop();
    } catch {
      // ignore
    }

    animationTimeoutRef.current = window.setTimeout(() => {
      map.flyTo([lat, lng], 17, { duration: 0.6, easeLinearity: 0.25 });
      const agentId = String(agent.id || agent.codeAgence || agent.login || agent.telephone || "");
      lastZoomedAgentRef.current = agentId || null;
    }, 10);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar in sandbox style */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Ouvrir les filtres"
          >
            <Menu className="size-5" />
          </button>
          <img src={logo} alt="PEYA PAY" className="h-9 w-auto object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Nos Agents</span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Sandbox
        </Link>
      </header>

      {SHOW_FILTERS && (
        <>
          {/* Filter drawer overlay (mobile + desktop) */}
          <div
            className={cn(
              "fixed inset-0 z-[9998] bg-black/40 transition-opacity",
              drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform md:hidden",
              drawerOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-4 pt-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                <FilterSelect
                  id="agents-filter-department"
                  label={FILTER_CONFIG.department.label}
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  options={departmentsLoader.data}
                  disabled={isLoading}
                  placeholder={FILTER_CONFIG.department.placeholder}
                  getValue={FILTER_CONFIG.department.getValue}
                  getLabel={FILTER_CONFIG.department.getLabel}
                  getKey={FILTER_CONFIG.department.getKey}
                />
                <FilterSelect
                  id="agents-filter-city"
                  label={FILTER_CONFIG.city.label}
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  options={citiesLoader.data}
                  disabled={isLoading || !filters.department || citiesLoader.data.length === 0}
                  placeholder={FILTER_CONFIG.city.placeholder}
                  getValue={FILTER_CONFIG.city.getValue}
                  getLabel={FILTER_CONFIG.city.getLabel}
                  getKey={FILTER_CONFIG.city.getKey}
                />
                <FilterSelect
                  id="agents-filter-commune"
                  label={FILTER_CONFIG.commune.label}
                  value={filters.commune}
                  onChange={(e) => handleFilterChange("commune", e.target.value)}
                  options={communesLoader.data}
                  disabled={isLoading || !filters.city || communesLoader.data.length === 0}
                  placeholder={FILTER_CONFIG.commune.placeholder}
                  getValue={FILTER_CONFIG.commune.getValue}
                  getLabel={FILTER_CONFIG.commune.getLabel}
                  getKey={FILTER_CONFIG.commune.getKey}
                />
                <FilterSelect
                  id="agents-filter-quartier"
                  label={FILTER_CONFIG.quartier.label}
                  value={filters.quartier}
                  onChange={(e) => handleFilterChange("quartier", e.target.value)}
                  options={quartiersLoader.data}
                  disabled={isLoading || !filters.commune || quartiersLoader.data.length === 0}
                  placeholder={FILTER_CONFIG.quartier.placeholder}
                  getValue={FILTER_CONFIG.quartier.getValue}
                  getLabel={FILTER_CONFIG.quartier.getLabel}
                  getKey={FILTER_CONFIG.quartier.getKey}
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-1 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Fermer
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="bg-[#007F68] border-2 border-[#31B4A6] text-white px-4 py-1 rounded-lg font-medium hover:bg-[#02A285] transition-colors duration-200 text-sm"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <div className="relative w-full" style={{ height: "calc(100vh - 3.5rem)" }}>
        <div className="hidden md:block absolute inset-0">
          <MapContainer
            center={mapCenter}
            zoom={agentsWithCoords.length > 0 ? 12 : userLocation ? 13 : 6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapInstanceExposer mapRef={mapRef} />
            <MapControlsContainer onLocationUpdate={setUserLocation} />
            {bounds && (
              <MapBoundsUpdater
                bounds={bounds}
                agentsCount={agentsWithCoords.length}
                isHovering={!!hoveredAgent}
                lastZoomedAgent={lastZoomedAgentRef.current}
              />
            )}
            {agentsWithCoords.map((agent, index) => (
              <Marker
                key={`${agent.id}-${index}`}
                position={[agent.lat, agent.lng]}
                icon={hoveredAgent === agent.id ? highlightedMarkerIcon : markerIcon}
              >
                <Popup>
                  <div className="text-xs">
                    {(() => {
                      const { latText, lngText } = formatLatLng(agent.lat, agent.lng);
                      return (
                        <>
                          <div className="font-semibold">Latitude: {latText}</div>
                          <div className="text-gray-700">Longitude: {lngText}</div>
                        </>
                      );
                    })()}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right panel on desktop: list drawer */}
        <div
          className={cn(
            "hidden md:flex fixed top-14 right-0 bottom-0 w-[450px] bg-white shadow-2xl z-[9999] flex-col transition-transform",
            drawerOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
          )}
        >
          <div className="p-4 border-b border-gray-200">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {!error && (
              <div className="text-sm text-gray-700">
                Emplacements (latitude / longitude)
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {isLoading && (
              <div className="text-center py-12 text-gray-600">
                <Loader2 className="inline-block size-6 animate-spin" />
                <div className="mt-2">Chargement...</div>
              </div>
            )}

            {!isLoading && agents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun point de vente trouvé
              </div>
            )}

            {!isLoading && agents.length > 0 && (
              <>
                <div className="mb-4 px-2 text-sm text-gray-600">
                  {agents.length} {agents.length === 1 ? "point de vente trouvé" : "points de vente trouvés"}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {agents.map((agent, index) => {
                    const agentId = agent.codeAgence || agent.login || agent.telephone || `agent-${index}`;
                    const agentForMap = agentsWithCoords.find((a) => a.id === agentId) ?? {
                      ...agent,
                      id: agentId,
                      lat: parseFloat(agent.latitude || agent.lat),
                      lng: parseFloat(agent.longitude || agent.lng),
                    };
                    const { latText, lngText } = formatLatLng(agentForMap.lat, agentForMap.lng);
                    return (
                      <div
                        key={`agent-${agentId}-${index}`}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#007F68] transition-shadow duration-200"
                        onMouseEnter={() => {
                          setHoveredAgent(agentId);
                          if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
                          if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
                          try {
                            mapRef.current?.stop?.();
                            mapRef.current?._panAnim?.stop?.();
                            mapRef.current?._zoomAnim?.stop?.();
                          } catch {
                            // ignore
                          }
                          // Immediate fly (same as website behavior)
                          flyToAgent(agentForMap);
                        }}
                        onMouseLeave={() => {
                          if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
                          if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
                          // keep hoveredAgent until next hover (prevents bounds reset jitter)
                        }}
                      >
                        <div className="text-sm text-gray-900 font-semibold">
                          Latitude: <span className="font-mono">{latText}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          Longitude: <span className="font-mono">{lngText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile list only */}
        <div className="md:hidden relative z-10 bg-gray-50 p-4">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007F68]" />
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          )}
          {!isLoading && agents.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun point de vente trouvé</div>
          )}
          {!isLoading && agents.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {agents.map((agent, index) => {
                const agentId = agent.codeAgence || agent.login || agent.telephone || `agent-${index}`;
                const lat = parseFloat(agent.latitude || agent.lat);
                const lng = parseFloat(agent.longitude || agent.lng);
                const { latText, lngText } = formatLatLng(lat, lng);
                return (
                  <div
                    key={`agent-${agentId}-${index}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="text-sm text-gray-900 font-semibold">
                      Latitude: <span className="font-mono">{latText}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      Longitude: <span className="font-mono">{lngText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

