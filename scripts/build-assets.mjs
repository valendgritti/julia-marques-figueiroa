import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(".generated/assets");
for (const legacyAsset of ["_site/script.js", "_site/styles.css"]) {
  await rm(path.resolve(legacyAsset), { force: true });
}
try {
  const publishedAssets = await readdir(path.resolve("_site/assets"));
  await Promise.all(publishedAssets.filter((name) => /^site\..+\.min\.(css|js)$/.test(name)).map((name) => rm(path.resolve("_site/assets", name), { force: true })));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const compile = async (entryPoint, extension, options = {}) => {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    sourcemap: false,
    write: false,
    target: ["es2020"],
    ...options,
  });
  const contents = result.outputFiles[0].contents;
  const hash = createHash("sha256").update(contents).digest("hex").slice(0, 10);
  const filename = `site.${hash}.min.${extension}`;
  await writeFile(path.join(outputDirectory, filename), contents);
  return filename;
};

const assets = {
  script: await compile("src/js/main.js", "js", { format: "iife" }),
  styles: await compile("styles.css", "css", { external: ["../fonts/*"] }),
};
await writeFile(path.resolve(".generated/assets.json"), `${JSON.stringify(assets, null, 2)}\n`);
