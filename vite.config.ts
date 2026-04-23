import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
        '@/components': path.resolve(__dirname, './client/src/components'),
        '@/hooks': path.resolve(__dirname, './client/src/hooks'),
        '@/lib': path.resolve(__dirname, './client/src/lib'),
        '@/services': path.resolve(__dirname, './client/src/services'),
        '@/store': path.resolve(__dirname, './client/src/store'),
        '@/types': path.resolve(__dirname, './client/src/types'),
        '@/utils': path.resolve(__dirname, './client/src/utils'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
