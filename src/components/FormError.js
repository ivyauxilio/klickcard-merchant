export default function FormError({ message }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}
