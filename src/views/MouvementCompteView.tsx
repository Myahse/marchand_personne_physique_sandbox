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

interface MouvementCompteViewProps {
  compte: string;
  setCompte: (v: string) => void;
  dateStart: string;
  setDateStart: (v: string) => void;
  dateEnd: string;
  setDateEnd: (v: string) => void;
  result: object | string | null;
  onSubmit: () => void;
}

export function MouvementCompteView({
  compte,
  setCompte,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  result,
  onSubmit,
}: MouvementCompteViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mouvements de compte (mvtsComptes-partenaire)</CardTitle>
        <CardDescription>
          Consulter les mouvements d’un compte sur une période.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mvt-compte">Numéro de compte complet</Label>
            <Input
              id="mvt-compte"
              placeholder="numerocomptecomplet"
              value={compte}
              onChange={(e) => setCompte(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mvt-date-start">Date de début</Label>
            <Input
              id="mvt-date-start"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mvt-date-end">Date de fin</Label>
            <Input
              id="mvt-date-end"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={onSubmit}>Chercher les mouvements</Button>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}

