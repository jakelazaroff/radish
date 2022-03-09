import { Head, useContent } from "radish";

export default function Index() {
  const content = useContent();

  console.log(content);

  return (
    <>
      <Head>
        <title>{content.site.title}</title>
      </Head>
      <h1>{content.site.title}</h1>
      <p>Hello, world!</p>
    </>
  );
}
