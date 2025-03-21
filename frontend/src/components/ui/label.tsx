import { ReactNode } from "react";

export const Label = ({
  children,
  htmlFor,
  className = "",
}: {
  children: ReactNode;
  htmlFor: string;
  className?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-300 ${className}`}
    >
      {children}
    </label>
  );
};
