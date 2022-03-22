// lib
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.js";
import type { HelmetServerState } from "react-helmet-async";

import type { Page, PageProps } from "./types";

export default function render(page: Page, props: PageProps) {
  try {
    const markup = renderToStaticMarkup(createElement(page.default, props));
    return html(markup, page.head.helmet);
  } catch (e: any) {
    if (!(e instanceof Error)) throw e;

    // since the module code is URI-encoded, overwrite the stack trace with a decoded version for readability
    e.stack = (e.stack || "")
      .split("\n")
      .map((frame, i) => {
        if (i === 0) return frame;

        let [, s, name, body = "", line, col] =
          frame.match(/(\s*)at (\w+) \((.*):(\d+):(\d+)\)/) ?? [];
        body = body.replace("data:text/javascript;charset=utf-8,", "");
        return `${s} at ${name} (${decodeURIComponent(body)}:${line}:${col})`;
      })
      .join("\n");

    throw e;
  }
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
