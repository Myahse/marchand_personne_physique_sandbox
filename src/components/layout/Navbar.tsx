import { Link } from "react-router-dom";
import logo from "@/assets/photo_2026-02-17_16-00-19_photo_x2_2560x2560_2pass_moreDetail-Photoroom.png";
import { FileText } from "lucide-react";

export function Navbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="PEYA PAY"
          className="h-9 w-auto object-contain"
        />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Sandbox Partenaires
        </span>
      </div>
      <Link
        to="/docs"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <FileText className="size-4" />
        Documentation API
      </Link>
    </header>
  );
}
