import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The storefront intentionally uses plain anchors for its client-side catalog.
      "@next/next/no-html-link-for-pages": "off",
      // Existing client stores intentionally hydrate browser state after mounting.
      "react-hooks/set-state-in-effect": "off",
      // Catalog/admin images can be data URLs or user-managed remote URLs. They
      // cannot safely use Next Image without a fixed loader/domain contract.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
