import { notFound } from "@tanstack/react-router";
export function pageSearch(input: Record<string, unknown>) {
  const page = input.page === undefined ? 1 : Number(input.page);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10000 ||
    (input.q !== undefined &&
      (typeof input.q !== "string" || input.q.length > 200))
  )
    throw notFound();
  return {
    ...(input.page !== undefined ? { page } : {}),
    ...(typeof input.q === "string" ? { q: input.q } : {}),
  };
}
