import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://callmeteus.github.io/stillmark",
    base: "/stillmark",
    integrations: [sitemap()]
});
