// lib
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.js";
import type { HelmetServerState } from "react-helmet-async";

import type { Page, PageProps } from "./types";

export default function render(page: Page, props: PageProps) {
  const markup = renderToStaticMarkup(createElement(page.default, props));
  return html(markup, page.head.helmet);
}

function html(markup: string, helmet: HelmetServerState) {
  const html = helmet.htmlAttributes.toString();
  const body = helmet.bodyAttributes.toString();
  return [
    `<!DOCTYPE html>`,
    `<html${html.length ? " " + html : ""}>`,
    `  <head>`,
    `    ` + helmet.title.toString().replace(rh, ""),
    `    ` + helmet.meta.toString().replace(rh, ""),
    `    ` + helmet.link.toString().replace(rh, ""),
    `    ` + helmet.script.toString().replace(rh, ""),
    `  </head>`,
    `  <body ${body.length ? " " + body : ""}>`,
    markup,
    `  </body>`,
    `</html>`
  ].join("\n");
}

const rh = / data-rh="true"/g;
