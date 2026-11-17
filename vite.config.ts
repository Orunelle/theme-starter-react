import { defineConfig } from "vite";
import { orunelleReact } from "@orunelle/theme-runtime/vite";
export default defineConfig(async () => ({
  plugins: await orunelleReact({ project: import.meta.dirname }),
}));
