// lib
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.js";
import type { HelmetServerState } from "react-helmet-async";

import type { Page, PageProps } from "./types";

export interface RenderError {
  type: string;
  message: string;
  file: string;
  fn: string;
  line: string;
  lineNo: number;
  colNo: number;
}

export default function render(page: Page, props: PageProps) {
  try {
    const markup = renderToStaticMarkup(createElement(page.default, props));
    return html(markup, page.head.helmet);
  } catch (e: any) {
    if (!(e instanceof Error)) throw e;
    return parseError(e);
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

function parseError(e: Error): RenderError {
  const [, frame] = e.stack?.split("\n") || [];
  if (!frame) throw e;

  const [, fn, body = "", l, c] =
    frame.match(/\s*at (\w+) \((.*):(\d+):(\d+)\)/) ?? [];
  if (!fn || !l || !c) throw e;
  const lineNo = Number(l),
    colNo = Number(c);

  const src = decodeURIComponent(body);
  const lines = src.split("\n");
  let file = "",
    fileLineNo = 0;
  for (let i = lineNo; i >= 0; i--) {
    const line = lines[i];
    if (line?.startsWith("// ")) {
      file = line.slice(3);
      fileLineNo = lineNo - i;
      break;
    }
  }

  if (!file) throw e;

  return {
    type: e.name,
    message: e.message,
    line: lines[lineNo - 1] ?? "",
    lineNo: fileLineNo,
    colNo,
    fn,
    file
  };
}
