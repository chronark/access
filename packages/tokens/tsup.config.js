import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/crypto/web.ts", "./src/crypto/node.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
});
