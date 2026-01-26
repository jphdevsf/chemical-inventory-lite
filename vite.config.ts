import path from "node:path"
import netlify from "@netlify/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss(), netlify()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: { proxy: { "/data": "http://localhost:3001" } },
  base: "/"
})
