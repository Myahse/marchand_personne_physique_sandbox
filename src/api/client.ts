import { config } from '../config';
import { getBaseUrl, getUseTokenForAll, getAdminUsername, getAdminPassword, getTokenPath } from '@/store/apiStore';

let adminToken: string | null = null;
/** Dernière réponse item de l'API token (userId, telephone, etc.) pour suggérer le compte crédit. */
let tokenResponseItem: Record<string, unknown> | null = null;

export function getAdminToken(): string | null {
  return adminToken;
}

export function setAdminToken(token: string | null): void {
  adminToken = token;
}

/** Retourne l'objet item de la dernière réponse token (userId, telephone, etc.) pour préremplir le compte crédit. */
export function getTokenResponseItem(): Record<string, unknown> | null {
  return tokenResponseItem;
}

/** Retourne le compte activité du marchand à partir de la dernière réponse token, si présent. */
export function getCompteActiviteFromToken(): string | null {
  if (!tokenResponseItem) return null;
  const candidates = [
    "compteActivite",
    "compte_activite",
    "compteActiviteMarchand",
    "compte_activite_marchand",
  ];
  for (const key of candidates) {
    const value = tokenResponseItem[key as keyof Record<string, unknown>];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

/** Génère le token admin (même endpoint que marchand_dart). path par défaut: /authclient/token */
export async function generateAdminToken(path?: string): Promise<string | null> {
  const baseUrl = getBaseUrl();
  const tokenPath = (path ?? "/authclient/token").trim();
  const resolvedPath = tokenPath.startsWith("http") ? tokenPath : `${baseUrl}${tokenPath.startsWith("/") ? tokenPath : `/${tokenPath}`}`;
  console.log("[PEYA] Token request:", { path: tokenPath, url: resolvedPath });
  const username = getAdminUsername();
  const password = getAdminPassword();
  if (!username || !password) {
    console.warn("[PEYA] Token request has empty credentials:", {
      hasUsername: !!username,
      hasPassword: !!password,
    });
  }
  const res = await fetch(resolvedPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const { parsed: data, text } = await readJsonWithText(res);
  if (!res.ok) {
    console.error("[PEYA] Token response not OK:", {
      url: resolvedPath,
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get("content-type"),
      preview: text.slice(0, 300),
    });
    throw new Error(`Token request failed (${res.status})`);
  }
  if (!data) {
    console.error("[PEYA] Token response is not JSON:", {
      url: resolvedPath,
      status: res.status,
      contentType: res.headers.get("content-type"),
      preview: text.slice(0, 300),
    });
    throw new Error("Token response is not JSON");
  }
  const item = (data as any)?.item ?? (data as any)?.data;
  if (item && typeof item === "object") tokenResponseItem = item as Record<string, unknown>;

  const token = extractToken(data);
  if (!token) {
    console.error("[PEYA] Token not found in response:", {
      url: resolvedPath,
      keys: Object.keys(data as any),
      hasError: (data as any)?.hasError,
      status: (data as any)?.status,
      itemType: item === null ? "null" : typeof item,
      itemKeys: item && typeof item === "object" ? Object.keys(item as any) : null,
      preview: text.slice(0, 300),
    });
    throw new Error("No token found in token response");
  }
  adminToken = token;
  return token;
}

function getNestedValue(obj: any, path: string): unknown {
  return path.split(".").reduce((cur, key) => (cur ? cur[key] : undefined), obj);
}

function extractToken(result: any): string | null {
  const TOKEN_FIELDS = [
    "item.token",
    "item.access_token",
    "data.token",
    "data.access_token",
    "token",
    "accessToken",
    "access_token",
    "data.data.token",
    "item.data.token",
  ];
  for (const field of TOKEN_FIELDS) {
    const v = getNestedValue(result, field);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/**
 * Read response body and try parsing JSON.
 * Returns both the parsed object (or null) and the raw text to help debugging
 * HTML / non-JSON responses without crashing the app.
 */
async function readJsonWithText(
  res: Response
): Promise<{ parsed: Record<string, unknown> | null; text: string }> {
  const text = await res.text();
  if (!text.trim()) return { parsed: null, text: "" };
  try {
    return { parsed: JSON.parse(text) as Record<string, unknown>, text };
  } catch {
    return { parsed: null, text };
  }
}

/** POST avec body { data: payload } et Bearer token (comme marchand_dart) */
export async function post<T = unknown>(
  path: string,
  payload: Record<string, unknown>,
  options?: { skipToken?: boolean }
): Promise<{ data: T; status: number }> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const useToken = getUseTokenForAll() && !options?.skipToken;
  if (useToken && !adminToken) await generateAdminToken(getTokenPath());
  console.log("[PEYA] POST:", { path, url, token: useToken && !!adminToken });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(useToken && adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: JSON.stringify({ data: payload }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const { parsed, text } = await readJsonWithText(res);
  const data =
    parsed ??
    ({
      status: res.status,
      ok: res.ok,
      message: res.statusText || (res.ok ? "Réponse vide" : "Erreur"),
      contentType: res.headers.get("content-type"),
      preview: text.slice(0, 300),
    } as any);
  console.log("[PEYA] POST response:", { url, status: res.status });
  return { data: data as T, status: res.status };
}

/** POST body brut (sans wrapper { data }) pour certains endpoints */
export async function postRaw<T = unknown>(
  path: string,
  payload: Record<string, unknown>,
  options?: { skipToken?: boolean; forceToken?: boolean }
): Promise<{ data: T; status: number }> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const useToken = (options?.forceToken ?? getUseTokenForAll()) && !options?.skipToken;
  if (useToken && !adminToken) await generateAdminToken(getTokenPath());
  console.log("[PEYA] POST (raw):", { path, url, token: useToken && !!adminToken });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(useToken && adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const { parsed, text } = await readJsonWithText(res);
  const data =
    parsed ??
    ({
      status: res.status,
      ok: res.ok,
      message: res.statusText || (res.ok ? "Réponse vide" : "Erreur"),
      contentType: res.headers.get("content-type"),
      preview: text.slice(0, 300),
    } as any);
  console.log("[PEYA] POST (raw) response:", { url, status: res.status });
  return { data: data as T, status: res.status };
}
