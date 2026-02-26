import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ResultBlock } from "@/components/ResultBlock";

const ETABLISSEMENT_OPTIONS = ["", "Ecole 1", "Ecole 2", "Ecole 3"];

/** Type of debit account from API: P = principal (phone-style), S = secondary, etc. */
export type DebitCompteType = "P" | "S" | "C" | "";

export interface PaymentViewProps {
  isEcole: boolean;
  compteDebit: string;
  setCompteDebit: (v: string) => void;
  debitCompteType: DebitCompteType;
  setDebitCompteType: (v: DebitCompteType) => void;
  compteCredit: string;
  setCompteCredit: (v: string) => void;
  montant: string;
  setMontant: (v: string) => void;
  login: string;
  setLogin: (v: string) => void;
  etablissement: string;
  setEtablissement: (v: string) => void;
  matricule: string;
  setMatricule: (v: string) => void;
  result: object | string | null;
  onSubmit: () => void;
}

export function PaymentView({
  isEcole,
  compteDebit,
  setCompteDebit,
  debitCompteType,
  setDebitCompteType,
  compteCredit,
  setCompteCredit,
  montant,
  setMontant,
  login,
  setLogin,
  etablissement,
  setEtablissement,
  matricule,
  setMatricule,
  result,
  onSubmit,
}: PaymentViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement (paiement-partenaire/create)</CardTitle>
        <CardDescription>
          Créer un paiement entre comptes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isEcole && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pay-etablissement">Nom établissement (select)</Label>
                <Select
                  id="pay-etablissement"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                >
                  {ETABLISSEMENT_OPTIONS.map((opt) => (
                    <option key={opt || "vide"} value={opt}>
                      {opt || "— Aucun —"}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-matricule">Numéro matricule</Label>
                <Input
                  id="pay-matricule"
                  placeholder="Numéro matricule"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="pay-debit">Compte débit (client)</Label>
            <Input
              id="pay-debit"
              placeholder="Compte à débiter"
              value={compteDebit}
              onChange={(e) => {
                const v = e.target.value;
                setCompteDebit(v);
                const digits = v.replace(/\D/g, "");
                if (digits.length === 10) setDebitCompteType("P");
              }}
              onBlur={() => {
                const digits = compteDebit.replace(/\D/g, "");
                if (digits.length === 10) setDebitCompteType("P");
              }}
            />
            {compteDebit && debitCompteType && (
              <span className="text-xs text-muted-foreground">
                Type envoyé : {debitCompteType}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-credit">Compte crédit (marchand)</Label>
            <Input
              id="pay-credit"
              placeholder="Compte activité (API#1)"
              value={compteCredit}
              onChange={(e) => setCompteCredit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-montant">Montant</Label>
            <Input
              id="pay-montant"
              placeholder="Montant"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-login">Login</Label>
            <Input
              id="pay-login"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-banque">Code banque</Label>
            <Input
              id="pay-banque"
              placeholder="DPAY"
              value="DPAY"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-agence">Code agence</Label>
            <Input
              id="pay-agence"
              placeholder="11111"
              value="11111"
              readOnly
            />
          </div>
        </div>
        <Button onClick={onSubmit}>Créer paiement</Button>
        <ResultBlock
          value={result}
          isError={
            result != null &&
            typeof result === "object" &&
            ((result as { hasError?: boolean }).hasError === true ||
              JSON.stringify(result).toLowerCase().includes("solde insuffisant"))
          }
        />
      </CardContent>
    </Card>
  );
}
