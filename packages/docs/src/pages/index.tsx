// lib
import { useSections, usePages } from "hooks/useContent";

import Button from "components/Button";
import Head from "components/Head";
import Footer from "components/Footer";

import css from "./style.module.css";

export default function Index() {
  const [section] = useSections();
  if (!section) throw new Error("No section found");

  const [page] = usePages();
  if (!page) throw new Error("No page found!");

  return (
    <div className={css.wrapper}>
      <Head title="Radish | a delightful static site generator" />

      <header className={css.header}>
        <h1 className={css.logo}>Radish</h1>
        <p className={css.subtitle}>
          a delightful React-based static site generator that outputs plain HTML
          &amp; CSS
        </p>

        <menu className={css.ctas}>
          <li>
            <Button href={`/docs/${section[0]}/${page[1]}/`}>
              Get Started
            </Button>
          </li>
          <li>
            <Button href="https://github.com/jakelazaroff/radish" kind="ghost">
              GitHub
            </Button>
          </li>
        </menu>
      </header>

      <dl className={css.features}>
        <div className={css.feature}>
          <dt className={css.featureTitle}>React-based</dt>
          <dd>
            Pages are just React components. No more logic in awkward templating
            languages.
          </dd>
        </div>

        <div className={css.feature}>
          <dt className={css.featureTitle}>No runtime</dt>
          <dd>
            By default, Radish doesn&apos;t output any client-side JavaScript —
            just plain HTML and CSS.
          </dd>
        </div>

        <div className={css.feature}>
          <dt className={css.featureTitle}>Flexible content</dt>
          <dd>
            Write prose in Markdown. Keep structured data in TOML, YAML or JSON.
            Use React components directly in your content.
          </dd>
        </div>

        <div className={css.feature}>
          <dt className={css.featureTitle}>Offline first</dt>
          <dd>
            Radish creates a service worker for you, so your users can access
            your website with or without an internet connection.
          </dd>
        </div>
      </dl>

      <Footer className={css.footer} />
    </div>
  );
}
