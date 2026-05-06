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
import { ResultBlock } from "@/components/ResultBlock";

interface SoldePartenaireViewProps {
  compte: string;
  setCompte: (v: string) => void;
  gsmPrincipale: string;
  setGsmPrincipale: (v: string) => void;
  result: object | string | null;
  onFetch: () => void;
}

export function SoldePartenaireView({
  compte,
  setCompte,
  gsmPrincipale,
  setGsmPrincipale,
  result,
  onFetch,
}: SoldePartenaireViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solde partenaire (wClients/soldePartenaire)</CardTitle>
        <CardDescription>Consulter le solde d’un compte via login partenaire</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="solde-partenaire-compte">Compte</Label>
            <Input
              id="solde-partenaire-compte"
              name="compte"
              placeholder="Numéro de compte (téléphone)"
              value={compte}
              onChange={(e) => setCompte(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solde-partenaire-gsm">GSM principale (login)</Label>
            <Input
              id="solde-partenaire-gsm"
              name="gsmPrincipale"
              placeholder="Login / GSM principale"
              value={gsmPrincipale}
              onChange={(e) => setGsmPrincipale(e.target.value)}
              autoComplete="username"
            />
          </div>
          <Button onClick={onFetch}>Consulter le solde</Button>
        </div>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}

