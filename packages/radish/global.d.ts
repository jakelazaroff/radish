// js

declare module "*.bundle.js" {
  const src: string;
  export default src;
}

declare module "*.bundle.ts" {
  const src: string;
  export default src;
}

declare module "*.bundle.jsx" {
  const src: string;
  export default src;
}

declare module "*.bundle.tsx" {
  const src: string;
  export default src;
}

// css

declare module "*.module.css" {
  const map: { [key: string]: string };
  export default map;
}

declare module "*.css" {
  const href: string;
  export default href;
}

// markdown

declare module "*.md" {
  // .md files declared in @types/mdx
  // import type { ComponentType } from "react";
  // const Component: ComponentType;
  // export default Component;
}

declare module "*.mdx" {
  // .mdx files declared in @types/mdx
  // import type { ComponentType } from "react";
  // const Component: ComponentType;
  // export default Component;
}

// images

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.ico" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.react.svg" {
  import type { ComponentType } from "react";
  const Component: ComponentType<{ className?: string }>;
  export default Component;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// fonts

declare module "*.eot" {
  const src: string;
  export default src;
}

declare module "*.otf" {
  const src: string;
  export default src;
}

declare module "*.ttf" {
  const src: string;
  export default src;
}

declare module "*.woff" {
  const src: string;
  export default src;
}
declare module "*.woff2" {
  const src: string;
  export default src;
}

// audio

declare module "*.aac" {
  const src: string;
  export default src;
}

declare module "*.flac" {
  const src: string;
  export default src;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

// video

declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webm" {
  const src: string;
  export default src;
}

// remote content

declare module "http://*" {
  const json: string;
  export default json;
}

declare module "https://*" {
  const json: string;
  export default json;
}
