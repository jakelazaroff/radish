import type { ReactNode } from "react";

// @ts-ignore
import { Head, HeadProvider } from "radish";

// @ts-ignore
import style from "styles/style.css";

interface Props {
  children: ReactNode;
  serviceWorker?: boolean;
}

export default function Document(props: Props) {
  const { serviceWorker, children } = props;

  return (
    <HeadProvider>
      <Head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={style} />
        {serviceWorker ? (
          <>
            <meta name="test" content="asdf" />
            <script>{sw}</script>
          </>
        ) : null}
      </Head>
      {children}
    </HeadProvider>
  );
}

Document.head = HeadProvider.context;

const sw = `
if ("serviceWorker" in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register("/sw.js", { type: "module" })
      .catch(error => console.error("Couldn't load service worker", error));
  });
}`.trim();
