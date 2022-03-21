import { Head } from "radish";

import favicon from "images/favicon.ico";
import js from "js/index.bundle";

interface Props {
  title?: string;
}

export default function DocHead(props: Props) {
  const { title = "Radish" } = props;

  return (
    <Head>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <link rel="icon" href={favicon} />
      <script type="module" src={js} async />
      <script>{colorScheme}</script>
    </Head>
  );
}

const colorScheme = `
const scheme = localStorage.getItem("colorscheme");
if (["day", "night"].includes(scheme)) document.documentElement.classList.add(scheme);
`.trim();
