/**
 * Configuration Sandbox Partenaires — mêmes valeurs que marchand_dart
 * Base URLs et endpoints identiques à l'app Flutter.
 */
export const config = {
  /** Base URL API Peya (test par défaut, comme marchand_dart) */
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://test1-pey-peya.djogana-pay.com',
  /** API de chiffrement/déchiffrement (NCG) — même que marchand_dart */
  cryptoBaseUrl: 'https://djoganapayci.com/api10/peya-2.0/ncg',
  /** Credentials admin pour /authclient/token (à mettre dans .env) */
  appAdminUsername: import.meta.env.VITE_APP_ADMIN_USERNAME || '',
  appAdminPassword: import.meta.env.VITE_APP_ADMIN_PASSWORD || '',
  requestTimeoutMs: 30_000,
} as const;
