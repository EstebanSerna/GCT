import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatApiPlugin } from './server/devPlugin.mjs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads .env / .env.local into process.env for the dev server (Node side)
  // only — never exposed to the client bundle unless prefixed with VITE_.
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY ??= env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), chatApiPlugin()],
  }
})
