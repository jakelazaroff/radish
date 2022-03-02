// lib
import prettier from "prettier";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.js";
import type { HelmetServerState } from "react-helmet-async";

import type { Page } from "./types";

export default function render(component: Page, props: { path: string }) {
  try {
    const markup = renderToStaticMarkup(
      createElement(component.default, props)
    );

    return html(markup, component.head.helmet);
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
  const final = [
    `<!DOCTYPE html>`,
    `<html${html.length ? " " + html : ""}>`,
    `  <head>`,
    helmet.title.toString().replace(rh, ""),
    helmet.meta.toString().replace(rh, ""),
    helmet.link.toString().replace(rh, ""),
    helmet.script.toString().replace(rh, ""),
    `  </head>`,
    `  <body ${body.length ? " " + body : ""}>`,
    markup,
    `  </body>`,
    `</html>`
  ].join("\n");

  return prettier.format(final, { parser: "html" });
}

const rh = / data-rh="true"/g;
