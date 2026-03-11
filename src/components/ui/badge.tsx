import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
  className?: string;
  style?: React.CSSProperties;
}

const variants = {
  default: "bg-indigo-100 text-indigo-700",
  secondary: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  outline: "border border-gray-200 text-gray-600",
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
