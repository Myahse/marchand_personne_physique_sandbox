export type EndpointId =
  | "token"
  | "otp-send"
  | "otp-verify"
  | "search-client-by-phone"
  | "payment"
  | "mouvement-compte";

export type HttpMethod = "GET" | "POST";

export const ENDPOINT_LIST: {
  id: EndpointId;
  label: string;
  method: HttpMethod;
  path?: string;
}[] = [
  { id: "token", label: "Token admin", method: "POST", path: "/authclient/token" },
  { id: "otp-send", label: "Envoi code OTP", method: "POST", path: "/wClients/code-partenaire" },
  { id: "otp-verify", label: "Vérif. code OTP", method: "POST", path: "/wClients/verifcode-partenaire" },
  { id: "search-client-by-phone", label: "Recherche payeur", method: "POST", path: "/wClients/recherchePayeur" },
  { id: "payment", label: "Paiement", method: "POST", path: "/paiement-partenaire/create" },
  {
    id: "mouvement-compte",
    label: "Mouvement de compte",
    method: "POST",
    path: "/vMvtopMvtc/mvtsComptes-partenaire",
  },
];
