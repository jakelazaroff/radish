export type {};

window.onclick = e => {
  const target = e.target as HTMLElement;
  if (target.tagName === "BUTTON" && target.dataset["js"] === "colorscheme") {
    toggleColorScheme(target as HTMLButtonElement);
  }
  return;
};

function toggleColorScheme(input: HTMLButtonElement) {
  localStorage.setItem("colorscheme", input.value);
  document.documentElement.classList.remove("night", "day");
  document.documentElement.classList.add(input.value);
}
