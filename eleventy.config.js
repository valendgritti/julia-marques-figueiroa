export default function (eleventyConfig) {
  for (const path of ["styles.css", "script.js", "imagens", "admin", "projetos"]) {
    eleventyConfig.addPassthroughCopy(path);
  }
  eleventyConfig.addFilter("nl2br", (value = "") => String(value).replace(/\r?\n/g, "<br />"));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: "/julia-marques-figueiroa/",
    htmlTemplateEngine: "njk"
  };
}
