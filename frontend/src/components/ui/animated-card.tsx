import { cn } from "../../lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  float?: boolean;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  glow = false,
  float = false,
  ...props
}: AnimatedCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg p-6 shadow-lg transition-all duration-300",

        glow && "animate-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
