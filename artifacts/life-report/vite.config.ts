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
        transformed = transformed.replaceAll(
          'https://iq101.ink',
          'https://intelmeter.ink',
        );
        transformed = transformed.replaceAll(
          'https://originalitymeter.com',
          'https://originality.ink',
        );
        transformed = transformed.replaceAll(
          'https://graphicnovelcreator.xyz',
          'https://graphicnovelcreator.ink',
        );
        transformed = transformed.replaceAll(
          'https://findyourself.ink',
          'https://cognitivecareer.xyz',
        );
        transformed = transformed.replaceAll(
          'https://modeltransformer.xyz',
          'https://modeltransformer.ink',
        );
        transformed = transformed.replaceAll(
          'https://ethics101.xyz',
          'https://ethics101.ink',
        );
        transformed = transformed.replaceAll(
          'https://minikinowthyself.ink',
          'https://knowthyself101.xyz',
        );
        transformed = transformed.replaceAll(
          'https://ezpodcast.xyz',
          'https://ezpodcast.ink',
        );
        transformed = transformed.replaceAll(
          'https://psychologypro.xyz',
          'https://psychologypro.ink',
        );
        transformed = transformed.replace(
          '51 AI-powered interactive courses and 39 AI applications',
          '59 AI-powered interactive courses and 42 AI applications',
        );
        transformed = transformed.replace(
          ' · <a href="https://judge101.ink">Judge Evaluator</a>',
          '',
        );
        transformed = transformed.replace(
          ' · <a href="https://chesstutor.xyz">Chess Tutor</a>',
          '',
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
              const appList = Array.isArray(document)
                ? document.find(
                    (entry) =>
                      entry?.['@type'] === 'ItemList' &&
                      entry?.['@id'] === 'https://jmkuczynski.ai/#apps',
                  )
                : null;

              if (
                (!courseList || !Array.isArray(courseList.itemListElement)) &&
                (!appList || !Array.isArray(appList.itemListElement))
              ) {
                return `${open}${json}${close}`;
              }

              if (courseList && Array.isArray(courseList.itemListElement)) {
                const additions = [
                  {
                    name: 'Aging with BPD',
                    url: 'https://agingbpd.xyz',
                  },
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
                  {
                    name: 'Cloud Architecture',
                    url: 'https://cloudarchitecture.ink',
                  },
                  {
                    name: 'Cryptography',
                    url: 'https://picocryptography.xyz',
                  },
                  {
                    name: 'Four Hour Epistemology',
                    url: 'https://onedayepistemology.xyz',
                  },
                  {
                    name: 'Freud in Four Hours',
                    url: 'https://nanofreud.xyz',
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
              }

              if (appList && Array.isArray(appList.itemListElement)) {
                appList.itemListElement = appList.itemListElement.filter(
                  (entry) =>
                    entry?.item?.name !== 'Judge Evaluator' &&
                    entry?.item?.url !== 'https://judge101.ink' &&
                    entry?.item?.name !== 'Chess Tutor' &&
                    entry?.item?.url !== 'https://chesstutor.xyz',
                );
                const existingUrls = new Set(
                  appList.itemListElement.map((entry) => entry?.item?.url),
                );
                [
                  {
                    name: 'Cognitive Career Profiler',
                    url: 'https://cognitivecareer.xyz',
                  },
                  {
                    name: 'Black Jesus',
                    url: 'https://blackjesus.ink',
                  },
                  {
                    name: 'Metaethics',
                    url: 'https://metaethics.ink',
                  },
                  {
                    name: 'Living Book Maker',
                    url: 'https://livingbookmaker.ink',
                  },
                  {
                    name: 'Original EZ Reader',
                    url: 'https://originalezreader.ink',
                  },
                ].forEach(({ name, url }) => {
                  if (existingUrls.has(url)) return;
                  appList.itemListElement.push({
                    '@type': 'ListItem',
                    position: appList.itemListElement.length + 1,
                    item: {
                      '@type': 'SoftwareApplication',
                      name,
                      url,
                    },
                  });
                });
                appList.itemListElement.sort((left, right) => {
                  const leftName = String(left?.item?.name ?? '').replace(
                    /[^a-z0-9]/gi,
                    '',
                  );
                  const rightName = String(right?.item?.name ?? '').replace(
                    /[^a-z0-9]/gi,
                    '',
                  );
                  return leftName.localeCompare(rightName, 'en', {
                    sensitivity: 'base',
                  });
                });
                appList.itemListElement.forEach((entry, index) => {
                  entry.position = index + 1;
                });
                appList.numberOfItems = appList.itemListElement.length;
              }

              return `${open}${JSON.stringify(document)}${close}`;
            } catch {
              return `${open}${json}${close}`;
            }
          },
        );

        transformed = transformed.replace(
          '</p><h2>Key Apps</h2>',
          ' · <a href="https://agingbpd.xyz">Aging with BPD</a> · <a href="https://aigovernance.ink">AI Integration Ethical AI &amp; Governance Technology</a> · <a href="https://generativeai.ink">Prompt Engineering for AI Generative</a> · <a href="https://mlops.ink">Machine Learning Operations</a> · <a href="https://picocryptography.xyz">Cryptography</a> · <a href="https://onedayepistemology.xyz">Four Hour Epistemology</a> · <a href="https://nanofreud.xyz">Freud in Four Hours</a></p><h2>Key Apps</h2>',
        );
        transformed = transformed.replace(
          '</p></main></noscript>',
          ' · <a href="https://cognitivecareer.xyz">Cognitive Career Profiler</a> · <a href="https://blackjesus.ink">Black Jesus</a> · <a href="https://metaethics.ink">Metaethics</a> · <a href="https://livingbookmaker.ink">Living Book Maker</a> · <a href="https://originalezreader.ink">Original EZ Reader</a></p></main></noscript>',
        );

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
