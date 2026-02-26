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

interface TransferViewProps {
  gsm: string;
  setGsm: (v: string) => void;
  pays: string;
  setPays: (v: string) => void;
  montantEnvoye: string;
  setMontantEnvoye: (v: string) => void;
  montantRecu: string;
  setMontantRecu: (v: string) => void;
  mobileDest: string;
  setMobileDest: (v: string) => void;
  codeAgence: string;
  setCodeAgence: (v: string) => void;
  result: object | string | null;
  onSubmit: () => void;
}

export function TransferView({
  gsm,
  setGsm,
  pays,
  setPays,
  montantEnvoye,
  setMontantEnvoye,
  montantRecu,
  setMontantRecu,
  mobileDest,
  setMobileDest,
  codeAgence,
  setCodeAgence,
  result,
  onSubmit,
}: TransferViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfert client (wClients/transfertClient)</CardTitle>
        <CardDescription>
          Transférer un montant vers un destinataire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tr-gsm">GSM principal</Label>
            <Input
              id="tr-gsm"
              placeholder="07 12 34 56 78"
              value={gsm}
              onChange={(e) => setGsm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-pays">Pays</Label>
            <Select
              id="tr-pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
            >
              <option value="CI">CI</option>
              <option value="SN">SN</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-montant-envoye">Montant envoyé</Label>
            <Input
              id="tr-montant-envoye"
              placeholder="1000"
              value={montantEnvoye}
              onChange={(e) => setMontantEnvoye(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-montant-recu">Montant reçu</Label>
            <Input
              id="tr-montant-recu"
              placeholder="1000"
              value={montantRecu}
              onChange={(e) => setMontantRecu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-dest">Mobile destinataire</Label>
            <Input
              id="tr-dest"
              placeholder="07 98 76 54 32"
              value={mobileDest}
              onChange={(e) => setMobileDest(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-agence">Code agence</Label>
            <Input
              id="tr-agence"
              placeholder="11111"
              value={codeAgence}
              onChange={(e) => setCodeAgence(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={onSubmit}>Transférer</Button>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}
