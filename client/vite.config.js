import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), //if you are using it with js than it can show an error message that '__dirname' is not defined. do not worry about that.
    },
  },
});
