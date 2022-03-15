import type { ReactNode } from "react";

// @ts-ignore
import { Head, HeadProvider } from "radish";

// @ts-ignore
import style from "styles/style.css";

interface Props {
  children: ReactNode;
  serviceWorker?: boolean;
  websocket?: number;
}

export default function Document(props: Props) {
  const { children, serviceWorker, websocket } = props;

  return (
    <HeadProvider>
      <Head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={style} />
        {serviceWorker ? <script>{sw}</script> : null}
        {websocket ? <script>{ws(websocket)}</script> : null}
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

const ws = (port: number) => {
  return `
const ws = new WebSocket("ws://localhost:${port}");
ws.onmessage = msg => {
  const data = JSON.parse(msg.data);
  if (data.type === "refresh") location.reload();
}`.trim();
};
