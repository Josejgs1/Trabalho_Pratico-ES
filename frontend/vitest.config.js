import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/services/**/*.{js,jsx,ts,tsx}",
        "src/components/auth/**/*.{js,jsx,ts,tsx}",
        "src/components/brand/**/*.{js,jsx,ts,tsx}",
        "src/components/map/categoryCarousel.jsx",
        "src/components/map/mapOverlay.jsx",
        "src/components/map/searchBar.jsx",
        "src/components/map/searchResults.jsx",
        "src/components/map/sideDrawer.jsx",
        "src/components/passport/passportHeader.jsx",
        "src/components/passport/recordCard.jsx",
        "src/components/passport/recordList.jsx",
        "src/components/passport/wishlistCard.jsx",
        "src/components/passport/wishlistList.jsx",
      ],
      exclude: ["src/tests/**", "src/main.jsx", "src/assets/**"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
