import Image from "@11ty/eleventy-img";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sanitizeHtml from "sanitize-html";

const pathPrefix = process.env.SITE_PATH_PREFIX || "/";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const safeJsonStringify = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

const normalizeLocalImage = (source) => path.join(process.cwd(), String(source).replace(/^\//, ""));

export default function (eleventyConfig) {
  for (const path of ["admin", "robots.txt", "_headers"]) {
    eleventyConfig.addPassthroughCopy(path);
  }
  eleventyConfig.addPassthroughCopy({ ".generated/assets": "assets" });
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addGlobalData("assets", async () => JSON.parse(await readFile(".generated/assets.json", "utf8")));
  eleventyConfig.addPassthroughCopy({
    "imagens/FotografiaDigital/Digital3.jpg": "assets/social-share.jpg",
  });
  eleventyConfig.addAsyncShortcode("image", async (source, alt, sizes = "100vw", loading = "lazy", priority = "auto") => {
    const metadata = await Image(normalizeLocalImage(source), {
      widths: [480, 768, 1280, 1920],
      formats: ["avif", "webp"],
      outputDir: "_site/assets/images",
      urlPath: `${pathPrefix}assets/images/`.replace(/\/+/g, "/"),
      sharpOptions: { animated: true },
    });

    return Image.generateHTML(metadata, {
      alt: alt || "",
      sizes,
      loading,
      decoding: "async",
      fetchpriority: priority,
    }, {
      whitespaceMode: "inline",
    });
  });
  eleventyConfig.addFilter("safeExternalUrl", (value = "") => {
    if (!value) return "";
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error(`URL externa deve usar HTTPS: ${value}`);
    return url.href;
  });
  eleventyConfig.addFilter("adjacentProject", (projects = [], currentUrl = "", offset = 1) => {
    const sortedProjects = [...projects].sort((first, second) => first.data.ordem - second.data.ordem);
    const currentIndex = sortedProjects.findIndex((project) => project.url === currentUrl);
    if (currentIndex < 0 || sortedProjects.length < 2) return null;
    return sortedProjects[(currentIndex + offset + sortedProjects.length) % sortedProjects.length];
  });
  eleventyConfig.addFilter("projectSchema", (title, description, url) => safeJsonStringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    image: `${process.env.SITE_URL || "https://valendgritti.github.io"}${pathPrefix}assets/social-share.jpg`,
    url: `${process.env.SITE_URL || "https://valendgritti.github.io"}${url}`,
    creator: { "@type": "Person", name: "Julia Marques Figueirôa" },
  }));
  eleventyConfig.addFilter("jsonStringify", safeJsonStringify);
  eleventyConfig.addFilter("cspHash", (value) => createHash("sha256").update(String(value)).digest("base64"));
  eleventyConfig.addFilter("nl2br", (value = "") => escapeHtml(value).replace(/\r?\n/g, "<br />"));
  eleventyConfig.addFilter("sanitizeContent", (value = "") => sanitizeHtml(String(value), {
    allowedTags: ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li", "blockquote", "code", "pre", "a", "h2", "h3", "h4", "hr"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: attributes.target === "_blank" ? { ...attributes, rel: "noopener noreferrer" } : attributes,
      }),
    },
  }));
  eleventyConfig.addFilter("stylizedTitle", (value = "") => {
    const lines = String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) return escapeHtml(lines[0] || "");

    const highlightedLine = escapeHtml(lines.at(-1));
    return `${lines.slice(0, -1).map(escapeHtml).join("<br />")}<br /><em>${highlightedLine}</em>`;
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix,
    htmlTemplateEngine: "njk"
  };
}
