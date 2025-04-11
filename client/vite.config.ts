import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: "./client.env" })

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    allowedHosts: true,
  },
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
})
