const photoNames = [
  "living-chair",
  "living-sofa",
  "play-room",
  "bedroom",
  "collection",
  "sofa",
  "storage",
];

export function Photo({
  value,
  label,
  className = "",
}: {
  value: unknown;
  label: string;
  className?: string;
}) {
  const name =
    String(value ?? "")
      .split("/")
      .pop()
      ?.replace(/\.jpg$/, "") ?? "";
  return (
    <div
      role="img"
      aria-label={label}
      className={`metropolitan-photo ${photoNames.includes(name) ? "metropolitan-photo-" + name : "metropolitan-photo-empty"} ${className}`}
    />
  );
}
