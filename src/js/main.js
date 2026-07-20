import { initCarousel } from "./carousel.js";
import { initLightbox } from "./lightbox.js";
import { initMenu } from "./menu.js";
import { initProjects } from "./projects.js";
import { initReveal } from "./reveal.js";

initMenu();
initCarousel();
initLightbox();
initProjects();
initReveal();
const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();
