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

const PAYS_OPTIONS = [
  { value: "CI", label: "CI" },
  { value: "SN", label: "SN" },
  { value: "ML", label: "ML" },
];

interface SearchPayeurViewProps {
  gsm: string;
  setGsm: (v: string) => void;
  pays: string;
  setPays: (v: string) => void;
  result: object | string | null;
  onSearch: () => void;
}

export function SearchPayeurView({
  gsm,
  setGsm,
  pays,
  setPays,
  result,
  onSearch,
}: SearchPayeurViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche payeur (wClients/recherchePayeur)</CardTitle>
        <CardDescription>
          Rechercher un client payeur par numéro de téléphone (GSM).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-payeur-gsm">Téléphone (GSM)</Label>
            <Input
              id="search-payeur-gsm"
              placeholder="Téléphone"
              value={gsm}
              onChange={(e) => setGsm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-payeur-pays">Pays</Label>
            <Select
              id="search-payeur-pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
            >
              {PAYS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={onSearch}>Rechercher</Button>
        </div>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}
