export type {};

const navigation = document.querySelector("#navigation") as HTMLElement;

const mq = matchMedia("(min-width: 960px)");
let mobile = !mq.matches;
mq.onchange = e => {
  mobile = !e.matches;
  if (mobile) navigation.setAttribute("aria-hidden", "true");
};

if (mobile) navigation.setAttribute("aria-hidden", "true");

const themes = document.querySelectorAll(`[data-js="colorscheme"]`);
for (const el of Array.from(themes)) {
  const button = el as HTMLButtonElement;
  button.onclick = () => {
    localStorage.setItem("colorscheme", button.value);
    document.documentElement.classList.remove("night", "day");
    document.documentElement.classList.add(button.value);
  };
}

const toggles = document.querySelectorAll(`[data-js="navigation"]`)!;
for (const el of Array.from(toggles)) {
  const toggle = el as HTMLElement;
  toggle.onclick = () => {
    const hidden = navigation.getAttribute("aria-hidden") === "true";
    if (hidden) navigation.setAttribute("aria-hidden", "false");
    else navigation.setAttribute("aria-hidden", "true");
  };
}

navigation.addEventListener("focusin", e => {
  const focused = e.target as HTMLElement | null;
  if (focused && navigation.contains(focused)) navigation.ariaHidden = "false";
});

navigation.addEventListener("focusout", e => {
  const focused = e.relatedTarget as HTMLElement | null;
  if (focused && !navigation.contains(focused))
    navigation.setAttribute("aria-hidden", "true");
});

navigation.addEventListener("keydown", e => {
  if (e.code === "Escape") navigation.setAttribute("aria-hidden", "true");
});
