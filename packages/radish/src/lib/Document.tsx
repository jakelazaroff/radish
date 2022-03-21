import type { ReactNode } from "react";

// @ts-ignore
import { Head, HeadProvider } from "radish";

// @ts-ignore
import style from "styles/style.css";

interface Preload {
  href: string;
  as: string;
}

export interface Props {
  children?: ReactNode;
  path: string;
  serviceWorker?: boolean;
  websocket?: number;
  preload?: Preload[];
}

export default function Document(props: Props) {
  const { children, serviceWorker, websocket, preload = [] } = props;

  return (
    <HeadProvider>
      <Head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={style} />
        {preload.map((resource, i) => (
          <link key={i} href={resource.href} as={resource.as} />
        ))}
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
