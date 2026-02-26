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

interface OtpSendViewProps {
  phone: string;
  setPhone: (v: string) => void;
  result: object | string | null;
  onSend: () => void;
}

export function OtpSendView({
  phone,
  setPhone,
  result,
  onSend,
}: OtpSendViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoi code OTP (wClients/code-partenaire)</CardTitle>
        <CardDescription>Envoyer un code OTP au numéro indiqué — endpoint partenaire</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="code-phone">Téléphone (10 chiffres)</Label>
            <Input
              id="code-phone"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button onClick={onSend}>Envoyer le code</Button>
        </div>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}
