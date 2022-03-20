import { Head } from "radish";

import favicon from "images/favicon.ico";

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
    </Head>
  );
}
