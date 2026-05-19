export function ErrorMessage({ message }: { message: string }) {
  return <p className="text-sm text-red-600">{message}</p>;
}
