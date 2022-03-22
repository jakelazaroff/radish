import clsx from "clsx";

import { useSections } from "hooks/useContent";
import { Fragment } from "react";

import gitlab from "images/gitlab.svg";
import day from "./day.svg";
import night from "./night.svg";
import Menu from "./menu.react.svg";
import css from "./style.module.css";

interface Props {
  slug?: string;
  section?: string;
}

export default function Sidebar(props: Props) {
  const { slug: currentSlug = "", section: currentSection = "" } = props;

  const sections = useSections();

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <a className={css.logo} href="/">
          Radish
        </a>

        <button
          className={css.toggle}
          title="Open navigation menu"
          data-js="navigation"
          aria-controls="navigation"
        >
          <Menu />
        </button>
      </div>

      <nav className={css.nav} id="navigation">
        <dl className={css.menu}>
          {sections.map(([section, title, pages]) => (
            <Fragment key={section}>
              <dt className={css.sectionTitle}>{title}</dt>
              {Object.entries(pages)
                .filter(([slug]) => slug !== "section")
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([slug, page]) => (
                  <dd key={slug} className={css.navItem}>
                    <a
                      className={clsx(css.link, {
                        [css.active!]:
                          section === currentSection && slug === currentSlug
                      })}
                      href={`/docs/${section}/${slug}/`}
                    >
                      {page.title}
                    </a>
                  </dd>
                ))}
            </Fragment>
          ))}
        </dl>

        <menu className={css.actions}>
          <li>
            <a
              href="https://gitlab.com/jakelazaroff/radish"
              title="Open GitLab repository"
            >
              <img src={gitlab} alt="GitLab" />
            </a>
          </li>
          <li>
            <button
              className={clsx(css.theme, css.day)}
              data-js="colorscheme"
              value="day"
              title="Switch to light mode"
            >
              <img className={css.themeIcon} src={day} alt="Light mode" />
            </button>
            <button
              className={clsx(css.theme, css.night)}
              data-js="colorscheme"
              value="night"
              title="Switch to dark mode"
            >
              <img className={css.themeIcon} src={night} alt="Dark mode" />
            </button>
          </li>
        </menu>
      </nav>

      <div role="presentation" data-js="navigation" className={css.backdrop} />
    </div>
  );
}
