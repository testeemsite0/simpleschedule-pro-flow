
import { Check, AlertTriangle, HelpCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-gray-50 text-gray-600 ring-gray-500/10",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        error: "bg-red-50 text-red-700 ring-red-600/10",
        info: "bg-blue-50 text-blue-700 ring-blue-700/10",
        limit: "bg-purple-50 text-purple-700 ring-purple-700/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  icon?: boolean;
}

const StatusIndicator = ({
  className,
  variant,
  icon = true,
  children,
  ...props
}: StatusIndicatorProps) => {
  return (
    <span
      className={cn(statusIndicatorVariants({ variant }), className)}
      {...props}
    >
      {icon && variant && (
        <span className="mr-1">
          {variant === "success" && <Check className="h-3 w-3" />}
          {variant === "warning" || variant === "error" || variant === "limit" ? (
            <AlertTriangle className="h-3 w-3" />
          ) : null}
          {(variant === "info" || variant === "default") && (
            <HelpCircle className="h-3 w-3" />
          )}
        </span>
      )}
      {children}
    </span>
  );
};

export { StatusIndicator };
