import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    globalIgnores([
        "**/dist/**",
        "**/node_modules/**",
        "**/coverage/**",
        "**/generated/**",
        "prisma/migrations/**",
    ]),

    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    {
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: { allowDefaultProject: ["*.config.ts", "prisma*.config.ts"] },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // Allow unused args/vars prefixed with _ (Express's _req, _next)
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],

            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],

            // Allows async Express handlers: router.get("/", async (req, res) => ...)
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { arguments: false } },
            ],
        },
    },

    // Plain JS/config files: skip type-aware rules
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...tseslint.configs.disableTypeChecked,
    },

    // Must be last: turns off rules that conflict with Prettier
    prettier,
);
