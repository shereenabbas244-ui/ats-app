import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
  className?: string;
  style?: React.CSSProperties;
}

const variants = {
  default: "bg-indigo-500/20 text-indigo-300",
  secondary: "bg-theme-subtle2 text-theme-text60",
  success: "bg-green-500/20 text-green-300",
  warning: "bg-amber-500/20 text-amber-300",
  danger: "bg-red-500/20 text-red-300",
  outline: "border border-white/20 text-theme-text60",
};

export function Badge({ children, variant = "default", className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
