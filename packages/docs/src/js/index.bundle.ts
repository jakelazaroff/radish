export type {};

const navigation = document.querySelector("#navigation") as HTMLElement;

function resetNav() {
  navigation.removeAttribute("aria-hidden");
  const focusable = navigation.querySelectorAll<HTMLElement>("[tabindex='-1']");
  for (const el of Array.from(focusable)) {
    el.removeAttribute("tabindex");
  }
}

function hideNav() {
  navigation.setAttribute("aria-hidden", "true");
  const focusable =
    navigation.querySelectorAll<HTMLElement>("a, button, input");
  for (const el of Array.from(focusable)) {
    el.tabIndex = -1;
  }
}

function showNav() {
  navigation.setAttribute("aria-hidden", "false");
  const focusable = navigation.querySelectorAll<HTMLElement>("[tabindex='-1']");
  for (const el of Array.from(focusable)) {
    el.removeAttribute("tabindex");
  }
}

const mq = matchMedia("(min-width: 960px)");
let mobile = !mq.matches;
mq.onchange = e => {
  mobile = !e.matches;
  if (mobile) hideNav();
  else resetNav();
};

if (mobile) hideNav();

const toggles = document.querySelectorAll(`[data-js="navigation"]`);
for (const el of Array.from(toggles)) {
  const toggle = el as HTMLElement;
  toggle.onclick = () => {
    const hidden = navigation.getAttribute("aria-hidden") !== "false";
    if (hidden) showNav();
    else hideNav();
  };
}

navigation.addEventListener("focusout", e => {
  if (!mobile) return;

  const focused = e.relatedTarget as HTMLElement | null;
  if (focused && !navigation.contains(focused)) hideNav();
});

navigation.addEventListener("keydown", e => {
  if (!mobile) return;

  if (e.code === "Escape") hideNav();
});

const themes = document.querySelectorAll(`[data-js="colorscheme"]`);
for (const el of Array.from(themes)) {
  const button = el as HTMLButtonElement;
  button.onclick = () => {
    localStorage.setItem("colorscheme", button.value);
    document.documentElement.classList.remove("night", "day");
    document.documentElement.classList.add(button.value);
  };
}
