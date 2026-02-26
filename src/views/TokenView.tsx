import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResultBlock } from "@/components/ResultBlock";

interface TokenViewProps {
  result: { ok: boolean; token?: string; error?: string } | null;
  onGenerate: () => void;
  hasToken: boolean;
  loading?: boolean;
}

export function TokenView({
  result,
  onGenerate,
  hasToken,
  loading,
}: TokenViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token admin (authclient/token)</CardTitle>
        <CardDescription>
          Générer un token d’authentification admin. Utilisez « Utiliser pour
          tous les endpoints » dans la barre latérale pour l’appliquer à toutes
          les requêtes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? "Génération…" : "Générer le token"}
          </Button>
          {hasToken && (
            <span className="text-sm text-green-600 dark:text-green-500">
              Token en mémoire ✓
            </span>
          )}
        </div>
        {result && (
          <ResultBlock
            value={
              result.ok
                ? `Token: ${result.token?.slice(0, 40)}...`
                : `Erreur: ${result.error}`
            }
            isError={!result.ok}
          />
        )}
      </CardContent>
    </Card>
  );
}
