import type { IncomingMessage } from 'node:http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function getProxyTarget(rawUrl?: string) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return {
      target: url.origin,
      path: `${url.pathname}${url.search}`
    };
  } catch {
    return null;
  }
}

function readRequestBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', chunk => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getErrorOutput(status: number, contentType: string | null, bodyText: string) {
  if (contentType?.includes('application/json')) {
    try {
      const payload = JSON.parse(bodyText);
      const parts = [payload.message, payload.hint].filter(
        part => typeof part === 'string' && part.trim().length > 0
      );

      if (parts.length > 0) {
        return `n8n workflow request failed (HTTP ${status}). ${parts.join(' ')}`;
      }
    } catch {
      return `n8n workflow request failed (HTTP ${status}). ${bodyText.trim()}`;
    }
  }

  const cleaned = stripHtml(bodyText);
  return cleaned
    ? `n8n workflow request failed (HTTP ${status}). ${cleaned}`
    : `n8n workflow request failed (HTTP ${status}). Open the latest execution in n8n and inspect the failing node.`;
}

function createChatAdapter(route: string, rawUrl?: string) {
  const target = getProxyTarget(rawUrl);

  return {
    name: `n8n-chat-adapter:${route}`,
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(route)) {
          next();
          return;
        }

        if (!target) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            output: 'Missing webhook configuration for the local adapter.'
          }));
          return;
        }

        try {
          const incomingUrl = new URL(req.url, 'http://localhost:3000');
          const upstreamUrl = new URL(target.path, target.target);
          upstreamUrl.search = incomingUrl.search;

          const body =
            req.method === 'GET' || req.method === 'HEAD'
              ? undefined
              : await readRequestBody(req);

          const headers = new Headers();

          for (const [name, value] of Object.entries(req.headers)) {
            if (!value || name === 'host' || name === 'content-length') continue;

            if (Array.isArray(value)) {
              headers.set(name, value.join(', '));
            } else {
              headers.set(name, value);
            }
          }

          const response = await fetch(upstreamUrl, {
            method: req.method,
            headers,
            body
          });

          const responseBuffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type');

          if (!response.ok) {
            const responseText = responseBuffer.toString('utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              output: getErrorOutput(response.status, contentType, responseText)
            }));
            return;
          }

          res.statusCode = response.status;
          res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
          res.end(responseBuffer);
        } catch (error) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            output:
              error instanceof Error
                ? `Unable to contact n8n from the local adapter. ${error.message}`
                : 'Unable to contact n8n from the local adapter.'
          }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      createChatAdapter('/api/n8n-chat', env.VITE_N8N_WEBHOOK_URL)
      ],
    server: {
      port: 3001,
      open: true
    }
  };
});