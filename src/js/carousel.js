export function initCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const currentFrame = carousel.querySelector("[data-frame-current]");
  let active = 0;
  let pointerStartX = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === active;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    if (currentFrame) currentFrame.textContent = String(active + 1).padStart(2, "0");
  };

  carousel.querySelector("[data-hero-previous]")?.addEventListener("click", () => show(active - 1));
  carousel.querySelector("[data-hero-next]")?.addEventListener("click", () => show(active + 1));
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(active - 1);
    if (event.key === "ArrowRight") show(active + 1);
  });
  carousel.addEventListener("pointerdown", (event) => { pointerStartX = event.clientX; });
  carousel.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 45) show(active + (distance < 0 ? 1 : -1));
    pointerStartX = null;
  });
}
