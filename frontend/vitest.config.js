import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

function stubOcLogo() {
  return {
    name: "stub-oc-logo",
    enforce: "pre",
    resolveId(id) {
      if (id === "/oc_logo.png") return "\0oc_logo.png";
    },
    load(id) {
      if (id === "\0oc_logo.png") return 'export default "oc_logo.png";';
    },
  };
}

export default defineConfig({
  plugins: [stubOcLogo(), vue(), vuetify({ autoImport: true })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
});
