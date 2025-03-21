export const Avatar = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`w-12 h-12 rounded-full bg-gray-600 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

export const AvatarImage = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

import { ReactNode } from "react";

export const AvatarFallback = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-center w-full h-full bg-gray-500 text-white ${className}`}
    >
      {children}
    </div>
  );
};
