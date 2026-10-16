import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Mill writes the linked Scala.js module here; `./mill -w products.web.fastLinkJS`
// keeps it fresh during development and Vite reloads when it changes.
const scalaJsOut = (mode) =>
  fileURLToPath(
    new URL(
      `./out/products/web/${mode === 'production' ? 'fullLinkJS' : 'fastLinkJS'}.dest/main.js`,
      import.meta.url,
    ),
  );

export default defineConfig(({ mode }) => ({
  root: 'products/web/static',
  resolve: {
    alias: { 'scalajs:main.js': scalaJsOut(mode) },
  },
  server: {
    fs: { allow: ['.', fileURLToPath(new URL('./out', import.meta.url))] },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
}));
