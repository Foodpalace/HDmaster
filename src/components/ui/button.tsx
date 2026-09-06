import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-opacity duration-150 disabled:opacity-40 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:opacity-90",
        secondary: "bg-elevated text-fg border border-border hover:bg-surface",
        ghost: "text-fg hover:bg-elevated",
        danger: "bg-danger text-fg hover:opacity-90",
        outline: "border border-border text-fg hover:bg-elevated",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[8px]",
        md: "h-10 px-4 text-sm rounded-[10px]",
        lg: "h-12 px-5 text-base rounded-[12px]",
        icon: "size-10 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
