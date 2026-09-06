import { cn, formatInrExact, formatNumber } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useState, type ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint,
  tone,
  source,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "danger" | "success" | "warning";
  source?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
        {source ? (
          <Badge tone={source === "SIMULATED" ? "warning" : source === "ESTIMATE" || source === "MODEL" ? "info" : "default"}>
            {source}
          </Badge>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-2xl tabular",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function money(paise: number | null | undefined) {
  if (paise == null) return "—";
  return formatInrExact(paise);
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[24px] border border-border bg-surface p-4 sm:p-5", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function DataTable({
  columns,
  rows,
  onRow,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, ReactNode>[];
  onRow?: (row: Record<string, ReactNode>) => void;
}) {
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-muted">Nothing to show.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-2 py-2 font-medium", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRow?.(row)}
              className={cn("border-b border-border/60", onRow && "cursor-pointer hover:bg-elevated")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-2 py-2.5 align-middle", c.className)}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={statusTone(value)}>{value.replaceAll("_", " ")}</Badge>;
}

export function ConfirmBar({
  title,
  onConfirm,
  busy,
}: {
  title: string;
  onConfirm: (reason: string) => void;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        {title}
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-elevated p-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label>Reason (required)</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why this action?" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={reason.trim().length < 3 || busy}
          onClick={() => onConfirm(reason.trim())}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Filter"}
      className="max-w-sm"
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export { Textarea, formatNumber };
