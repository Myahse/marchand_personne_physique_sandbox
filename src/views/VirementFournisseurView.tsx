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

export interface VirementFournisseurViewProps {
  compteDebit: string;
  setCompteDebit: (v: string) => void;
  compteCredit: string;
  setCompteCredit: (v: string) => void;
  login: string;
  setLogin: (v: string) => void;
  montant: string;
  setMontant: (v: string) => void;
  motif: string;
  setMotif: (v: string) => void;
  result: object | string | null;
  onSubmit: () => void;
}

export function VirementFournisseurView({
  compteDebit,
  setCompteDebit,
  compteCredit,
  setCompteCredit,
  login,
  setLogin,
  montant,
  setMontant,
  motif,
  setMotif,
  result,
  onSubmit,
}: VirementFournisseurViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Virement fournisseur (wVirement/create)</CardTitle>
        <CardDescription>Payer un fournisseur par virement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vir-debit">Compte débit</Label>
            <Input
              id="vir-debit"
              placeholder="0748513076"
              value={compteDebit}
              onChange={(e) => setCompteDebit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vir-credit">Compte crédit (fournisseur)</Label>
            <Input
              id="vir-credit"
              placeholder="DPAY..."
              value={compteCredit}
              onChange={(e) => setCompteCredit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vir-login">Login</Label>
            <Input
              id="vir-login"
              placeholder="0748513076"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vir-montant">Montant</Label>
            <Input
              id="vir-montant"
              placeholder="1000"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vir-motif">Motif (optionnel)</Label>
            <Input
              id="vir-motif"
              placeholder="test"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={onSubmit}>Créer virement</Button>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}

