var o=document.querySelector("#navigation");function c(){o.removeAttribute("aria-hidden");let e=o.querySelectorAll("[tabindex='-1']");for(let t of Array.from(e))t.removeAttribute("tabindex")}function a(){o.setAttribute("aria-hidden","true");let e=o.querySelectorAll("a, button, input");for(let t of Array.from(e))t.tabIndex=-1}function l(){o.setAttribute("aria-hidden","false");let e=o.querySelectorAll("[tabindex='-1']");for(let t of Array.from(e))t.removeAttribute("tabindex")}var r=matchMedia("(min-width: 960px)"),n=!r.matches;r.onchange=e=>{n=!e.matches,n?a():c()};n&&a();var s=document.querySelectorAll('[data-js="navigation"]');for(let e of Array.from(s)){let t=e;t.onclick=()=>{o.getAttribute("aria-hidden")!=="false"?l():a()}}o.addEventListener("focusout",e=>{if(!n)return;let t=e.relatedTarget;t&&!o.contains(t)&&a()});o.addEventListener("keydown",e=>{!n||e.code==="Escape"&&a()});var i=document.querySelectorAll('[data-js="colorscheme"]');for(let e of Array.from(i)){let t=e;t.onclick=()=>{localStorage.setItem("colorscheme",t.value),document.documentElement.classList.remove("night","day"),document.documentElement.classList.add(t.value)}}
