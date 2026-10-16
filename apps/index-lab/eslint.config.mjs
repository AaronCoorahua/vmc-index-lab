import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Concorde V2 is an installed, hash-recorded provider library. It is not
  // lab-authored source and must not be rewritten to satisfy this app's ESLint
  // plugin set.
  { ignores: [".next/**", "next-env.d.ts", "concorde/**"] },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
