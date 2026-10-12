import { defineConfig } from "tsup";

const sharedOptions = {
    target: "node20" as const,
    sourcemap: true,
    splitting: false,
    outExtension({ format }: { format: string }) {
        return {
            js: format === "cjs" ? ".cjs" : ".js"
        };
    }
};

export default defineConfig([
    {
        ...sharedOptions,
        entry: {
            index: "src/index.ts"
        },
        format: ["esm", "cjs"],
        dts: true,
        clean: true
    },
    {
        ...sharedOptions,
        entry: {
            "bin/stillmark": "src/bin/stillmark.ts"
        },
        format: ["esm"]
    }
]);
