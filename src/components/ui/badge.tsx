import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  default: "bg-elevated text-muted border-border",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  primary: "bg-primary text-primary-fg border-transparent",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide",
        tones[tone] ?? tones.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (["ACTIVE", "ONLINE", "DELIVERED", "RESOLVED", "VERIFIED", "PAID", "ON"].includes(s)) return "success";
  if (["DELAYED", "PENDING", "WAITING", "PAUSED", "UNDER_REVIEW", "BUSY"].includes(s)) return "warning";
  if (["CANCELLED", "SUSPENDED", "FAILED", "CRITICAL", "REFUNDED", "OFF"].includes(s)) return "danger";
  if (["PREPARING", "READY", "ASSIGNED", "IN_PROGRESS"].includes(s)) return "info";
  return "default";
}
