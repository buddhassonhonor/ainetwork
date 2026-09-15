import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

function exportDownloadPlugin() {
  return {
    name: 'export-download-server',
    configureServer(server) {
      server.middlewares.use('/api/export-download', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              let filename = 'score_report.xlsx';
              let base64 = '';
              let mimeType = 'application/octet-stream';

              if (req.headers['content-type']?.includes('application/json')) {
                const parsed = JSON.parse(body);
                filename = parsed.filename;
                base64 = parsed.base64;
                mimeType = parsed.mimeType || mimeType;
              } else {
                const params = new URLSearchParams(body);
                filename = params.get('filename') || filename;
                base64 = params.get('base64') || '';
                mimeType = params.get('mimeType') || mimeType;
              }

              const buffer = Buffer.from(base64, 'base64');
              const encodedFilename = encodeURIComponent(filename);

              res.setHeader('Content-Type', mimeType);
              res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
              );
              res.setHeader('Content-Length', buffer.length);
              res.end(buffer);
            } catch (err) {
              res.statusCode = 500;
              res.end('Export error: ' + err.message);
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), exportDownloadPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        question: resolve(__dirname, 'question.html'),
      },
    },
  },
})
