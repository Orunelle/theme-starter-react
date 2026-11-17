import { useId, useState } from "react";
import { useCopy } from "./commerce";
import { validQuantity } from "../../lib/quantity";
import { Icon } from "../icons";

export function QuantityInput({
  value,
  max,
  onChange,
  onValidityChange,
  disabled = false,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  onValidityChange?: (valid: boolean) => void;
}) {
  const t = useCopy(),
    id = useId();
  const [draft, setDraft] = useState(String(value));
  const [previous, setPrevious] = useState(value);
  if (previous !== value) {
    setPrevious(value);
    setDraft(String(value));
  }
  const invalid = !validQuantity(Number(draft), max);
  function commit(next: string) {
    setDraft(next);
    onValidityChange?.(validQuantity(Number(next), max));
    if (validQuantity(Number(next), max)) onChange(Number(next));
  }
  return (
    <div className="metropolitan-quantity-field">
      <div
        className="metropolitan-quantity"
        role="group"
        aria-label={t("Quantity", "الكمية")}
      >
        <button
          type="button"
          disabled={disabled || value <= 1}
          aria-label={t("Decrease quantity", "تقليل الكمية")}
          onClick={() => commit(String(value - 1))}
        >
          <Icon name="minus" size={14} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={Math.max(1, max)}
          step={1}
          required
          value={draft}
          disabled={disabled || max < 1}
          aria-label={t("Quantity", "الكمية")}
          aria-invalid={invalid}
          aria-describedby={invalid ? id : undefined}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => {
            if (invalid) {
              setDraft(String(value));
              onValidityChange?.(true);
            }
          }}
        />
        <button
          type="button"
          disabled={disabled || value >= max}
          aria-label={t("Increase quantity", "زيادة الكمية")}
          onClick={() => commit(String(value + 1))}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      {invalid && max > 0 && (
        <small id={id} role="status">
          {t(
            `Enter a whole number from 1 to ${max}.`,
            `أدخل عددًا صحيحًا من ١ إلى ${max}.`,
          )}
        </small>
      )}
    </div>
  );
}
