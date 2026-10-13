import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://stillmark.dev",
    integrations: [sitemap()]
});
