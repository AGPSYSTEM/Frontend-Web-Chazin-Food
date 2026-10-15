import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '');
        return path.resolve(__dirname, 'src/assets', filename);
      }
    },
  };
}

function modulePreloadPlugin() {
  return {
    name: 'module-preload-plugin',
    transformIndexHtml(html, ctx) {
      if (!ctx || !ctx.bundle) return html;
      const tags = [];
      for (const fileName of Object.keys(ctx.bundle)) {
        if ((fileName.includes('ClienteLanding') || fileName.includes('FoodIcon')) && fileName.endsWith('.js')) {
          tags.push({
            tag: 'link',
            attrs: { rel: 'modulepreload', crossorigin: true, href: `/${fileName}` },
            injectTo: 'head'
          });
        }
      }
      return tags;
    }
  };
}

function gzipCompressionPlugin() {
  return {
    name: 'gzip-compression',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      function compressDir(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            compressDir(fullPath);
          } else if (/\.(js|css|html|svg|json)$/.test(file)) {
            const content = fs.readFileSync(fullPath);
            const gzipped = zlib.gzipSync(content, { level: 9 });
            fs.writeFileSync(fullPath + '.gz', gzipped);
          }
        }
      }
      compressDir(distDir);
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const acceptEncoding = req.headers['accept-encoding'] || '';
        if (!acceptEncoding.includes('gzip')) return next();

        const cleanUrl = req.url.split('?')[0];
        let filePath = null;
        let contentType = null;

        if (cleanUrl === '/' || cleanUrl === '/index.html') {
          filePath = path.resolve(__dirname, 'dist/index.html');
          contentType = 'text/html; charset=UTF-8';
        } else if (/\.(js|css|svg|json)$/.test(cleanUrl)) {
          const relativePath = cleanUrl.replace(/^\//, '');
          filePath = path.resolve(__dirname, 'dist', relativePath);
          if (cleanUrl.endsWith('.js')) contentType = 'application/javascript';
          else if (cleanUrl.endsWith('.css')) contentType = 'text/css';
          else if (cleanUrl.endsWith('.svg')) contentType = 'image/svg+xml';
          else if (cleanUrl.endsWith('.json')) contentType = 'application/json';
        }

        if (filePath) {
          const gzPath = filePath + '.gz';
          if (fs.existsSync(gzPath)) {
            const data = fs.readFileSync(gzPath);
            res.setHeader('Content-Encoding', 'gzip');
            if (contentType) res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', data.length);
            if (cleanUrl.includes('/assets/')) {
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
            return res.end(data);
          }
        }
        next();
      });
    }
  };
}

function nonBlockingCssPlugin() {
  return {
    name: 'non-blocking-css-plugin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        '<link rel="preload" as="style" href="$1"><link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="$1"></noscript>'
      );
    }
  };
}

export default {
  plugins: [
    figmaAssetResolver(),
    modulePreloadPlugin(),
    gzipCompressionPlugin(),
    react(),
    tailwindcss(),
    nonBlockingCssPlugin(),
  ],
  server: {
    host: true,
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    },
  },
  preview: {
    host: true,
    port: 4173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('scheduler') || id.includes('react/')) {
              return 'react-core';
            }
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'react-router';
            }
            if (id.includes('@radix-ui') || id.includes('@popperjs')) {
              return 'radix-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('@tabler/icons-react')) {
              return 'tabler-icons';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            if (id.includes('xlsx')) {
              return 'xlsx';
            }
            if (id.includes('sweetalert2')) {
              return 'sweetalert';
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
};
