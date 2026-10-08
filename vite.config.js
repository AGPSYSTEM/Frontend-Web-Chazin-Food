import path from 'path';
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

function nonBlockingCss() {
  return {
    name: 'non-blocking-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/,
        '<link rel="preload" as="style" href="$1"><link rel="stylesheet" href="$1">'
      );
    }
  };
}

export default {
  plugins: [
    figmaAssetResolver(),
    nonBlockingCss(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  },
  preview: {
    host: true,
    port: 4173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react/')) {
              return 'react-vendor';
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
