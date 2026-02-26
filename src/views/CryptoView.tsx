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

interface CryptoViewProps {
  cryptInput: string;
  setCryptInput: (v: string) => void;
  cryptResult: string | null;
  onCrypt: () => void;
  decryptInput: string;
  setDecryptInput: (v: string) => void;
  decryptResult: string | null;
  onDecrypt: () => void;
}

export function CryptoView({
  cryptInput,
  setCryptInput,
  cryptResult,
  onCrypt,
  decryptInput,
  setDecryptInput,
  decryptResult,
  onDecrypt,
}: CryptoViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiffrement / Déchiffrement (NCG)</CardTitle>
        <CardDescription>
          Chiffrer ou déchiffrer du texte via l’API NCG (djoganapayci.com)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] space-y-2">
            <Label htmlFor="crypt-input">Texte à chiffrer</Label>
            <Input
              id="crypt-input"
              placeholder="Texte clair"
              value={cryptInput}
              onChange={(e) => setCryptInput(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={onCrypt}>
            Chiffrer
          </Button>
        </div>
        <ResultBlock value={cryptResult} />
        <div className="flex flex-wrap items-end gap-4 pt-2">
          <div className="min-w-[200px] space-y-2">
            <Label htmlFor="decrypt-input">Texte à déchiffrer</Label>
            <Input
              id="decrypt-input"
              placeholder="Base64 chiffré"
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={onDecrypt}>
            Déchiffrer
          </Button>
        </div>
        <ResultBlock value={decryptResult} />
      </CardContent>
    </Card>
  );
}
