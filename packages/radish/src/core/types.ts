import type { ComponentType } from "react";
import type { HelmetServerState } from "react-helmet-async";

export interface Page {
  default: ComponentType<{ path: string }>;
  paths?(content: any): string[];
  head: { helmet: HelmetServerState };
}
