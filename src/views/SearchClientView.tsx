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

interface SearchClientViewProps {
  code: string;
  setCode: (v: string) => void;
  pays: string;
  setPays: (v: string) => void;
  result: object | string | null;
  onSearch: () => void;
}

export function SearchClientView({
  code,
  setCode,
  pays,
  setPays,
  result,
  onSearch,
}: SearchClientViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche client (wClients/rechercheclient)</CardTitle>
        <CardDescription>
          Rechercher un client par code ou compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-code">Code client</Label>
            <Input
              id="search-code"
              placeholder="Code ou numéro compte"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-pays">Pays</Label>
            <Select
              id="search-pays"
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
