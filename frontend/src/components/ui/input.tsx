export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
