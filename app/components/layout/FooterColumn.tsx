import { useEffect, useState } from "react";
import { type ThemeNodeProps } from "@orunelle/theme-sdk";
import { useText } from "../../hooks/useThemeSettings";

import { Icon } from "../icons";
export function FooterColumn({ id, settings, children }: ThemeNodeProps) {
  const text = useText();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setOpen(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <section className="metropolitan-footer-column">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`footer-${id}`}
          onClick={() => setOpen(!open)}
        >
          {text(settings, "title")}
          <Icon name="plus" size={16} />
        </button>
      </h2>
      <div id={`footer-${id}`} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
