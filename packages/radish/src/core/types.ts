import type { ComponentType } from "react";
import type { HelmetServerState } from "react-helmet-async";

import type { Props } from "../lib/Document";

export type PageProps = Props;

export interface Page {
  default: ComponentType<Props>;
  paths?(content: any): string[];
  head: { helmet: HelmetServerState };
}
