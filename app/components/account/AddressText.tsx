import {
  useStorefront,
  useCustomerQuery,
  customerCacheKey,
} from "@orunelle/theme-sdk";
import type { Address } from "@orunelle/theme-sdk/commerce";
import { loadGeography } from "../../lib/geography";

export function AddressText({ address }: { address: Address }) {
  const context = useStorefront();
  const provinces = useCustomerQuery(
    [...customerCacheKey(context, "governorates"), context.locale],
    () => loadGeography("governorates", context.locale),
  );
  const cities = useCustomerQuery(
    [
      ...customerCacheKey(context, "cities"),
      context.locale,
      address.governorate,
    ],
    () => loadGeography("cities", context.locale, address.governorate),
    !!address.governorate,
  );
  const governorate =
    provinces.data?.find((p) => p.value === address.governorate)?.name ??
    address.governorate;
  const city =
    cities.data?.find((c) => c.value === address.city)?.name ?? address.city;
  return (
    <p>
      {address.recipientName}
      <br />
      {[address.building, address.street, address.district]
        .filter(Boolean)
        .join(" · ")}
      <br />
      {[city, governorate].filter(Boolean).join(" · ")}
      <br />
      <span dir="ltr">{address.phone}</span>
    </p>
  );
}
