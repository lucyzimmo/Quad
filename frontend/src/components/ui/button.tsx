import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: string;
  style?: React.CSSProperties;
}

export function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  style,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`font-sans ${className}`}
      disabled={disabled}
      type={type}
      style={style}
    >
      {children}
    </button>
  );
}
