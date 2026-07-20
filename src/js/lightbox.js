export function initLightbox() {
  const images = [...document.querySelectorAll(".gallery-placeholder img, .photo-frame img, .digital-frame img, .still-frame img")];
  if (!images.length) return;
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Visualização ampliada da imagem");
  lightbox.innerHTML = `<button class="image-lightbox-close" type="button" aria-label="Fechar imagem">×</button><button class="image-lightbox-previous" type="button" aria-label="Imagem anterior">←</button><figure><img src="" alt="" /><figcaption><span data-lightbox-caption></span><span data-lightbox-count></span></figcaption></figure><button class="image-lightbox-next" type="button" aria-label="Próxima imagem">→</button>`;
  document.body.append(lightbox);
  const expanded = lightbox.querySelector("figure img");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const count = lightbox.querySelector("[data-lightbox-count]");
  const closeButton = lightbox.querySelector(".image-lightbox-close");
  const previousButton = lightbox.querySelector(".image-lightbox-previous");
  const nextButton = lightbox.querySelector(".image-lightbox-next");
  const background = [document.querySelector("main"), document.querySelector(".site-header"), document.querySelector("footer")].filter(Boolean);
  let active = 0;
  let previouslyFocused;

  const show = (index) => {
    active = (index + images.length) % images.length;
    const source = images[active];
    expanded.src = source.currentSrc || source.src;
    expanded.alt = source.alt;
    caption.textContent = source.alt;
    count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
  };
  const open = (index) => {
    previouslyFocused = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    background.forEach((element) => element.setAttribute("inert", ""));
    closeButton.focus();
  };
  const close = () => {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    background.forEach((element) => element.removeAttribute("inert"));
    expanded.src = "";
    previouslyFocused?.focus();
  };

  images.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Ampliar: ${image.alt || "imagem da galeria"}`);
    image.addEventListener("click", () => open(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(index); }
    });
  });
  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", () => show(active - 1));
  nextButton.addEventListener("click", () => show(active + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(active - 1);
    if (event.key === "ArrowRight") show(active + 1);
    if (event.key === "Tab") {
      const controls = [closeButton, previousButton, nextButton];
      const index = controls.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && index === controls.length - 1) { event.preventDefault(); controls[0].focus(); }
    }
  });
}
