import { defineConfig, GroupListField, SelectField, TextField } from "tinacms";

const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
const basePath = process.env.TINA_PUBLIC_BASE_PATH || "";

const pairFields = (labelOne, labelTwo) => [
  { type: "string", name: "rotulo", label: labelOne, required: true },
  { type: "string", name: "valor", label: labelTwo, required: true },
];

const fieldValue = (form, name) => form.getFieldState(name)?.value;

const conditionalField = (Component, isVisible) => (props) =>
  isVisible(props.form) ? Component(props) : null;

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

const layoutOptions = {
  narrativo: { label: "Projeto narrativo", value: "narrativo" },
  still: { label: "Galeria foto still", value: "galeria-still" },
  digital: { label: "Fotografia digital", value: "fotografia-digital" },
  vertical: { label: "Vídeo vertical", value: "video-vertical" },
  roteiro: { label: "Roteiro", value: "roteiro" },
};

const SubcategoryField = (props) => {
  const options = categoryOptions[fieldValue(props.form, "categoria")];
  return options ? SelectField({ ...props, field: { ...props.field, options } }) : null;
};

const LayoutField = (props) => {
  const category = fieldValue(props.form, "categoria");
  const subcategory = fieldValue(props.form, "subcategoria");
  let options = [layoutOptions.narrativo];

  if (subcategory === "foto-still") options = [layoutOptions.still];
  else if (subcategory === "fotografia-digital") options = [layoutOptions.digital];
  else if (subcategory === "roteiros") options = [layoutOptions.roteiro];
  else if (subcategory === "direcao-foto") options = [layoutOptions.narrativo, layoutOptions.vertical];
  else if (category === "fotografia") options = [layoutOptions.narrativo, layoutOptions.still, layoutOptions.digital, layoutOptions.vertical];
  else if (category === "diversos") options = [layoutOptions.narrativo, layoutOptions.roteiro];

  return SelectField({ ...props, field: { ...props.field, options } });
};

const isScript = (form) => fieldValue(form, "modelo") === "roteiro";
const hasGallery = (form) => ["narrativo", "galeria-still", "fotografia-digital"].includes(fieldValue(form, "modelo"));
const hasCredits = (form) => ["narrativo", "fotografia-digital", "roteiro"].includes(fieldValue(form, "modelo"));

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
          { type: "string", name: "titulo", label: "Título do projeto", description: "Nome que aparecerá na página inicial e na página do projeto.", isTitle: true, required: true },
          { type: "number", name: "ordem", label: "Posição na página inicial", description: "Use 1 para o primeiro projeto, 2 para o segundo e assim por diante.", required: true },
          { type: "string", name: "categoria", label: "Categoria principal do projeto", description: "Escolha a área principal em que este projeto será exibido.", required: true, options: [
            { label: "Produção", value: "producao" },
            { label: "Fotografia", value: "fotografia" },
            { label: "Edição", value: "edicao" },
            { label: "Diversos", value: "diversos" },
          ] },
          { type: "string", name: "subcategoria", label: "Tipo específico do projeto", description: "As opções mudam de acordo com a categoria principal escolhida.", ui: { component: SubcategoryField }, options: ["direcao-foto", "foto-still", "fotografia-digital", "direcao", "direcao-som", "roteiros"] },
          { type: "string", name: "modelo", label: "Formato da página do projeto", description: "Define quais blocos de conteúdo aparecerão na página. Escolha o formato que melhor representa o projeto.", required: true, ui: { component: LayoutField }, options: [
            { label: "Projeto narrativo", value: "narrativo" },
            { label: "Galeria foto still", value: "galeria-still" },
            { label: "Fotografia digital", value: "fotografia-digital" },
            { label: "Vídeo vertical", value: "video-vertical" },
            { label: "Roteiro", value: "roteiro" },
          ] },
          { type: "string", name: "eyebrow", label: "Categoria exibida acima do título", description: "Texto curto mostrado acima do título na página do projeto, por exemplo: Produção audiovisual.", required: true },
          { type: "string", name: "resumo", label: "Resumo do projeto", description: "Apresentação curta exibida em destaque na página do projeto.", required: true, ui: { component: "textarea" } },
          { type: "string", name: "descricaoSeo", label: "Descrição para Google e compartilhamentos", description: "Resumo usado por buscadores e redes sociais. Não aparece no conteúdo da página.", ui: { component: "textarea" } },
          { type: "image", name: "capa", label: "Imagem principal do projeto", description: "Imagem exibida na página inicial e no topo da página do projeto.", required: true },
          { type: "string", name: "capaAlt", label: "Descrição da imagem principal", description: "Descreva brevemente o que aparece na imagem para pessoas que usam leitores de tela.", required: true },
          { type: "object", name: "fatos", label: "Informações em destaque", description: "Adicione dados curtos como ano, duração, formato ou cliente.", list: true, fields: pairFields("Nome da informação (ex.: Ano)", "Conteúdo da informação (ex.: 2025)") },
          { type: "rich-text", name: "body", label: "Descrição completa do projeto", description: "Conte a história, o processo e os resultados do projeto.", isBody: true },
          { type: "string", name: "linkExterno", label: "Endereço do link externo", description: "Cole a URL completa, começando com https://." },
          { type: "string", name: "linkTexto", label: "Texto do botão do link externo", description: "Exemplo: Assistir ao filme ou Ver projeto completo." },
          { type: "string", name: "logline", label: "Resumo da história do roteiro (logline)", description: "Descreva a ideia central da história em uma ou duas frases.", ui: { component: conditionalField(TextField, isScript) } },
          { type: "object", name: "blocosRoteiro", label: "Seções do roteiro", description: "Adicione os trechos ou etapas que formarão a apresentação do roteiro.", list: true, ui: { component: conditionalField(GroupListField, isScript) }, fields: [
            { type: "string", name: "titulo", label: "Título da seção do roteiro", required: true },
            { type: "string", name: "texto", label: "Texto da seção do roteiro", required: true, ui: { component: "textarea" } },
          ] },
          { type: "string", name: "trecho", label: "Trecho de exemplo do roteiro", description: "Inclua um pequeno trecho que será destacado na página.", ui: { component: conditionalField(TextField, isScript) } },
          { type: "object", name: "galeria", label: "Imagens da galeria do projeto", description: "Adicione e organize as imagens que aparecerão após a descrição do projeto.", list: true, ui: { component: conditionalField(GroupListField, hasGallery) }, fields: [
            { type: "image", name: "arquivo", label: "Arquivo da imagem", required: true },
            { type: "string", name: "alt", label: "Descrição desta imagem", description: "Explique brevemente o que aparece na imagem.", required: true },
          ] },
          { type: "object", name: "creditos", label: "Equipe e créditos do projeto", description: "Adicione uma linha para cada profissional ou empresa participante.", list: true, ui: { component: conditionalField(GroupListField, hasCredits) }, fields: pairFields("Função no projeto (ex.: Direção)", "Nome da pessoa ou empresa responsável") },
          { type: "string", name: "layout", label: "Template interno", ui: { component: "hidden" } },
          { type: "string", name: "variantClass", label: "Variação visual interna", ui: { component: "hidden" } },
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
