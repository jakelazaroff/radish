// lib
import type { ComponentType } from "react";

// radish
import { content } from "CONTENT_INDEX";

interface AnyMap {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type Content<T = AnyMap> = T & {
  Component: ComponentType;
};

export interface ContentMap<T = AnyMap> {
  [key: string]: Content<T> | ContentMap;
}

export interface ResourcePageProps {
  path: string;
}

export type ResourcePage = ComponentType<ResourcePageProps>;
export type Paths<T = AnyMap> = (content: T) => string[];

export function useContent<T = ContentMap>(): T {
  return content;
}

export { default as Head, HeadProvider } from "./Head";
