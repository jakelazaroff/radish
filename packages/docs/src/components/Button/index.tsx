import type { ReactNode } from "react";

import css from "./style.module.css";

interface Props {
  children: ReactNode;
  href: string;
}

export default function Button(props: Props) {
  const { children, href } = props;

  return (
    <a className={css.button} href={href}>
      {children}
    </a>
  );
}
