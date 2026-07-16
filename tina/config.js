import { defineConfig } from "tinacms";

const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
const basePath = process.env.TINA_PUBLIC_BASE_PATH || "";

const pairFields = (labelOne, labelTwo) => [
  { type: "string", name: "rotulo", label: labelOne, required: true },
  { type: "string", name: "valor", label: labelTwo, required: true },
];

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    publicFolder: ".",
    outputFolder: "admin",
    basePath,
  },
  media: {
    tina: {
      publicFolder: ".",
      mediaRoot: "imagens/uploads",
    },
  },
  schema: {
    collections: [
      {
        name: "site",
        label: "Página inicial",
        path: "src/_data",
        format: "json",
        match: { include: "site" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "seoDescription", label: "Descrição para buscadores", ui: { component: "textarea" } },
          { type: "string", name: "heroEyebrow", label: "Linha acima do título" },
          { type: "string", name: "heroTitle", label: "Título principal", description: "Use <br /> e <em> somente para preservar a composição visual." },
          { type: "string", name: "heroIntro", label: "Texto de abertura", ui: { component: "textarea" } },
          { type: "string", name: "worksTitle", label: "Título dos trabalhos" },
          { type: "string", name: "worksIntro", label: "Introdução dos trabalhos", ui: { component: "textarea" } },
          { type: "string", name: "aboutTitle", label: "Título da seção Sobre" },
          { type: "string", name: "aboutText", label: "Texto Sobre", ui: { component: "textarea" } },
          { type: "string", name: "contactEyebrow", label: "Linha acima do contato" },
          { type: "string", name: "contactTitle", label: "Título do contato" },
          { type: "string", name: "email", label: "E-mail" },
          { type: "string", name: "whatsappLabel", label: "WhatsApp exibido" },
          { type: "string", name: "whatsappUrl", label: "Link do WhatsApp" },
          { type: "string", name: "linkedinLabel", label: "LinkedIn exibido" },
          { type: "string", name: "linkedinUrl", label: "Link do LinkedIn" },
        ],
      },
      {
        name: "projeto",
        label: "Projetos",
        path: "src/projetos",
        format: "md",
        ui: {
          filename: { slugify: (values) => values?.titulo?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "novo-projeto" },
        },
        fields: [
          { type: "string", name: "titulo", label: "Título", isTitle: true, required: true },
          { type: "number", name: "ordem", label: "Ordem", required: true },
          { type: "string", name: "modelo", label: "Layout", required: true, options: [
            { label: "Projeto narrativo", value: "narrativo" },
            { label: "Galeria foto still", value: "galeria-still" },
            { label: "Fotografia digital", value: "fotografia-digital" },
            { label: "Vídeo vertical", value: "video-vertical" },
            { label: "Roteiro", value: "roteiro" },
          ] },
          { type: "string", name: "categoria", label: "Categoria", required: true, options: ["producao", "fotografia", "edicao", "diversos"] },
          { type: "string", name: "subcategoria", label: "Subcategoria", options: ["direcao-foto", "foto-still", "fotografia-digital", "direcao", "direcao-som", "roteiros"] },
          { type: "string", name: "eyebrow", label: "Linha de identificação", required: true },
          { type: "string", name: "resumo", label: "Resumo curto", required: true, ui: { component: "textarea" } },
          { type: "string", name: "descricaoSeo", label: "Descrição para buscadores", ui: { component: "textarea" } },
          { type: "image", name: "capa", label: "Imagem de capa", required: true },
          { type: "string", name: "capaAlt", label: "Descrição acessível da capa", required: true },
          { type: "object", name: "fatos", label: "Informações rápidas", list: true, fields: pairFields("Rótulo", "Valor") },
          { type: "rich-text", name: "body", label: "Texto sobre o projeto", isBody: true },
          { type: "string", name: "linkExterno", label: "Link externo" },
          { type: "string", name: "linkTexto", label: "Texto do link" },
          { type: "string", name: "logline", label: "Logline (roteiros)", ui: { component: "textarea" } },
          { type: "object", name: "blocosRoteiro", label: "Blocos do roteiro", list: true, fields: [
            { type: "string", name: "titulo", label: "Título", required: true },
            { type: "string", name: "texto", label: "Texto", required: true, ui: { component: "textarea" } },
          ] },
          { type: "string", name: "trecho", label: "Trecho do roteiro", ui: { component: "textarea" } },
          { type: "object", name: "galeria", label: "Galeria", list: true, fields: [
            { type: "image", name: "arquivo", label: "Imagem", required: true },
            { type: "string", name: "alt", label: "Descrição acessível", required: true },
          ] },
          { type: "object", name: "creditos", label: "Créditos", list: true, fields: pairFields("Função", "Nome") },
          { type: "string", name: "layout", label: "Template interno", ui: { component: "hidden" } },
          { type: "string", name: "permalink", label: "Endereço interno", ui: { component: "hidden" } },
          { type: "string", name: "tags", label: "Coleção interna", ui: { component: "hidden" } },
        ],
        defaultItem: () => ({
          ordem: 99,
          modelo: "narrativo",
          categoria: "producao",
          layout: "project-page.njk",
          permalink: "projetos/projeto-{{ page.fileSlug }}/index.html",
          tags: "projeto",
        }),
      },
    ],
  },
});
