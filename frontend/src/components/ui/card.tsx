// Code: Component for card
export const Card = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-4 border-b border-gray-700 ${className}`}>{children}</div>
);

export const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2 className={`text-lg font-bold text-white ${className}`}>{children}</h2>
);

export const CardDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`text-sm text-gray-400 ${className}`}>{children}</p>;

export const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-4 ${className}`}>{children}</div>;

export const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-4 border-t border-gray-700 ${className}`}>{children}</div>
);
