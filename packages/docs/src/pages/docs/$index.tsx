// lib
import clsx from "clsx";
import type { Paths, ResourcePageProps } from "radish";

import Head from "components/Head";
import Footer from "components/Footer";
import Sidebar from "components/Sidebar";
import useContent, { usePages, Content } from "hooks/useContent";

import js from "js/index.bundle.js";
import Left from "./left.react.svg";
import Right from "./right.react.svg";
import css from "./style.module.css";

export default function Index(props: ResourcePageProps) {
  const { path } = props;
  const [, section = "", slug = ""] = path.split("/");

  const content = useContent();

  const page = content["docs"][section]?.[slug];
  if (!page)
    throw new Error(`No page for section "${section}" and slug "${slug}".`);
  const Child = page.Component;

  const pages = usePages();
  const index = pages.findIndex(
      ([pageSection, pageSlug]) => section === pageSection && slug === pageSlug
    ),
    prev = pages[index - 1],
    next = pages[index + 1];

  return (
    <>
      <div className={css.wrapper}>
        <Head title={`${page.title} | Radish`} />
        <aside className={css.sidebar}>
          <Sidebar section={section} slug={slug} />
        </aside>
        <main className={css.content}>
          <h1>{page.title}</h1>
          <Child />

          <menu className={css.neighbors}>
            {prev ? (
              <li className={clsx(css.neighbor, css.prev)}>
                <a
                  className={css.neighborLink}
                  href={`/docs/${prev[0]}/${prev[1]}/`}
                >
                  <span className={css.neighborLabel}>
                    <Left /> Prev
                  </span>{" "}
                  {prev[2].title}
                </a>
              </li>
            ) : null}
            {next ? (
              <li className={clsx(css.neighbor, css.next)}>
                <a
                  className={css.neighborLink}
                  href={`/docs/${next[0]}/${next[1]}/`}
                >
                  <span className={css.neighborLabel}>
                    Next <Right />
                  </span>{" "}
                  {next[2].title}
                </a>
              </li>
            ) : null}
          </menu>
        </main>
        <Footer className={css.footer} />
      </div>
      <script src={js} async />
    </>
  );
}

export const paths: Paths<Content> = (content: Content) => {
  return Object.entries(content["docs"]).flatMap(([section, pages]) =>
    Object.keys(pages)
      .filter(slug => slug !== "section")
      .map(slug => `/${section}/${slug}/`)
  );
};
