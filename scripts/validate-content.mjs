import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const projectDirectory = path.resolve("src/projetos");
const files = readdirSync(projectDirectory).filter((file) => file.endsWith(".md"));
const errors = [];
const orders = new Map();
const allowedCombinations = {
  producao: new Set(["narrativo"]),
  edicao: new Set(["narrativo"]),
  fotografia: new Set(["narrativo", "galeria-still", "fotografia-digital", "video-vertical"]),
  diversos: new Set(["narrativo", "roteiro"]),
};
const templateByModel = {
  narrativo: "narrativo",
  "galeria-still": "galeria_still",
  "fotografia-digital": "fotografia_digital",
  "video-vertical": "video_vertical",
  roteiro: "roteiro",
};

const field = (content, name) => content.match(new RegExp(`^${name}:\\s*["']?([^"'\\r\\n]+)`, "m"))?.[1]?.trim();

for (const file of files) {
  const content = readFileSync(path.join(projectDirectory, file), "utf8");
  const category = field(content, "categoria");
  const model = field(content, "modelo");
  const template = field(content, "_template");
  const order = Number(field(content, "ordem"));
  const cover = field(content, "capa");
  const externalUrl = field(content, "linkExterno");
  const seoDescription = field(content, "descricaoSeo");
  const coverAlt = field(content, "capaAlt");

  if (!allowedCombinations[category]?.has(model)) errors.push(`${file}: combinação categoria/modelo inválida (${category}/${model})`);
  if (templateByModel[model] !== template) errors.push(`${file}: template '${template}' não corresponde ao modelo '${model}'`);
  if (!Number.isInteger(order) || order < 1) errors.push(`${file}: ordem deve ser um inteiro positivo`);
  if (orders.has(order)) errors.push(`${file}: ordem ${order} também é usada por ${orders.get(order)}`);
  orders.set(order, file);
  if (!cover || !existsSync(path.resolve(cover.replace(/^\//, "")))) errors.push(`${file}: imagem de capa não encontrada (${cover || "vazia"})`);
  if (externalUrl && !externalUrl.startsWith("https://")) errors.push(`${file}: linkExterno deve usar HTTPS`);
  if (!seoDescription || seoDescription.length < 40 || seoDescription.length > 180) errors.push(`${file}: descricaoSeo deve ter entre 40 e 180 caracteres`);
  if (!coverAlt || /^(imagem|frame) do projeto$/i.test(coverAlt)) errors.push(`${file}: capaAlt precisa descrever a imagem de forma específica`);
  for (const internalField of ["layout", "permalink", "tags"]) {
    if (field(content, internalField)) errors.push(`${file}: campo técnico '${internalField}' deve ficar no data cascade`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${files.length} projetos validados com sucesso.`);
}
