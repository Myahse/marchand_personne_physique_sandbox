import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, Loader2, Menu } from "lucide-react";
import logo from "@/assets/photo_2026-02-17_16-00-19_photo_x2_2560x2560_2pass_moreDetail-Photoroom.png";
import { buildToc } from "@/lib/slugify";
import { cn } from "@/lib/utils";

const DOC_URL = "/docs/API_PEYA_PAY.md";

export function DocsPage() {
  const [md, setMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(DOC_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setMd)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toc = md ? buildToc(md) : [];

  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Top bar — same style as GeniusPay docs */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTocOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Ouvrir le sommaire"
          >
            <Menu className="size-5" />
          </button>
          <img
            src={logo}
            alt="PEYA PAY"
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Documentation API — PEYA PAY
          </span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Sandbox
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay for table of contents */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
            isTocOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsTocOpen(false)}
        />
        {/* Left sidebar — table of contents */}
        <aside
          className={cn(
            "flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-background py-6 pl-6 pr-4 transition-transform md:static md:z-0 md:translate-x-0",
            "fixed inset-y-0 left-0 z-50 shadow-lg md:relative md:shadow-none",
            isTocOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="sticky top-6 min-h-0 space-y-0.5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sommaire
            </p>
            <ul className="space-y-0.5">
              {toc.map(({ level, title, id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    title={title}
                    className={`
                      block rounded-md border-l-2 border-transparent py-1.5 pr-2 text-[13px] leading-snug transition-colors
                      hover:border-primary/40 hover:bg-muted/60 hover:text-foreground
                      ${level === 2
                        ? "border-l-primary/60 pl-3 font-medium text-foreground"
                        : "pl-5 text-muted-foreground"}
                    `}
                  >
                    <span className="break-words">{title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Chargement…
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                Impossible de charger la documentation ({error}). Vérifiez que le fichier{" "}
                <code className="rounded bg-muted px-1">{DOC_URL}</code> est bien servi.
              </div>
            )}
            {md && !error && (
              <article className="docs-content max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                  {md}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
