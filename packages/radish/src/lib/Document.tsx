import type { ReactNode } from "react";

// @ts-ignore
import { Head, HeadProvider } from "radish";

// @ts-ignore
import style from "styles/style.css";

interface Props {
  children: ReactNode;
}

export default function Document(props: Props) {
  const { children } = props;

  return (
    <HeadProvider>
      <Head>
        <link rel="stylesheet" href={style} />
      </Head>
      {children}
    </HeadProvider>
  );
}

Document.head = HeadProvider.context;
