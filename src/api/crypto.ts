import { config } from '../config';

/** Chiffrement via l’API NCG (même URL que marchand_dart) */
export async function encryptString(plainText: string): Promise<string | null> {
  if (!plainText?.trim()) return null;
  const res = await fetch(`${config.cryptoBaseUrl}/crypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data: { string: plainText } }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const data = await res.json();
  if (data?.hasError === true) return null;
  const encrypted =
    data?.item?.string ?? data?.data?.string ?? data?.string ?? null;
  return encrypted ? String(encrypted) : null;
}

/** Déchiffrement via l’API NCG (même URL que marchand_dart) */
export async function decryptString(encryptedText: string): Promise<string | null> {
  if (!encryptedText?.trim()) return null;
  if (encryptedText.startsWith('DPAY') || !/^[A-Za-z0-9+/]+=*$/.test(encryptedText)) {
    return encryptedText;
  }
  const res = await fetch(`${config.cryptoBaseUrl}/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data: { string: encryptedText } }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const data = await res.json();
  if (data?.hasError === true) return null;
  const decrypted =
    data?.data?.string ?? data?.item?.string ?? data?.string ?? null;
  return decrypted ? String(decrypted) : null;
}
