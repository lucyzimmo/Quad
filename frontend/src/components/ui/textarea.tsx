export const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
