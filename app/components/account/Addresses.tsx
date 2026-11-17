import { useState } from "react";
import {
  useStorefront,
  useCommerce,
  useCustomerQuery,
  customerCacheKey,
} from "@orunelle/theme-sdk";
import type { Address, AddressInput } from "@orunelle/theme-sdk/commerce";
import {
  useCopy,
  useAction,
  Failure,
  Field,
  values,
  val,
} from "../common/commerce";
import { AddressText } from "./AddressText";
import { loadGeography } from "../../lib/geography";

function AddressForm({
  current,
  done,
}: {
  current?: Address;
  done: () => Promise<void>;
}) {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const [governorate, setGovernorate] = useState(current?.governorate ?? ""),
    [city, setCity] = useState(current?.city ?? "");
  const provinces = useCustomerQuery(
    [...customerCacheKey(context, "governorates"), context.locale],
    () => loadGeography("governorates", context.locale),
  );
  const cities = useCustomerQuery(
    [...customerCacheKey(context, "cities"), context.locale, governorate],
    () => loadGeography("cities", context.locale, governorate),
    !!governorate,
  );
  const validLocation =
    provinces.data?.some((p) => p.value === governorate) &&
    cities.data?.some((c) => c.value === city);
  const fields: [keyof AddressInput, string, string, boolean][] = [
    ["recipientName", "Recipient name", "اسم المستلم", true],
    ["phone", "Phone", "الهاتف", true],
    ["district", "District", "المنطقة", false],
    ["street", "Street", "الشارع", true],
    ["building", "Building", "المبنى", true],
    ["floor", "Floor", "الطابق", false],
    ["apartment", "Apartment", "الشقة", false],
    ["landmark", "Landmark", "علامة مميزة", false],
    ["postalCode", "Postal code", "الرمز البريدي", false],
  ];
  return (
    <form
      className="store-form metropolitan-address-form"
      method="post"
      onSubmit={(event) => {
        const data = values(event);
        if (!validLocation) return;
        void action.run(async () => {
          const input = Object.fromEntries(
            fields.map(([key]) => [key, val(data, key).trim()]),
          ) as Omit<
            AddressInput,
            "country" | "isDefault" | "label" | "governorate" | "city"
          >;
          const payload: AddressInput = {
            ...input,
            label: val(data, "label"),
            country: "EG",
            governorate,
            city,
            isDefault: data.get("isDefault") === "on",
          };
          if (current)
            await session.client.addresses.update(current.id, payload);
          else await session.client.addresses.add(payload);
          action.setNotice(t("Address saved.", "تم حفظ العنوان."));
          await done();
        });
      }}
    >
      <label className="form-field">
        <span>{t("Address label", "اسم العنوان")}</span>
        <select name="label" required defaultValue={current?.label ?? "Home"}>
          {[
            ...new Set([
              "Home",
              "Work",
              "Other",
              ...(current?.label ? [current.label] : []),
            ]),
          ].map((label) => (
            <option key={label} value={label}>
              {label === "Home"
                ? t("Home", "المنزل")
                : label === "Work"
                  ? t("Work", "العمل")
                  : label === "Other"
                    ? t("Other", "آخر")
                    : label}
            </option>
          ))}
        </select>
      </label>
      {fields.slice(0, 2).map(([name, en, ar, required]) => (
        <Field
          key={name}
          name={name}
          label={t(en, ar)}
          type={name === "phone" ? "tel" : "text"}
          required={required}
          value={String(current?.[name] ?? "")}
        />
      ))}
      <label className="form-field">
        <span>{t("Governorate", "المحافظة")}</span>
        <select
          name="governorate"
          required
          value={governorate}
          disabled={provinces.isPending || !!provinces.error || action.pending}
          onChange={(e) => {
            setGovernorate(e.target.value);
            setCity("");
          }}
        >
          <option value="">
            {provinces.isPending
              ? t("Loading locations…", "جارٍ تحميل المواقع…")
              : t("Choose a governorate", "اختر المحافظة")}
          </option>
          {provinces.data?.map((p) => (
            <option key={p.value} value={p.value}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>{t("City", "المدينة")}</span>
        <select
          name="city"
          required
          value={city}
          disabled={
            !governorate || cities.isPending || !!cities.error || action.pending
          }
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">
            {governorate && cities.isPending
              ? t("Loading cities…", "جارٍ تحميل المدن…")
              : t("Choose a city", "اختر المدينة")}
          </option>
          {cities.data?.map((c) => (
            <option key={c.value} value={c.value}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {(provinces.error || cities.error) && (
        <div className="form-error" role="alert">
          <p>
            {t(
              "Delivery locations could not be loaded.",
              "تعذر تحميل مواقع التوصيل.",
            )}
          </p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              void provinces.refetch();
              if (governorate) void cities.refetch();
            }}
          >
            {t("Try again", "حاول مجددًا")}
          </button>
        </div>
      )}
      {provinces.data?.length === 0 && (
        <p role="status">
          {t(
            "No delivery locations are available at the moment.",
            "لا توجد مواقع توصيل متاحة حاليًا.",
          )}
        </p>
      )}
      {cities.data?.length === 0 && governorate && (
        <p role="status">
          {t(
            "No delivery cities are available for this governorate.",
            "لا توجد مدن توصيل متاحة لهذه المحافظة.",
          )}
        </p>
      )}
      {current &&
        !provinces.isPending &&
        !cities.isPending &&
        !validLocation && (
          <p className="form-error">
            {t(
              "Choose a currently supported governorate and city to save this address.",
              "اختر محافظة ومدينة مدعومتين حاليًا لحفظ هذا العنوان.",
            )}
          </p>
        )}
      {fields.slice(2).map(([name, en, ar, required]) => (
        <Field
          key={name}
          name={name}
          label={t(en, ar)}
          required={required}
          value={String(current?.[name] ?? "")}
        />
      ))}
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={current?.isDefault}
        />
        {t("Default delivery address", "عنوان التوصيل الافتراضي")}
      </label>
      <div className="metropolitan-address-submit">
        <button disabled={action.pending || !validLocation}>
          {action.pending
            ? t("Saving…", "جارٍ الحفظ…")
            : t("Save address", "حفظ العنوان")}
        </button>
      </div>
      <Failure error={action.error} />
    </form>
  );
}
export function Addresses() {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const query = useCustomerQuery(
    customerCacheKey(context, "addresses"),
    session.client.addresses.list,
    session.authenticated,
  );
  const [editing, setEditing] = useState<string | null>(null),
    [removing, setRemoving] = useState<string>();
  const current = query.data?.find((address) => address.id === editing);
  return (
    <>
      <Failure error={query.error || action.error} />
      {query.isPending && (
        <p role="status">{t("Loading addresses…", "جارٍ تحميل العناوين…")}</p>
      )}
      {query.error && (
        <button type="button" onClick={() => void query.refetch()}>
          {t("Try again", "حاول مجددًا")}
        </button>
      )}
      <ul className="metropolitan-address-grid">
        {query.data?.map((a) => (
          <li key={a.id} className="metropolitan-address-card">
            <h2>
              {a.label}
              {a.isDefault && (
                <span className="metropolitan-default-label">
                  {t("Default", "الافتراضي")}
                </span>
              )}
            </h2>
            <AddressText address={a} />
            <div className="action-row">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setEditing(a.id);
                  setRemoving(undefined);
                }}
              >
                {t("Edit address", "تعديل العنوان")}
              </button>
              {!a.isDefault && (
                <button
                  type="button"
                  className="button-secondary"
                  disabled={action.pending}
                  onClick={() =>
                    void action.run(async () => {
                      await session.client.addresses.update(a.id, {
                        isDefault: true,
                      });
                      await query.refetch();
                      action.setNotice(
                        t(
                          "Default address updated.",
                          "تم تحديث العنوان الافتراضي.",
                        ),
                      );
                    })
                  }
                >
                  {t("Make default", "تعيين كافتراضي")}
                </button>
              )}
              <button
                type="button"
                className="button-secondary"
                disabled={action.pending}
                onClick={() => setRemoving(a.id)}
              >
                {t("Remove", "حذف")}
              </button>
            </div>
            {removing === a.id && (
              <div className="metropolitan-delete-confirm">
                <p>
                  {t(
                    "Remove this saved address?",
                    "هل تريد حذف هذا العنوان المحفوظ؟",
                  )}
                </p>
                <div className="action-row">
                  <button
                    type="button"
                    disabled={action.pending}
                    onClick={() =>
                      void action.run(async () => {
                        await session.client.addresses.remove(a.id);
                        await query.refetch();
                        setRemoving(undefined);
                        if (editing === a.id) setEditing(null);
                        action.setNotice(
                          t("Address removed.", "تم حذف العنوان."),
                        );
                      })
                    }
                  >
                    {t("Remove address", "حذف العنوان")}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setRemoving(undefined)}
                  >
                    {t("Keep address", "الاحتفاظ بالعنوان")}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {query.data?.length === 0 && (
        <p>
          {t(
            "Save a delivery address for a quicker checkout.",
            "احفظ عنوان التوصيل لإتمام الطلب بسهولة.",
          )}
        </p>
      )}
      {editing === null ? (
        <button type="button" onClick={() => setEditing("new")}>
          {t("Add an address", "إضافة عنوان")}
        </button>
      ) : (
        <section className="metropolitan-address-editor">
          <div className="metropolitan-account-intro">
            <h2>
              {current
                ? t("Edit address", "تعديل العنوان")
                : t("Add an address", "إضافة عنوان")}
            </h2>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setEditing(null)}
            >
              {t("Cancel", "إلغاء")}
            </button>
          </div>
          <AddressForm
            key={editing}
            current={current}
            done={async () => {
              await query.refetch();
              setEditing(null);
            }}
          />
        </section>
      )}
    </>
  );
}
