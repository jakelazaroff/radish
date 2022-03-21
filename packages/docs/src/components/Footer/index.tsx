// lib
import clsx from "clsx";

import css from "./style.module.css";

interface Props {
  className?: string;
}

export default function Footer(props: Props) {
  const { className } = props;

  return (
    <footer className={clsx(css.footer, className)}>
      🌱 Planted by <a href="https://jake.nyc">Jake Lazaroff</a>
    </footer>
  );
}
