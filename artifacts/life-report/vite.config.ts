import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    {
      name: 'normalize-course-catalog',
      transformIndexHtml(html) {
        let transformed = html.replaceAll(
          'https://photopsychoanalysis.xyz',
          'https://photopsychoanalysis.ink',
        );

        transformed = transformed.replace(
          /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
          (_match, open, json, close) => {
            try {
              const document = JSON.parse(json);
              const courseList = Array.isArray(document)
                ? document.find(
                    (entry) =>
                      entry?.['@type'] === 'ItemList' &&
                      entry?.['@id'] === 'https://jmkuczynski.ai/#courses',
                  )
                : null;

              if (!courseList || !Array.isArray(courseList.itemListElement)) {
                return `${open}${json}${close}`;
              }

              const additions = [
                {
                  name: 'AI Integration Ethical AI & Governance Technology',
                  url: 'https://aigovernance.ink',
                },
                {
                  name: 'Prompt Engineering for AI Generative',
                  url: 'https://generativeai.ink',
                },
                {
                  name: 'Machine Learning Operations',
                  url: 'https://mlops.ink',
                },
              ];
              const existingUrls = new Set(
                courseList.itemListElement.map((entry) => entry?.item?.url),
              );
              const provider = { '@id': 'https://jmkuczynski.ai/#person' };

              additions.forEach(({ name, url }) => {
                if (existingUrls.has(url)) return;
                courseList.itemListElement.push({
                  '@type': 'ListItem',
                  position: courseList.itemListElement.length + 1,
                  item: {
                    '@type': 'Course',
                    name,
                    url,
                    provider,
                    offers: { '@type': 'Offer', category: 'Online Course' },
                  },
                });
              });
              courseList.numberOfItems = courseList.itemListElement.length;
              return `${open}${JSON.stringify(document)}${close}`;
            } catch {
              return `${open}${json}${close}`;
            }
          },
        );

        if (!transformed.includes('https://generativeai.ink')) {
          transformed = transformed.replace(
            '</p><h2>Key Apps</h2>',
            ' · <a href="https://aigovernance.ink">AI Integration Ethical AI &amp; Governance Technology</a> · <a href="https://generativeai.ink">Prompt Engineering for AI Generative</a> · <a href="https://mlops.ink">Machine Learning Operations</a></p><h2>Key Apps</h2>',
          );
        }

        return transformed;
      },
    },
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
