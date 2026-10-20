import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cargo writes and locks build files under src-tauri/target while compiling: watching them crashes Vite on Windows (EBUSY).
    watch: { ignored: ['**/src-tauri/**'] },
  },
})
