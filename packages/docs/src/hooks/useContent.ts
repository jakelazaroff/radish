import {
  useContent as useRadishContent,
  Content as RadishContent
} from "radish";

export interface Content {
  docs: {
    [key: string]: {
      section: { title: string; order: number };
    } & { [key: string]: RadishContent<{ title: string; order: number }> };
  };
}

export default function useContent() {
  return useRadishContent<Content>();
}

export function useSections() {
  const content = useContent();
  const docs = content.docs;

  return Object.entries(docs)
    .sort(([, a], [, b]) => a.section.order - b.section.order)
    .map(([slug, { section, ...etc }]) => [slug, section.title, etc] as const);
}

export function usePages() {
  const sections = useSections();
  return sections.flatMap(([section, , pages]) =>
    Object.entries(pages)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([slug, page]) => [section, slug, page] as const)
  );
}
