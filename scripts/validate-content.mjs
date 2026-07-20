import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const projectDirectory = path.resolve("src/projetos");
const repositoryRoot = path.resolve(".");
const files = readdirSync(projectDirectory).filter((file) => file.endsWith(".md"));
const errors = [];
const orders = new Map();

const nonEmptyString = z.string().trim().min(1, "não pode ficar vazio");
const httpsUrl = z.string().url("deve ser uma URL completa").refine((value) => new URL(value).protocol === "https:", "deve usar HTTPS");
const pairSchema = z.object({ rotulo: nonEmptyString, valor: nonEmptyString });
const imageSchema = z.object({ arquivo: nonEmptyString, alt: nonEmptyString });
const categoryOptions = {
  fotografia: new Set(["direcao-foto", "foto-still", "fotografia-digital"]),
  diversos: new Set(["direcao", "direcao-som", "roteiros"]),
};
const templateByModel = {
  narrativo: "narrativo",
  "galeria-still": "galeria_still",
  "fotografia-digital": "fotografia_digital",
  "video-vertical": "video_vertical",
  roteiro: "roteiro",
};
const fixedClassification = {
  "galeria-still": { categoria: "fotografia", subcategoria: "foto-still" },
  "fotografia-digital": { categoria: "fotografia", subcategoria: "fotografia-digital" },
  "video-vertical": { categoria: "fotografia", subcategoria: "direcao-foto" },
  roteiro: { categoria: "diversos", subcategoria: "roteiros" },
};

const projectSchema = z.object({
  _template: z.enum(["narrativo", "galeria_still", "fotografia_digital", "video_vertical", "roteiro"]),
  titulo: nonEmptyString,
  ordem: z.number().int().positive(),
  modelo: z.enum(["narrativo", "galeria-still", "fotografia-digital", "video-vertical", "roteiro"]),
  categoria: z.enum(["producao", "fotografia", "edicao", "diversos"]),
  subcategoria: nonEmptyString.optional(),
  eyebrow: nonEmptyString,
  resumo: nonEmptyString,
  descricaoSeo: z.string().trim().min(40).max(180),
  capa: nonEmptyString,
  capaAlt: z.string().trim().min(12, "deve descrever a imagem de forma específica"),
  fatos: z.array(pairSchema).min(1, "deve ter pelo menos uma informação"),
  linkExterno: httpsUrl.optional(),
  linkTexto: nonEmptyString.optional(),
  galeria: z.array(imageSchema).min(1).optional(),
  creditos: z.array(pairSchema).min(1).optional(),
  variantClass: z.string().trim().regex(/^[a-z][a-z0-9-]*$/, "deve ser uma classe CSS simples").optional(),
  logline: nonEmptyString.optional(),
  blocosRoteiro: z.array(z.object({ titulo: nonEmptyString, texto: nonEmptyString })).min(1).optional(),
  trecho: nonEmptyString.optional(),
}).passthrough().superRefine((data, context) => {
  if (templateByModel[data.modelo] !== data._template) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["_template"], message: `não corresponde ao modelo '${data.modelo}'` });
  }

  const fixed = fixedClassification[data.modelo];
  if (fixed) {
    for (const [field, expected] of Object.entries(fixed)) {
      if (data[field] !== expected) context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `deve ser '${expected}' para o modelo '${data.modelo}'` });
    }
  } else {
    const allowedModels = { producao: "narrativo", edicao: "narrativo", fotografia: "narrativo", diversos: "narrativo" };
    if (allowedModels[data.categoria] !== data.modelo) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["categoria"], message: `não é compatível com o modelo '${data.modelo}'` });
    }
    const allowedSubcategories = categoryOptions[data.categoria];
    if (data.subcategoria && !allowedSubcategories?.has(data.subcategoria)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["subcategoria"], message: `não é compatível com a categoria '${data.categoria}'` });
    }
    if (!allowedSubcategories && data.subcategoria) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["subcategoria"], message: `não deve existir para a categoria '${data.categoria}'` });
    }
  }

  if (Boolean(data.linkExterno) !== Boolean(data.linkTexto)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["linkExterno"], message: "linkExterno e linkTexto devem ser preenchidos juntos" });
  }
  if (["galeria-still", "fotografia-digital"].includes(data.modelo) && !data.galeria?.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["galeria"], message: "é obrigatória para este modelo" });
  }
  if (data.modelo === "roteiro") {
    if (!data.logline) context.addIssue({ code: z.ZodIssueCode.custom, path: ["logline"], message: "é obrigatória para roteiros" });
    if (!data.blocosRoteiro?.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ["blocosRoteiro"], message: "deve ter pelo menos uma seção" });
  }
});

const siteSchema = z.object({
  siteUrl: httpsUrl,
  socialImage: nonEmptyString,
  structuredData: z.record(z.unknown()),
  seoDescription: z.string().trim().min(50).max(160),
  heroEyebrow: nonEmptyString,
  heroTitle: nonEmptyString,
  heroIntro: nonEmptyString,
  heroSlides: z.array(z.object({ imagem: nonEmptyString, descricao: nonEmptyString })).min(1).max(10),
  worksTitle: nonEmptyString,
  worksIntro: nonEmptyString,
  aboutTitle: nonEmptyString,
  aboutText: nonEmptyString,
  contactEyebrow: nonEmptyString,
  contactTitle: nonEmptyString,
  email: z.string().email(),
  whatsappLabel: nonEmptyString,
  whatsappUrl: httpsUrl,
  linkedinLabel: nonEmptyString,
  linkedinUrl: httpsUrl,
}).passthrough();

const formatIssues = (prefix, issues) => issues.forEach((issue) => {
  errors.push(`${prefix}: ${issue.path.join(".") || "conteúdo"} ${issue.message}`);
});

const validateLocalFile = (file, fieldName, value) => {
  if (!value) return;
  const candidate = path.resolve(String(value).replace(/^\//, ""));
  const isInsideRepository = candidate.startsWith(`${repositoryRoot}${path.sep}`);
  if (!isInsideRepository || !existsSync(candidate)) errors.push(`${file}: ${fieldName} não encontrado ou fora do repositório (${value})`);
};

for (const file of files) {
  let document;
  try {
    document = matter(readFileSync(path.join(projectDirectory, file), "utf8"));
  } catch (error) {
    errors.push(`${file}: front matter inválido (${error.message})`);
    continue;
  }

  const result = projectSchema.safeParse(document.data);
  if (!result.success) {
    formatIssues(file, result.error.issues);
    continue;
  }

  const data = result.data;
  if (orders.has(data.ordem)) errors.push(`${file}: ordem ${data.ordem} também é usada por ${orders.get(data.ordem)}`);
  orders.set(data.ordem, file);
  validateLocalFile(file, "capa", data.capa);
  data.galeria?.forEach((image, index) => validateLocalFile(file, `galeria.${index}.arquivo`, image.arquivo));
  for (const internalField of ["layout", "permalink", "tags"]) {
    if (Object.hasOwn(data, internalField)) errors.push(`${file}: campo técnico '${internalField}' deve ficar no data cascade`);
  }
}

try {
  const site = JSON.parse(readFileSync(path.resolve("src/_data/site.json"), "utf8"));
  const result = siteSchema.safeParse(site);
  if (!result.success) formatIssues("site.json", result.error.issues);
  else result.data.heroSlides.forEach((slide, index) => validateLocalFile("site.json", `heroSlides.${index}.imagem`, slide.imagem));
} catch (error) {
  errors.push(`site.json: JSON inválido (${error.message})`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${files.length} projetos e o conteúdo global foram validados com sucesso.`);
}
