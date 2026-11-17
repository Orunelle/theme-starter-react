export type GeographyOption = { value: string; name: string };
export async function loadGeography(
  kind: "governorates" | "cities",
  locale: string,
  governorate = "",
): Promise<GeographyOption[]> {
  const params = new URLSearchParams({ locale, country: "EG" });
  if (kind === "cities") params.set("governorate", governorate);
  const response = await fetch(`/__commerce/geo/${kind}?${params}`, {
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
  });
  const result: unknown = await response.json();
  if (
    !response.ok ||
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true ||
    !("data" in result) ||
    !Array.isArray(result.data)
  )
    throw new Error("Geography unavailable");
  return result.data.map((entry: unknown) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("name" in entry) ||
      typeof entry.name !== "string"
    )
      throw new Error("Invalid geography");
    const value =
      "code" in entry ? entry.code : "id" in entry ? entry.id : undefined;
    if (typeof value !== "string" || !value)
      throw new Error("Invalid geography code");
    return { value, name: entry.name };
  });
}
