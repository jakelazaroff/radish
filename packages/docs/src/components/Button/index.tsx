import type { ReactNode } from "react";
import clsx from "clsx";

import css from "./style.module.css";

interface Props {
  children: ReactNode;
  href: string;
  kind?: "primary" | "ghost";
}

export default function Button(props: Props) {
  const { children, href, kind = "primary" } = props;

  return (
    <a
      className={clsx(css.button, { [css.ghost!]: kind === "ghost" })}
      href={href}
    >
      {children}
    </a>
  );
}
