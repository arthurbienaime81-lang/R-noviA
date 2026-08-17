import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // @next/eslint-plugin-next@14.2.35 (encore en place tant que
      // eslint-config-next n'est pas passé en v16) appelle
      // context.getAncestors(), une API retirée par ESLint 9 — cette règle
      // plante sur tout fichier. Elle ne concerne que le Pages Router
      // (détection de <Head> dupliqué dans _document.js), absent de ce
      // projet (100% App Router) : désactivation sans perte de couverture
      // réelle. À réévaluer après le passage à eslint-config-next@16.
      "@next/next/no-duplicate-head": "off",
    },
  },
];

export default eslintConfig;
