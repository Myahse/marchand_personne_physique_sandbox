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
  const res = await fetch(resolvedPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const data = await safeParseJson(res);
  const item = (data as any)?.item ?? (data as any)?.data;
  if (item && typeof item === "object") tokenResponseItem = item as Record<string, unknown>;
  const token =
    (item as any)?.token ??
    (item as any)?.access_token ??
    (data as any)?.token ??
    (data as any)?.access_token ??
    (data as any)?.data?.token ??
    null;
  if (token) adminToken = token;
  return token;
}

/** Parse response as JSON; return null if empty or invalid (avoids SyntaxError). */
async function safeParseJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
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
  const parsed = await safeParseJson(res);
  const data = parsed ?? { status: res.status, ok: res.ok, message: res.statusText || (res.ok ? 'Réponse vide' : 'Erreur') };
  console.log("[PEYA] POST response:", { url, status: res.status });
  return { data: data as T, status: res.status };
}

/** POST body brut (sans wrapper { data }) pour certains endpoints */
export async function postRaw<T = unknown>(
  path: string,
  payload: Record<string, unknown>
): Promise<{ data: T; status: number }> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const useToken = getUseTokenForAll();
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
  const parsed = await safeParseJson(res);
  const data = parsed ?? { status: res.status, ok: res.ok, message: res.statusText || (res.ok ? 'Réponse vide' : 'Erreur') };
  console.log("[PEYA] POST (raw) response:", { url, status: res.status });
  return { data: data as T, status: res.status };
}
