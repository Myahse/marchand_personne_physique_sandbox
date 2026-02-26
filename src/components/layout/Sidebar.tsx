import { useState, useRef, useEffect } from "react";
import { Pencil, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EndpointId } from "@/types/endpoints";
import { ENDPOINT_LIST } from "@/types/endpoints";

interface SidebarProps {
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
  onBaseUrlBlur: () => void;
  adminUsername: string;
  onAdminUsernameChange: (v: string) => void;
  onAdminUsernameBlur: () => void;
  adminPassword: string;
  onAdminPasswordChange: (v: string) => void;
  onAdminPasswordBlur: () => void;
  useTokenForAll: boolean;
  onUseTokenForAllChange: (value: boolean) => void;
  onGenerateToken: () => void;
  hasToken: boolean;
  tokenLoading?: boolean;
  selectedEndpoint: EndpointId;
  onSelectEndpoint: (id: EndpointId) => void;
  getPathForEndpoint: (id: EndpointId) => string;
  onSaveEndpointPath: (id: EndpointId, path: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  baseUrl,
  onBaseUrlChange,
  onBaseUrlBlur,
  adminUsername,
  onAdminUsernameChange,
  onAdminUsernameBlur,
  adminPassword,
  onAdminPasswordChange,
  onAdminPasswordBlur,
  useTokenForAll,
  onUseTokenForAllChange,
  onGenerateToken,
  hasToken,
  tokenLoading,
  selectedEndpoint,
  onSelectEndpoint,
  getPathForEndpoint,
  onSaveEndpointPath,
  onLogout,
}: SidebarProps) {
  const [editingEndpointId, setEditingEndpointId] = useState<EndpointId | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingEndpointId !== null) {
      setEditingValue(getPathForEndpoint(editingEndpointId));
      editInputRef.current?.focus();
    }
  }, [editingEndpointId, getPathForEndpoint]);

  const handleStartEdit = (e: React.MouseEvent, id: EndpointId) => {
    e.stopPropagation();
    setEditingEndpointId(id);
  };

  const handleSaveEdit = () => {
    if (editingEndpointId !== null) {
      // Use current input value so we never save stale state (e.g. on blur before last keystroke)
      const value = (editInputRef.current?.value ?? editingValue).trim();
      onSaveEndpointPath(editingEndpointId, value);
      setEditingEndpointId(null);
    }
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex flex-col gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Sandbox Peya
          </h1>
          <p className="text-xs text-muted-foreground">
            API marchand_dart — testez les endpoints
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sidebar-base-url" className="text-xs">
            Base URL
          </Label>
          <Input
            id="sidebar-base-url"
            type="url"
            placeholder="https://..."
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            onBlur={onBaseUrlBlur}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sidebar-admin-username" className="text-xs">
            Admin (username)
          </Label>
          <Input
            id="sidebar-admin-username"
            type="text"
            placeholder="Nom d'utilisateur admin"
            value={adminUsername}
            onChange={(e) => onAdminUsernameChange(e.target.value)}
            onBlur={onAdminUsernameBlur}
            className="h-8 text-xs"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sidebar-admin-password" className="text-xs">
            Admin (mot de passe)
          </Label>
          <Input
            id="sidebar-admin-password"
            type="password"
            placeholder="Mot de passe admin"
            value={adminPassword}
            onChange={(e) => onAdminPasswordChange(e.target.value)}
            onBlur={onAdminPasswordBlur}
            className="h-8 text-xs"
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Token</span>
            {hasToken ? (
              <span className="text-xs text-green-600 dark:text-green-500">
                Défini ✓
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Non défini</span>
            )}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={onGenerateToken}
            disabled={tokenLoading}
          >
            {tokenLoading ? "Génération…" : "Générer le token"}
          </Button>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useTokenForAll}
              onChange={(e) => onUseTokenForAllChange(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <span>Utiliser pour tous les endpoints</span>
          </label>
        </div>
        </div>

        <nav className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-1">
          <Label className="px-1 text-xs text-muted-foreground">
            Endpoints
          </Label>
          {ENDPOINT_LIST.map(({ id, label, method, path: defaultPath }) => {
            const isEditing = editingEndpointId === id;
            const path = getPathForEndpoint(id);
            const showPencil = defaultPath !== undefined;
            return (
              <div
                key={id}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 transition-colors",
                  selectedEndpoint === id && !isEditing
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                <div className="flex w-full items-center gap-1">
                  <button
                    type="button"
                    onClick={() => !isEditing && onSelectEndpoint(id)}
                    className="min-w-0 flex-1 flex flex-col items-start gap-0.5 text-left"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    {isEditing ? (
                      <Input
                        ref={editInputRef}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") setEditingEndpointId(null);
                        }}
                        className="mt-1 h-7 text-xs font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                            method === "POST"
                              ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                              : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          )}
                        >
                          {method}
                        </span>
                        {showPencil && (
                          <span className="text-xs text-muted-foreground font-mono">{path || defaultPath}</span>
                        )}
                      </span>
                    )}
                  </button>
                  {showPencil && !isEditing && (
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(e, id)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      title="Modifier le chemin"
                      aria-label="Modifier le chemin"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-4 shrink-0 border-t border-border pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground hover:text-sidebar-foreground"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </aside>
  );
}
