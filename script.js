const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");
const menuLinks = document.querySelectorAll(".menu a");
const year = document.querySelector("#current-year");
const filterButtons = document.querySelectorAll(".filter-button");
const subcategoryGroups = document.querySelectorAll(".subcategory-filters");
const subcategoryButtons = document.querySelectorAll(".subcategory-button");
const projectList = document.querySelector(".project-list");
const projects = sortProjectElements([...document.querySelectorAll(".project")]);
const filterResult = document.querySelector(".filter-result");
const heroCarousel = document.querySelector("[data-hero-carousel]");

if (heroCarousel) {
  const heroSlides = [...heroCarousel.querySelectorAll(".hero-slide")];
  const currentFrame = heroCarousel.querySelector("[data-frame-current]");
  const previousButton = heroCarousel.querySelector("[data-hero-previous]");
  const nextButton = heroCarousel.querySelector("[data-hero-next]");
  let activeSlide = 0;
  let pointerStartX = null;

  const showHeroSlide = (index) => {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    if (currentFrame) currentFrame.textContent = String(activeSlide + 1).padStart(2, "0");
  };

  previousButton?.addEventListener("click", () => showHeroSlide(activeSlide - 1));
  nextButton?.addEventListener("click", () => showHeroSlide(activeSlide + 1));

  heroCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showHeroSlide(activeSlide - 1);
    if (event.key === "ArrowRight") showHeroSlide(activeSlide + 1);
  });

  heroCarousel.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  heroCarousel.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 45) showHeroSlide(activeSlide + (distance < 0 ? 1 : -1));
    pointerStartX = null;
  });
}

function getProjectOrder(project, originalIndex) {
  const configuredOrder = Number(project.dataset.order);

  return Number.isFinite(configuredOrder) && configuredOrder > 0
    ? configuredOrder - 0.5
    : originalIndex + 1;
}

function sortProjectElements(elements) {
  return elements
    .map((project, originalIndex) => ({
      project,
      originalIndex,
      order: getProjectOrder(project, originalIndex),
    }))
    .sort((first, second) => first.order - second.order || first.originalIndex - second.originalIndex)
    .map(({ project }) => project);
}

if (projectList) projects.forEach((project) => projectList.append(project));

function getProjectKey(path, baseUrl = window.location.href) {
  const url = new URL(path, baseUrl);
  let normalizedPath = decodeURIComponent(url.pathname).replace(/\/index\.html$/, "/");

  if (normalizedPath.length > 1) normalizedPath = normalizedPath.replace(/\/$/, "");

  return normalizedPath.toLowerCase();
}

function readProjectCatalog(documentSource, indexUrl) {
  const registeredProjects = new Set();

  return sortProjectElements([...documentSource.querySelectorAll(".project")])
    .map((project) => {
      const title = project.querySelector(".project-info h3")?.textContent.trim();
      const link = project.querySelector(".project-info a[href]")?.getAttribute("href");
      const url = link ? new URL(link, indexUrl).href : "";
      const key = url ? getProjectKey(url) : "";

      return { title, url, key };
    })
    .filter((project) => {
      if (!project.title || !project.key || registeredProjects.has(project.key)) return false;
      registeredProjects.add(project.key);
      return true;
    });
}

async function setupProjectNavigation() {
  const nextLink = document.querySelector(".next-project");

  if (!nextLink) return;

  const previousLink = document.createElement("a");
  const previousLabel = document.createElement("span");
  const previousTitle = document.createElement("strong");

  previousLink.className = "previous-project";
  previousLink.href = "../index.html#trabalhos";
  previousLabel.textContent = "← Projeto anterior";
  previousTitle.textContent = "Carregando…";
  previousLink.append(previousLabel, previousTitle);
  nextLink.before(previousLink);

  const nextLabel = nextLink.querySelector("span");
  const nextTitle = nextLink.querySelector("strong");
  const homeUrl = document.querySelector(".logo")?.href || new URL("/", window.location.href).href;
  const worksUrl = new URL("#trabalhos", homeUrl).href;

  try {
    const response = await fetch(homeUrl);
    if (!response.ok) throw new Error("Não foi possível carregar a lista de projetos.");

    const indexContent = await response.text();
    const indexDocument = new DOMParser().parseFromString(indexContent, "text/html");
    const catalog = readProjectCatalog(indexDocument, response.url);
    const currentProjectKey = getProjectKey(window.location.href);
    const currentIndex = catalog.findIndex((project) => project.key === currentProjectKey);

    if (currentIndex < 0 || catalog.length < 2) {
      throw new Error("Projeto atual não encontrado na página inicial.");
    }

    const previousProject = catalog[(currentIndex - 1 + catalog.length) % catalog.length];
    const nextProject = catalog[(currentIndex + 1) % catalog.length];

    previousLink.href = previousProject.url;
    previousLink.setAttribute("aria-label", `Voltar para o projeto anterior: ${previousProject.title}`);
    previousTitle.textContent = previousProject.title;

    nextLink.href = nextProject.url;
    nextLink.setAttribute("aria-label", `Ir para o próximo projeto: ${nextProject.title}`);
    nextTitle.textContent = `${nextProject.title} →`;
  } catch (error) {
    previousLink.hidden = true;
    nextLink.href = worksUrl;
    nextLabel.textContent = "Navegação";
    nextTitle.textContent = "Ver todos os projetos →";
  }
}

setupProjectNavigation();

function numberProjects() {
  projects.forEach((project, index) => {
    const numberElement = project.querySelector(".project-image > span");

    if (numberElement) {
      numberElement.textContent = String(index + 1).padStart(2, "0");
    }
  });
}

numberProjects();

function closeMenu() {
  menu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menu.classList.toggle("open", !isOpen);
  document.body.style.overflow = isOpen ? "" : "hidden";
});

menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
year.textContent = new Date().getFullYear();

const categoryNames = {
  todos: "todos os trabalhos",
  producao: "trabalhos de produção",
  fotografia: "trabalhos de fotografia",
  edicao: "trabalhos de edição",
  diversos: "trabalhos diversos",
};

const subcategoryNames = {
  "direcao-foto": "direção de foto",
  "foto-still": "foto still",
  "fotografia-digital": "fotografia digital",
  direcao: "direção",
  "direcao-som": "direção de som",
  roteiros: "roteiros",
};

function filterProjects(category, subcategory = "todos") {
  projects.forEach((project) => {
    const matchesCategory =
      category === "todos" || project.dataset.category === category;
    const matchesSubcategory =
      subcategory === "todos" || project.dataset.subcategory === subcategory;

    project.hidden = !(matchesCategory && matchesSubcategory);
  });
}

function showSubcategoryGroup(category) {
  subcategoryGroups.forEach((group) => {
    group.hidden = group.dataset.category !== category;

    group.querySelectorAll(".subcategory-button").forEach((button) => {
      const isAllButton = button.dataset.subfilter === "todos";
      button.classList.toggle("active", isAllButton);
      button.setAttribute("aria-pressed", String(isAllButton));
    });
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    showSubcategoryGroup(selectedCategory);
    filterProjects(selectedCategory);

    filterResult.textContent = `Exibindo ${categoryNames[selectedCategory]}`;
  });
});

subcategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".subcategory-filters");
    const selectedCategory = group.dataset.category;
    const selectedSubcategory = button.dataset.subfilter;

    group.querySelectorAll(".subcategory-button").forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    filterProjects(selectedCategory, selectedSubcategory);
    filterResult.textContent =
      selectedSubcategory === "todos"
        ? `Exibindo ${categoryNames[selectedCategory]}`
        : `Exibindo trabalhos de ${subcategoryNames[selectedSubcategory]}`;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
