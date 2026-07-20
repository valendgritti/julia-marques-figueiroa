export default {
  tags: "projeto",
  permalink: ({ page }) => `projetos/projeto-${page.fileSlug}.html`,
  eleventyComputed: {
    layout: ({ modelo }) => ({
      narrativo: "narrative-page.njk",
      "galeria-still": "gallery-page.njk",
      "fotografia-digital": "gallery-page.njk",
      "video-vertical": "vertical-page.njk",
      roteiro: "script-page.njk",
    })[modelo] || "narrative-page.njk",
    pageTitle: ({ titulo }) => `${titulo} — Julia Figueirôa`,
    description: ({ descricaoSeo, resumo }) => descricaoSeo || resumo,
    bodyClass: ({ modelo, variantClass }) => {
      const modelClasses = {
        "video-vertical": "project-page vertical-video-page",
        roteiro: "project-page script-project-page",
        "galeria-still": "project-page photo-gallery-page photo-gallery-page--still",
        "fotografia-digital": "project-page photo-gallery-page photo-gallery-page--digital",
      };
      return `${modelClasses[modelo] || "project-page"}${variantClass ? ` ${variantClass}` : ""}`;
    },
  },
};
