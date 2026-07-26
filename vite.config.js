import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD;
  const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  const targetApiBase = env.VITE_API_URL;

  return {
    plugins: [
      react(),
      {
        name: 'filmycosmo-api-debug-and-proxy',
        async configureServer(server) {
          console.log('[Vite Proxy] Testing API target connection:', targetApiBase);

          // Dump API payload on startup to inspect schema
          try {
            const dumpRes = await fetch(`${targetApiBase}/movies`, {
              headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
            });
            const text = await dumpRes.text();
            fs.writeFileSync(path.join(process.cwd(), 'api_dump.json'), text);
            console.log('[Vite Proxy] Dumped API response to api_dump.json. Status:', dumpRes.status);
          } catch (e) {
            console.error('[Vite Proxy] Error dumping API:', e.message);
            fs.writeFileSync(path.join(process.cwd(), 'api_dump.json'), JSON.stringify({ error: e.message }));
          }

          server.middlewares.use('/api', async (req, res, next) => {
            const cleanUrl = req.url.startsWith('/') ? req.url : '/' + req.url;
            const targetUrl = targetApiBase + (cleanUrl === '/' ? '/movies' : cleanUrl);

            console.log(`[Proxy Req] ${req.method} ${req.url} -> ${targetUrl}`);

            try {
              const fetchOptions = {
                method: req.method,
                headers: {
                  'Authorization': authHeader,
                  'Accept': 'application/json',
                  'User-Agent': 'FilmyCosmo-Client'
                }
              };

              const response = await fetch(targetUrl, fetchOptions);
              const responseData = await response.text();

              // Save debug response
              fs.writeFileSync(path.join(process.cwd(), 'last_proxy_res.json'), responseData);

              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(responseData);
            } catch (err) {
              console.error('[Proxy Error]', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    }
  };
});
