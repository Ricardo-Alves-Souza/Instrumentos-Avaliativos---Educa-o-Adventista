import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Public Supabase configuration from environment secrets
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabaseJwksUrl =
  process.env.SUPABASE_JWKS_URL ||
  '';

const isConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// ---------------------------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    supabaseConfigured: isConfigured,
    hasUrl: Boolean(supabaseUrl),
    hasPublishableKey: Boolean(supabasePublishableKey),
    hasJwksUrl: Boolean(supabaseJwksUrl),
  });
});

// Safe public client config endpoint (only publishable key and URL are sent)
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    supabaseUrl,
    supabasePublishableKey,
    supabaseJwksUrl,
    isConfigured,
  });
});

// ---------------------------------------------------------------------------
// VITE MIDDLEWARE & SERVER START
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sistema de Instrumentos Avaliativos rodando em http://localhost:${PORT}`);
  });
}

startServer();
