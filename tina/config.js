import { defineConfig, SelectField } from "tinacms";

const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
const basePath = process.env.TINA_PUBLIC_BASE_PATH || "";

const pairFields = (labelOne, labelTwo) => [
  { type: "string", name: "rotulo", label: labelOne, required: true },
  { type: "string", name: "valor", label: labelTwo, required: true },
];

const fieldValue = (form, name) => form.getFieldState(name)?.value;

const categoryOptions = {
  fotografia: [
    { label: "Direção de foto", value: "direcao-foto" },
    { label: "Foto still", value: "foto-still" },
    { label: "Fotografia digital", value: "fotografia-digital" },
  ],
  diversos: [
    { label: "Direção", value: "direcao" },
    { label: "Direção de som", value: "direcao-som" },
    { label: "Roteiros", value: "roteiros" },
  ],
};

const SubcategoryField = (props) => {
  const options = categoryOptions[fieldValue(props.form, "categoria")];
  return options ? SelectField({ ...props, field: { ...props.field, options } }) : null;
};

const requiredHttpsUrl = (value) => {
  if (!value) return;
  try {
    if (new URL(value).protocol !== "https:") return "Use uma URL completa começando com https://";
  } catch {
    return "Informe uma URL HTTPS válida";
  }
};
const validEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Informe um e-mail válido";

const hiddenField = (name, label, required = true) => ({ type: "string", name, label, required, ui: { component: "hidden" } });
const titleAndOrderFields = () => [
  { type: "string", name: "titulo", label: "Título do projeto", isTitle: true, required: true },
  { type: "number", name: "ordem", label: "Posição na página inicial", required: true, ui: { validate: (value) => Number.isInteger(value) && value > 0 || "Use um número inteiro maior que zero" } },
];
const commonProjectFields = () => [
  { type: "string", name: "eyebrow", label: "Categoria exibida acima do título", required: true },
  { type: "string", name: "resumo", label: "Resumo do projeto", required: true, ui: { component: "textarea" } },
  { type: "string", name: "descricaoSeo", label: "Descrição para Google e compartilhamentos", required: true, ui: { component: "textarea", validate: (value) => value?.length >= 40 && value.length <= 180 || "Use entre 40 e 180 caracteres" } },
  { type: "image", name: "capa", label: "Imagem principal do projeto", required: true },
  { type: "string", name: "capaAlt", label: "Descrição acessível da imagem principal", required: true },
  {
    type: "object",
    name: "fatos",
    label: "Informações em destaque",
    description: "Ao adicionar, substitua os textos iniciais pelo nome e pelo conteúdo da informação.",
    list: true,
    defaultItem: { rotulo: "Informação", valor: "A definir" },
    ui: {
      itemProps: (item) => ({
        label: item?.rotulo && item?.valor ? `${item.rotulo}: ${item.valor}` : item?.rotulo || "Nova informação",
      }),
    },
    fields: pairFields("Nome da informação", "Conteúdo da informação"),
  },
  { type: "rich-text", name: "body", label: "Descrição completa do projeto", isBody: true },
  { type: "string", name: "linkExterno", label: "Endereço do link externo", ui: { validate: requiredHttpsUrl } },
  { type: "string", name: "linkTexto", label: "Texto do botão externo" },
];
const galleryField = () => ({ type: "object", name: "galeria", label: "Imagens da galeria", list: true, ui: { itemProps: (item) => ({ label: item?.alt || item?.arquivo?.split("/").pop() || "Nova imagem" }) }, fields: [
  { type: "image", name: "arquivo", label: "Arquivo da imagem", required: true },
  { type: "string", name: "alt", label: "Descrição acessível da imagem", required: true },
] });
const creditsField = () => ({ type: "object", name: "creditos", label: "Equipe e créditos", list: true, ui: { itemProps: (item) => ({ label: item?.rotulo && item?.valor ? `${item.rotulo} — ${item.valor}` : item?.rotulo || item?.valor || "Novo crédito" }) }, fields: pairFields("Função no projeto", "Pessoa ou empresa responsável") });
const variantField = () => ({ type: "string", name: "variantClass", label: "Variação visual interna", ui: { component: "hidden" } });
const fixedClassification = (model) => [hiddenField("modelo", "Modelo"), hiddenField("categoria", "Categoria"), ...(model.subcategoria ? [hiddenField("subcategoria", "Subcategoria", false)] : [])];
const defaultItem = (modelo, categoria, subcategoria) => ({ ordem: 99, modelo, categoria, ...(subcategoria ? { subcategoria } : {}) });

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
          { type: "string", name: "seoDescription", label: "Descrição para buscadores", required: true, ui: { component: "textarea", validate: (value) => value?.length >= 50 && value.length <= 160 || "Use entre 50 e 160 caracteres" } },
          { type: "string", name: "heroEyebrow", label: "Linha acima do título" },
          { type: "string", name: "heroTitle", label: "Título principal", description: "Use Enter para começar a segunda linha. A última linha recebe o destaque em itálico automaticamente.", ui: { component: "textarea" } },
          { type: "string", name: "heroIntro", label: "Texto de abertura", ui: { component: "textarea" } },
          { type: "object", name: "heroSlides", label: "Imagens de destaque da página inicial", description: "Adicione de 1 a 10 imagens. A ordem desta lista será a ordem exibida no carrossel.", list: true, required: true, ui: { min: 1, max: 10, itemProps: (item) => ({ label: item?.descricao || "Imagem de destaque" }) }, fields: [
            { type: "image", name: "imagem", label: "Arquivo da imagem", required: true },
            { type: "string", name: "descricao", label: "Descrição da imagem", description: "Explique brevemente o que aparece na imagem para pessoas que usam leitores de tela.", required: true },
          ] },
          { type: "string", name: "worksTitle", label: "Título dos trabalhos" },
          { type: "string", name: "worksIntro", label: "Introdução dos trabalhos", ui: { component: "textarea" } },
          { type: "string", name: "aboutTitle", label: "Título da seção Sobre", description: "Use Enter antes do trecho que deve aparecer em itálico.", ui: { component: "textarea" } },
          { type: "string", name: "aboutText", label: "Texto da seção Sobre", description: "Use uma linha em branco para separar os parágrafos. Não é necessário escrever códigos HTML.", ui: { component: "textarea" } },
          { type: "string", name: "contactEyebrow", label: "Linha acima do contato" },
          { type: "string", name: "contactTitle", label: "Título do contato", description: "Use Enter antes do trecho que deve aparecer em itálico.", ui: { component: "textarea" } },
          { type: "string", name: "email", label: "E-mail", required: true, ui: { validate: validEmail } },
          { type: "string", name: "whatsappLabel", label: "WhatsApp exibido" },
          { type: "string", name: "whatsappUrl", label: "Link do WhatsApp", required: true, ui: { validate: requiredHttpsUrl } },
          { type: "string", name: "linkedinLabel", label: "LinkedIn exibido" },
          { type: "string", name: "linkedinUrl", label: "Link do LinkedIn", required: true, ui: { validate: requiredHttpsUrl } },
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
        templates: [
          {
            name: "narrativo", label: "Projeto narrativo", ui: { defaultItem: defaultItem("narrativo", "producao") }, fields: [
              ...titleAndOrderFields(),
              hiddenField("modelo", "Modelo"),
              { type: "string", name: "categoria", label: "Categoria principal", required: true, options: [
                { label: "Produção", value: "producao" }, { label: "Fotografia", value: "fotografia" }, { label: "Edição", value: "edicao" }, { label: "Diversos", value: "diversos" },
              ] },
              { type: "string", name: "subcategoria", label: "Tipo específico", ui: { component: SubcategoryField }, options: ["direcao-foto", "foto-still", "fotografia-digital", "direcao", "direcao-som", "roteiros"] },
              ...commonProjectFields(), galleryField(), creditsField(), variantField(),
            ],
          },
          { name: "galeria_still", label: "Galeria foto still", ui: { defaultItem: defaultItem("galeria-still", "fotografia", "foto-still") }, fields: [...titleAndOrderFields(), ...fixedClassification({ subcategoria: true }), ...commonProjectFields(), galleryField(), creditsField(), variantField()] },
          { name: "fotografia_digital", label: "Fotografia digital", ui: { defaultItem: defaultItem("fotografia-digital", "fotografia", "fotografia-digital") }, fields: [...titleAndOrderFields(), ...fixedClassification({ subcategoria: true }), ...commonProjectFields(), galleryField(), creditsField(), variantField()] },
          { name: "video_vertical", label: "Vídeo vertical", ui: { defaultItem: defaultItem("video-vertical", "fotografia", "direcao-foto") }, fields: [...titleAndOrderFields(), ...fixedClassification({ subcategoria: true }), ...commonProjectFields(), variantField()] },
          { name: "roteiro", label: "Roteiro", ui: { defaultItem: defaultItem("roteiro", "diversos", "roteiros") }, fields: [
            ...titleAndOrderFields(), ...fixedClassification({ subcategoria: true }), ...commonProjectFields(),
            { type: "string", name: "logline", label: "Logline", required: true, ui: { component: "textarea" } },
            { type: "object", name: "blocosRoteiro", label: "Seções do roteiro", list: true, ui: { itemProps: (item) => ({ label: item?.titulo || "Nova seção" }) }, fields: [
              { type: "string", name: "titulo", label: "Título da seção", required: true }, { type: "string", name: "texto", label: "Texto", required: true, ui: { component: "textarea" } },
            ] },
            { type: "string", name: "trecho", label: "Trecho de exemplo", ui: { component: "textarea" } }, creditsField(), variantField(),
          ] },
        ],
      },
    ],
  },
});
