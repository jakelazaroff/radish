import type { ReactNode } from "react";
import {
  Helmet,
  HelmetProvider,
  HtmlProps,
  BodyProps
} from "react-helmet-async";

interface Props {
  children: ReactNode;
  html?: HtmlProps;
  body?: BodyProps;
}

export default function Head(props: Props) {
  const { children, html, body } = props;

  return (
    <Helmet htmlAttributes={html} bodyAttributes={body}>
      {children}
    </Helmet>
  );
}

export function HeadProvider(props: Props) {
  return (
    <HelmetProvider context={HeadProvider.context}>
      {props.children}
    </HelmetProvider>
  );
}

HeadProvider.context = {};
