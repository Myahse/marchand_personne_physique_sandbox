import { useState } from "react";
import { goeyToast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginViewProps {
  initialBaseUrl: string;
  initialUsername: string;
  initialPassword: string;
  onSubmit: (baseUrl: string, username: string, password: string) => Promise<boolean>;
  onSuccess: () => void;
}

export function LoginView({
  initialBaseUrl,
  initialUsername,
  initialPassword,
  onSubmit,
  onSuccess,
}: LoginViewProps) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await onSubmit(baseUrl.trim(), username.trim(), password.trim());
      if (ok) {
        goeyToast.success("Connexion réussie");
        onSuccess();
      } else {
        const msg = "Identifiants invalides ou pas de token dans la réponse. Vérifiez l’URL, le nom d’utilisateur et le mot de passe.";
        setError(msg);
        goeyToast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion. Vérifiez l’URL et le réseau.";
      setError(msg);
      goeyToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Sandbox Peya</CardTitle>
          <CardDescription>
            Connectez-vous avec vos identifiants admin pour accéder à la plateforme et tester les API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-base-url">Base URL API</Label>
              <Input
                id="login-base-url"
                type="url"
                placeholder="https://..."
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                required
                className="font-mono text-sm"
                autoComplete="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-username">Nom d’utilisateur admin</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe admin</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
