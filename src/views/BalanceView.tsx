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

interface BalanceViewProps {
  gsm: string;
  setGsm: (v: string) => void;
  pays: string;
  setPays: (v: string) => void;
  result: object | string | null;
  onFetch: () => void;
}

export function BalanceView({
  gsm,
  setGsm,
  pays,
  setPays,
  result,
  onFetch,
}: BalanceViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solde (wClients/solde)</CardTitle>
        <CardDescription>Consulter le solde d’un compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="solde-gsm">GSM / Compte principal</Label>
            <Input
              id="solde-gsm"
              placeholder="GSM ou compte"
              value={gsm}
              onChange={(e) => setGsm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solde-pays">Pays</Label>
            <Select
              id="solde-pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
            >
              <option value="CI">CI</option>
              <option value="SN">SN</option>
            </Select>
          </div>
          <Button onClick={onFetch}>Consulter le solde</Button>
        </div>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}
