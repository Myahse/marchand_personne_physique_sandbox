import type { EndpointId } from "@/types/endpoints";

/**
 * Runtime API settings: base URL, admin credentials, endpoint path overrides, and token usage.
 * Persists to localStorage so the user can change them.
 */

const BASE_URL_KEY = "peya-sandbox-base-url";
const ADMIN_USERNAME_KEY = "peya-sandbox-admin-username";
const ADMIN_PASSWORD_KEY = "peya-sandbox-admin-password";
const ENDPOINT_PATHS_KEY = "peya-sandbox-endpoint-paths";

/** In-memory cache so the path is used immediately after set (no reliance on localStorage read). */
let endpointPathsCache: Record<string, string> | null = null;

let baseUrlOverride: string | null = null;
let adminUsernameOverride: string | null = null;
let adminPasswordOverride: string | null = null;
let useTokenForAll = true;

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://test1-pey-peya.djogana-pay.com";
const defaultAdminUsername = import.meta.env.VITE_APP_ADMIN_USERNAME ?? "";
const defaultAdminPassword = import.meta.env.VITE_APP_ADMIN_PASSWORD ?? "";

export function getBaseUrl(): string {
  if (typeof baseUrlOverride === "string" && baseUrlOverride.trim() !== "") {
    return baseUrlOverride.trim().replace(/\/$/, "");
  }
  try {
    const stored = localStorage.getItem(BASE_URL_KEY);
    if (stored && stored.trim() !== "") return stored.trim().replace(/\/$/, "");
  } catch {
    /* ignore */
  }
  return defaultBaseUrl;
}

export function setBaseUrl(url: string): void {
  const trimmed = url.trim().replace(/\/$/, "") || defaultBaseUrl;
  baseUrlOverride = trimmed;
  try {
    localStorage.setItem(BASE_URL_KEY, trimmed);
  } catch {
    /* ignore */
  }
}

export function getAdminUsername(): string {
  if (typeof adminUsernameOverride === "string") return adminUsernameOverride;
  try {
    const stored = localStorage.getItem(ADMIN_USERNAME_KEY);
    if (stored !== null) return stored;
  } catch {
    /* ignore */
  }
  return defaultAdminUsername;
}

export function setAdminUsername(value: string): void {
  adminUsernameOverride = value;
  try {
    localStorage.setItem(ADMIN_USERNAME_KEY, value);
  } catch {
    /* ignore */
  }
}

export function getAdminPassword(): string {
  if (typeof adminPasswordOverride === "string") return adminPasswordOverride;
  try {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (stored !== null) return stored;
  } catch {
    /* ignore */
  }
  return defaultAdminPassword;
}

export function setAdminPassword(value: string): void {
  adminPasswordOverride = value;
  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, value);
  } catch {
    /* ignore */
  }
}

export function getUseTokenForAll(): boolean {
  return useTokenForAll;
}

export function setUseTokenForAll(value: boolean): void {
  useTokenForAll = value;
}

export function getDefaultBaseUrl(): string {
  return defaultBaseUrl;
}

function getEndpointPathsMap(): Record<string, string> {
  if (endpointPathsCache !== null) return endpointPathsCache;
  try {
    const raw = localStorage.getItem(ENDPOINT_PATHS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === "object") {
        endpointPathsCache = parsed;
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  endpointPathsCache = {};
  return endpointPathsCache;
}

function setEndpointPathsMap(map: Record<string, string>): void {
  endpointPathsCache = { ...map };
  try {
    localStorage.setItem(ENDPOINT_PATHS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getEndpointPathOverride(id: EndpointId): string | null {
  const map = getEndpointPathsMap();
  const v = map[id];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export function setEndpointPathOverride(id: EndpointId, path: string): void {
  const map = getEndpointPathsMap();
  const trimmed = path.trim();
  if (trimmed === "") {
    delete map[id];
  } else {
    map[id] = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
  setEndpointPathsMap(map);
}

/** Path used for token generation (override or default). */
export function getTokenPath(): string {
  return getEndpointPathOverride("token") ?? "/authclient/token";
}
