import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  build: {
    // Raise the warning threshold — jsPDF + Chart.js are legitimately large libs
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split heavy libraries into separate cached chunks.
        // Browser caches them independently — if only app code changes,
        // users re-download only the small app chunk, not the full 1.1 MB bundle.
        manualChunks: {
          // React core
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // Clerk auth
          "vendor-clerk": ["@clerk/react"],

          // Chart.js — large, rarely changes
          "vendor-charts": ["chart.js", "react-chartjs-2"],

          // PDF generation — heaviest libs, split so they don't block initial paint
          "vendor-pdf": ["jspdf", "jspdf-autotable", "html2canvas"],

          // HTTP client
          "vendor-axios": ["axios"],
        },
      },
    },
  },
})
