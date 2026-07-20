export function initMenu() {
  const button = document.querySelector(".menu-button");
  const menu = document.querySelector(".menu");
  if (!button || !menu) return;

  const close = () => {
    menu.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willOpen));
    menu.classList.toggle("open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      close();
      button.focus();
    }
  });
}
