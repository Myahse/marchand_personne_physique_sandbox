interface ResultBlockProps {
  value: string | object | null;
  isError?: boolean;
}

export function ResultBlock({ value, isError }: ResultBlockProps) {
  if (value === null) return null;
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <pre
      className={
        "mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-muted/50 p-3 text-sm " +
        (isError ? "text-destructive" : "text-foreground")
      }
    >
      {text}
    </pre>
  );
}
