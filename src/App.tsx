import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { goeyToast } from "goey-toast";
import { generateAdminToken, getAdminToken, setAdminToken, post, getCompteActiviteFromToken } from "./api/client";
import { encryptString } from "./api/crypto";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import type { EndpointId } from "@/types/endpoints";
import { ENDPOINT_LIST } from "@/types/endpoints";
import { cn } from "@/lib/utils";
import {
  getBaseUrl,
  getUseTokenForAll,
  getAdminUsername,
  getAdminPassword,
  setBaseUrl,
  setUseTokenForAll,
  setAdminUsername,
  setAdminPassword,
  getEndpointPathOverride,
  setEndpointPathOverride,
  getTokenPath,
} from "@/store/apiStore";
import { TokenView } from "@/views/TokenView";
import { OtpSendView } from "@/views/OtpSendView";
import { OtpVerifyView } from "@/views/OtpVerifyView";
import { SearchPayeurView } from "@/views/SearchPayeurView";
import { PaymentView } from "@/views/PaymentView";
import { LoginView } from "@/views/LoginView";
import { DocsPage } from "@/views/DocsPage";

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("225")) digits = digits.slice(3);
  return digits;
}

function getPathForEndpoint(id: EndpointId): string {
  const override = getEndpointPathOverride(id);
  if (override) return override;
  const defaultPath = ENDPOINT_LIST.find((e) => e.id === id)?.path;
  return defaultPath ?? "";
}

export default function App() {
  const location = useLocation();
  const [hasToken, setHasToken] = useState(() => !!getAdminToken());
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointId>("token");
  const [baseUrlInput, setBaseUrlInput] = useState(() => getBaseUrl());
  const [adminUsernameInput, setAdminUsernameInput] = useState(() =>
    getAdminUsername()
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState(() =>
    getAdminPassword()
  );
  const [useTokenForAll, setUseTokenForAllState] = useState(getUseTokenForAll);
  const [, setEndpointPathsVersion] = useState(0);

  useEffect(() => {
    setBaseUrlInput(getBaseUrl());
    setAdminUsernameInput(getAdminUsername());
    setAdminPasswordInput(getAdminPassword());
    setUseTokenForAllState(getUseTokenForAll());
  }, []);

  const handleBaseUrlBlur = () => {
    setBaseUrl(baseUrlInput);
    setBaseUrlInput(getBaseUrl());
  };

  const handleAdminUsernameBlur = () => {
    setAdminUsername(adminUsernameInput);
    setAdminUsernameInput(getAdminUsername());
  };

  const handleAdminPasswordBlur = () => {
    setAdminPassword(adminPasswordInput);
    setAdminPasswordInput(getAdminPassword());
  };

  const handleUseTokenForAllChange = (value: boolean) => {
    setUseTokenForAll(value);
    setUseTokenForAllState(value);
  };

  const handleLogin = async (
    baseUrl: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    setBaseUrl(baseUrl);
    setAdminUsername(username);
    setAdminPassword(password);
    const trimmedUsername = username.trim();
    const ECOLE_USERNAME = import.meta.env.VITE_ECOLE_USERNAME || "";
    setPayIsEcole(trimmedUsername === ECOLE_USERNAME);
    const path = getTokenPath();
    const token = await generateAdminToken(path);
    return !!token;
  };

  const handleLogout = () => {
    setAdminToken(null);
    setHasToken(false);
    goeyToast.success("Déconnecté");
  };

  const [tokenResult, setTokenResult] = useState<{
    ok: boolean;
    token?: string;
    error?: string;
  } | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const [codePhone, setCodePhone] = useState("");
  const [codeResult, setCodeResult] = useState<object | string | null>(null);

  const [verifCode, setVerifCode] = useState("");
  const [verifPhone, setVerifPhone] = useState("");
  const [verifResult, setVerifResult] = useState<object | string | null>(null);

  const [searchPayeurGsm, setSearchPayeurGsm] = useState("");
  const [searchPayeurPays, setSearchPayeurPays] = useState("CI");
  const [searchPayeurResult, setSearchPayeurResult] = useState<object | string | null>(null);

  const [payCompteDebit, setPayCompteDebit] = useState("");
  const [payCompteCredit, setPayCompteCredit] = useState("");
  /** Type of debit account: P = principal (phone), S = secondary, C = default. Sent as typeCompteDebit. */
  const [payDebitCompteType, setPayDebitCompteType] = useState<"P" | "S" | "C" | "">("C");
  const [payMontant, setPayMontant] = useState("");
  const [payLogin, setPayLogin] = useState("");
  const [payIsEcole, setPayIsEcole] = useState(false);
  const [payEtablissement, setPayEtablissement] = useState("");
  const [payMatricule, setPayMatricule] = useState("");
  const [payResult, setPayResult] = useState<object | string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToken = async () => {
    setTokenResult(null);
    setTokenLoading(true);
    try {
      const path = getPathForEndpoint("token") || "/authclient/token";
      const t = await generateAdminToken(path);
      const compte = getCompteActiviteFromToken();
      if (compte) {
        setPayCompteCredit(compte);
      }
      setTokenResult(
        t
          ? { ok: true, token: t }
          : { ok: false, error: "Pas de token dans la réponse" }
      );
    } catch (e) {
      setTokenResult({ ok: false, error: String(e) });
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCode = async () => {
    setCodeResult(null);
    const phone = normalizePhone(codePhone);
    if (!phone) {
      setCodeResult("Indiquez un numéro (10 chiffres).");
      return;
    }
    try {
      const { data } = await post(getPathForEndpoint("otp-send"), {
        gsmPrincipale: phone,
      });
      setCodeResult(data as object);
    } catch (e) {
      setCodeResult({ error: String(e) });
    }
  };

  const handleVerifCode = async () => {
    setVerifResult(null);
    const phone = normalizePhone(verifPhone);
    if (!verifCode.trim() || !phone) {
      setVerifResult("Code et numéro requis.");
      return;
    }
    try {
      const { data } = await post(getPathForEndpoint("otp-verify"), {
        codeValid: verifCode.trim(),
        login: phone,
      });
      setVerifResult(data as object);
    } catch (e) {
      setVerifResult({ error: String(e) });
    }
  };

  const handleSearchPayeur = async () => {
    setSearchPayeurResult(null);
    const normalized = normalizePhone(searchPayeurGsm.trim());
    if (!normalized) {
      setSearchPayeurResult("Téléphone (GSM) requis.");
      return;
    }
    try {
      const { data } = await post(getPathForEndpoint("search-client-by-phone"), {
        gsmPrincipale: normalized,
        codePaysResidence: searchPayeurPays.trim() || "CI",
      });
      setSearchPayeurResult(data as object);
    } catch (e) {
      setSearchPayeurResult({ error: String(e) });
    }
  };

  const handlePaiement = async () => {
    setPayResult(null);
    const debitValue = payCompteDebit.trim();
    if (
      !debitValue ||
      !payCompteCredit.trim() ||
      !payMontant.trim() ||
      !payLogin.trim()
    ) {
      setPayResult("Compte débit, compte crédit, montant et login requis.");
      return;
    }
    const montantNum = parseFloat(payMontant);
    if (isNaN(montantNum) || montantNum <= 0) {
      setPayResult("Montant invalide.");
      return;
    }
    const montantInt = Math.round(montantNum);
    const typeDebit = payDebitCompteType || "C";
    try {
      type InfoItem = {
        nom: string;
        label: string;
        type: string;
        ordre: number;
        obligatoire: boolean;
        montantMin: number | null;
        valeur: string | number | null;
        typeselection: string[] | null;
      };
      const infos: InfoItem[] = payIsEcole
        ? [
            {
              nom: "nom_etablissement",
              label: "Nom Etablissement",
              type: "select",
              ordre: 1,
              obligatoire: true,
              montantMin: null,
              valeur: payEtablissement.trim() || null,
              typeselection: ["Ecole 1", "Ecole 2", "Ecole 3"],
            },
            {
              nom: "num_matricule",
              label: "Numéro Matricule",
              type: "String",
              ordre: 2,
              obligatoire: true,
              montantMin: null,
              valeur: payMatricule.trim() || null,
              typeselection: null,
            },
            {
              nom: "montant",
              label: "Montant",
              type: "Number",
              ordre: 3,
              obligatoire: true,
              montantMin: null,
              valeur: montantInt,
              typeselection: null,
            },
          ]
        : [
            {
              nom: "montant",
              label: "Montant",
              type: "Number",
              ordre: 1,
              obligatoire: true,
              montantMin: null,
              valeur: montantInt,
              typeselection: null,
            },
          ];
      const { data } = await post(getPathForEndpoint("payment"), {
        compteDebit: debitValue,
        typeCompteDebit: typeDebit,
        compteCredit: payCompteCredit.trim(),
        montant: montantInt,
        login: payLogin.trim(),
        codeBanque: "DPAY",
        codeAgence: "11111",
        infos,
      });
      const raw = data as any;
      const item = raw?.item && typeof raw.item === "object" ? (raw.item as any) : null;
      if (item) {
        const {
          codeAgence,
          codeBanque,
          codeoperation,
          codeoperationbq,
          compteCommission,
          compteCredit,
          compteDebit,
          compteTaxe,
          cptCompFin,
          cptCompInit,
          dateoperation,
          numguichet,
        } = item;

        const displayItem: Record<string, unknown> = {
          codeAgence,
          codeBanque,
          codeoperation,
          codeoperationbq,
          compteCommission,
          compteCredit,
          compteDebit,
          compteTaxe,
          cptCompFin,
          cptCompInit,
          dateoperation,
        };

        setPayResult({
          status: raw.status,
          hasError: raw.hasError,
          item: displayItem,
          numguichet: typeof numguichet === "string" ? numguichet.trim() : null,
        } as object);
      } else {
        setPayResult(data as object);
      }
    } catch (e) {
      setPayResult({ error: String(e) });
    }
  };

  if (location.pathname === "/docs" || location.pathname === "/") {
    return <DocsPage />;
  }

  if (!hasToken) {
    return (
      <LoginView
        initialBaseUrl={getBaseUrl()}
        initialUsername={getAdminUsername()}
        initialPassword={getAdminPassword()}
        onSubmit={handleLogin}
        onSuccess={() => setHasToken(true)}
      />
    );
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay for sidebar */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Sidebar container: slide-in on mobile, static on desktop */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar text-sidebar-foreground shadow-lg transition-transform md:static md:z-0 md:translate-x-0 md:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <Sidebar
            onLogout={handleLogout}
            baseUrl={baseUrlInput}
            onBaseUrlChange={setBaseUrlInput}
            onBaseUrlBlur={handleBaseUrlBlur}
            adminUsername={adminUsernameInput}
            onAdminUsernameChange={setAdminUsernameInput}
            onAdminUsernameBlur={handleAdminUsernameBlur}
            adminPassword={adminPasswordInput}
            onAdminPasswordChange={setAdminPasswordInput}
            onAdminPasswordBlur={handleAdminPasswordBlur}
            useTokenForAll={useTokenForAll}
            onUseTokenForAllChange={handleUseTokenForAllChange}
            onGenerateToken={handleToken}
            hasToken={!!getAdminToken()}
            tokenLoading={tokenLoading}
            selectedEndpoint={selectedEndpoint}
            onSelectEndpoint={(id) => {
              setSelectedEndpoint(id);
              setIsSidebarOpen(false);
            }}
            getPathForEndpoint={getPathForEndpoint}
            onSaveEndpointPath={(id, path) => {
              setEndpointPathOverride(id, path);
              setEndpointPathsVersion((v) => v + 1);
            }}
          />
        </div>
      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          {selectedEndpoint === "token" && (
            <TokenView
              result={tokenResult}
              onGenerate={handleToken}
              hasToken={!!getAdminToken()}
              loading={tokenLoading}
            />
          )}
          {selectedEndpoint === "otp-send" && (
            <OtpSendView
              phone={codePhone}
              setPhone={setCodePhone}
              result={codeResult}
              onSend={handleCode}
            />
          )}
          {selectedEndpoint === "otp-verify" && (
            <OtpVerifyView
              code={verifCode}
              setCode={setVerifCode}
              phone={verifPhone}
              setPhone={setVerifPhone}
              result={verifResult}
              onVerify={handleVerifCode}
            />
          )}
          {selectedEndpoint === "search-client-by-phone" && (
            <SearchPayeurView
              gsm={searchPayeurGsm}
              setGsm={setSearchPayeurGsm}
              pays={searchPayeurPays}
              setPays={setSearchPayeurPays}
              result={searchPayeurResult}
              onSearch={handleSearchPayeur}
            />
          )}
          {selectedEndpoint === "payment" && (
            <PaymentView
              isEcole={payIsEcole}
              compteDebit={payCompteDebit}
              setCompteDebit={setPayCompteDebit}
              debitCompteType={payDebitCompteType}
              setDebitCompteType={setPayDebitCompteType}
              compteCredit={payCompteCredit}
              setCompteCredit={setPayCompteCredit}
              montant={payMontant}
              setMontant={setPayMontant}
              login={payLogin}
              setLogin={setPayLogin}
              etablissement={payEtablissement}
              setEtablissement={setPayEtablissement}
              matricule={payMatricule}
              setMatricule={setPayMatricule}
              result={payResult}
              onSubmit={handlePaiement}
            />
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
