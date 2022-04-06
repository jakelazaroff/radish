import type * as esbuild from "esbuild";

export interface RadishBuildError {
  type: string;
  message: string;
  lineText: string;
  line: number;
  column: number;
}

export interface RadishBuildResult {
  inputFile: string;
  outputFile?: string;
  error?: RadishBuildError;
}

export function fromSuccess(input: string, output: string): RadishBuildResult {
  return {
    inputFile: input,
    outputFile: output
  };
}

export function fromRenderError(e: Error): RadishBuildResult {
  const [, frame] = e.stack?.split("\n") || [];
  if (!frame) throw e;

  const [, body = "", l, c] =
    frame.match(/\s*at \w+ \((.*):(\d+):(\d+)\)/) ?? [];
  if (!l || !c) throw e;
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
    inputFile: file,
    error: {
      type: e.name,
      message: e.message,
      lineText: lines[lineNo - 1] ?? "",
      line: fileLineNo,
      column: colNo
    }
  };
}

export function fromBuildError(result: esbuild.Message): RadishBuildResult {
  return {
    inputFile: result.location?.file ?? "",
    error: {
      type: "BundleError",
      message: result.text,
      lineText: result.location?.lineText ?? "",
      line: result.location?.line ?? 0,
      column: result.location?.column ?? 0
    }
  };
}
