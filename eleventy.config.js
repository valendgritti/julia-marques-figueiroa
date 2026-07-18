export default function (eleventyConfig) {
  for (const path of ["styles.css", "script.js", "imagens", "admin"]) {
    eleventyConfig.addPassthroughCopy(path);
  }
  eleventyConfig.addFilter("nl2br", (value = "") => String(value).replace(/\r?\n/g, "<br />"));
  eleventyConfig.addFilter("stylizedTitle", (value = "") => {
    const escapeHtml = (text) => String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
    const lines = String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) return escapeHtml(lines[0] || "");

    const highlightedLine = escapeHtml(lines.at(-1));
    return `${lines.slice(0, -1).map(escapeHtml).join("<br />")}<br /><em>${highlightedLine}</em>`;
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: "/julia-marques-figueiroa/",
    htmlTemplateEngine: "njk"
  };
}
