import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  const supabaseJwksUrl = process.env.SUPABASE_JWKS_URL || '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl),
      '__SUPABASE_PUBLISHABLE_KEY__': JSON.stringify(supabasePublishableKey),
      '__SUPABASE_JWKS_URL__': JSON.stringify(supabaseJwksUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
