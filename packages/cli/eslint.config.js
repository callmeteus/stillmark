import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "tests/fixtures/**"
        ]
    },
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" }
            ]
        }
    }
);
