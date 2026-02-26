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

interface OtpVerifyViewProps {
  code: string;
  setCode: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  result: object | string | null;
  onVerify: () => void;
}

export function OtpVerifyView({
  code,
  setCode,
  phone,
  setPhone,
  result,
  onVerify,
}: OtpVerifyViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification code OTP (wClients/verifcode-partenaire)</CardTitle>
        <CardDescription>Vérifier le code reçu par SMS — endpoint partenaire</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="verif-code">Code reçu</Label>
            <Input
              id="verif-code"
              placeholder="Code OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verif-phone">Téléphone</Label>
            <Input
              id="verif-phone"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button onClick={onVerify}>Vérifier le code</Button>
        </div>
        <ResultBlock value={result} />
      </CardContent>
    </Card>
  );
}
