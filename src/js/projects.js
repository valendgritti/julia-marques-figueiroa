const categoryNames = { todos: "todos os trabalhos", producao: "trabalhos de produção", fotografia: "trabalhos de fotografia", edicao: "trabalhos de edição", diversos: "trabalhos diversos" };
const subcategoryNames = { "direcao-foto": "direção de foto", "foto-still": "foto still", "fotografia-digital": "fotografia digital", direcao: "direção", "direcao-som": "direção de som", roteiros: "roteiros" };

function updateIndexContrast(container) {
  const image = container.querySelector("img");
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return;
  try {
    const scale = Math.max(container.clientWidth / image.naturalWidth, container.clientHeight / image.naturalHeight);
    const visibleWidth = container.clientWidth / scale;
    const visibleHeight = container.clientHeight / scale;
    const sourceX = Math.max(0, (image.naturalWidth - visibleWidth) / 2);
    const sourceY = Math.max(0, (image.naturalHeight - visibleHeight) / 2);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = 24; canvas.height = 24;
    context.drawImage(image, sourceX, sourceY, Math.min(visibleWidth * 0.38, image.naturalWidth - sourceX), Math.min(visibleHeight * 0.58, image.naturalHeight - sourceY), 0, 0, 24, 24);
    const pixels = context.getImageData(0, 0, 24, 24).data;
    let total = 0; let count = 0;
    for (let pixel = 0; pixel < pixels.length; pixel += 4) {
      if (pixels[pixel + 3] < 128) continue;
      total += 0.2126 * pixels[pixel] / 255 + 0.7152 * pixels[pixel + 1] / 255 + 0.0722 * pixels[pixel + 2] / 255;
      count += 1;
    }
    container.classList.toggle("index-on-light", count ? total / count > 0.62 : false);
  } catch { container.classList.remove("index-on-light"); }
}

export function initProjects() {
  const projects = [...document.querySelectorAll(".project")];
  projects.forEach((project, index) => {
    const number = project.querySelector(".project-image > span");
    if (number) number.textContent = String(index + 1).padStart(2, "0");
  });
  document.querySelectorAll(".project-image").forEach((container) => {
    const image = container.querySelector("img");
    if (!image) return;
    if (image.complete) updateIndexContrast(container);
    else image.addEventListener("load", () => updateIndexContrast(container), { once: true });
  });

  const categoryButtons = [...document.querySelectorAll(".filter-button")];
  const subcategoryGroups = [...document.querySelectorAll(".subcategory-filters")];
  const result = document.querySelector(".filter-result");
  const filter = (category, subcategory = "todos") => projects.forEach((project) => {
    project.hidden = !((category === "todos" || project.dataset.category === category) && (subcategory === "todos" || project.dataset.subcategory === subcategory));
  });
  const showSubcategories = (category) => subcategoryGroups.forEach((group) => {
    group.hidden = group.dataset.category !== category;
    group.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.subfilter === "todos";
      button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected));
    });
  });
  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    const category = button.dataset.filter;
    categoryButtons.forEach((item) => { const selected = item === button; item.classList.toggle("active", selected); item.setAttribute("aria-pressed", String(selected)); });
    showSubcategories(category); filter(category);
    if (result) result.textContent = `Exibindo ${categoryNames[category]}`;
  }));
  document.querySelectorAll(".subcategory-button").forEach((button) => button.addEventListener("click", () => {
    const group = button.closest(".subcategory-filters");
    const category = group.dataset.category; const subcategory = button.dataset.subfilter;
    group.querySelectorAll("button").forEach((item) => { const selected = item === button; item.classList.toggle("active", selected); item.setAttribute("aria-pressed", String(selected)); });
    filter(category, subcategory);
    if (result) result.textContent = subcategory === "todos" ? `Exibindo ${categoryNames[category]}` : `Exibindo trabalhos de ${subcategoryNames[subcategory]}`;
  }));
}
