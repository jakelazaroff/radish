// lib
import type { ReactNode } from "react";

import css from "./style.module.css";

interface Props {
  children: ReactNode;
}

export default function Layout(props: Props) {
  const { children } = props;

  return <div className={css.wrapper}>{children}</div>;
}
