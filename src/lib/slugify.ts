/**
 * Slugify heading text to match rehype-slug (github-slugger) for anchor links.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

/** Build TOC from markdown: extract ## and ###, return { level, title, id } with unique ids */
export function buildToc(md: string): { level: number; title: string; id: string }[] {
  const lines = md.split("\n");
  const toc: { level: number; title: string; id: string }[] = [];
  const idCount = new Map<string, number>();

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const title = (h2?.[1] ?? h3?.[1] ?? "").trim();
    if (!title) continue;

    const level = h2 ? 2 : 3;
    let baseId = slugify(title);
    if (!baseId) continue;

    const count = idCount.get(baseId) ?? 0;
    idCount.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count}`;
    toc.push({ level, title, id });
  }
  return toc;
}
