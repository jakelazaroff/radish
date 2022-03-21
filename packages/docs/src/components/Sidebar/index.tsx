import clsx from "clsx";

import { useSections } from "hooks/useContent";
import { Fragment } from "react";

import gitlab from "images/gitlab.svg";
import css from "./style.module.css";

interface Props {
  slug?: string;
  section?: string;
}

export default function Sidebar(props: Props) {
  const { slug: currentSlug = "", section: currentSection = "" } = props;

  const sections = useSections();

  return (
    <nav>
      <a className={css.logo} href="/">
        Radish
      </a>
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

      <a href="https://gitlab.com/jakelazaroff/radish">
        <img src={gitlab} alt="GitLab" />
      </a>
    </nav>
  );
}
