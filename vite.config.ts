import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Sitemap from "vite-plugin-sitemap";
import path from "path";

// All tool routes for sitemap generation
const toolRoutes = [
  "/tools/qr-generator",
  "/tools/image-optimizer",
  "/tools/password-generator",
  "/tools/base64-encode",
  "/tools/base64-decode",
  "/tools/regex-tester",
  "/tools/json-formatter",
  "/tools/lorem-generator",
  "/tools/uuid-generator",
  "/tools/html-formatter",
  "/tools/css-formatter",
  "/tools/sql-formatter",
  "/tools/json-validator",
  "/tools/html-validator",
  "/tools/css-validator",
  "/tools/url-encode",
  "/tools/url-decode",
  "/tools/hash-generator",
  "/tools/color-picker",
  "/tools/timestamp-converter",
  "/tools/jwt-decoder",
  "/tools/markdown-preview",
  "/tools/minify-css",
  "/tools/minify-js",
  "/tools/url-shortener",
  "/tools/text-counter",
  "/tools/diff-checker",
  "/tools/text-case-converter",
  "/tools/base-converter",
  "/tools/yaml-formatter",
  "/tools/json-yaml-converter",
  "/tools/cron-builder",
  "/tools/unix-permissions",
  "/tools/csv-json-converter",
  "/tools/xml-formatter",
  "/tools/http-status",
  "/tools/mock-data-generator",
  "/tools/escape-unescape",
  "/tools/byte-unit-converter",
  "/tools/graphql-formatter",
  "/tools/jwt-generator",
];

const categoryRoutes = [
  "/formatters",
  "/validators",
  "/converters",
  "/generators",
];

const blogRoutes = [
  "/blog",
  "/blog/best-free-json-formatter-online",
  "/blog/secure-password-generator-guide",
  "/blog/base64-encoding-decoding-explained",
  "/blog/regex-tutorial-for-developers",
  "/blog/jwt-tokens-explained",
  "/blog/css-minification-guide",
  "/blog/uuid-guide-developers",
  "/blog/hash-algorithms-explained",
  "/blog/cron-expressions-guide",
  "/blog/json-yaml-conversion-guide",
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    Sitemap({
      hostname: "https://thedevtoolshub.com",
      dynamicRoutes: [
        "/",
        "/home",
        ...categoryRoutes,
        ...toolRoutes,
        ...blogRoutes,
      ],
      exclude: ["/workspace", "/not-found"],
      outDir: "./dist",
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
