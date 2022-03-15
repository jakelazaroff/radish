---
order: 2
title: Pages
---

A page is a React component exported from a `.tsx` or `.jsx` file in the `pages` folder. Radish will create a corresponding HTML file for each page in the folder. For example, if you have `src/pages/about.jsx`, Radish will create an HTML file at `build/about/index.html`.

```jsx
// pages/about.jsx

export default function About() {
  return <p>All about me!</p>;
}
```

Just like with content, pages prefixed with an underscore — for example, `src/pages/_draft.jsx` — won't generate a corresponding HTML file.

Because these components are rendered to static HTML, there are some restrictions on what you can use in your components.

- Event handlers won't ever fire, since React is not loaded on the client.
- Most hooks won't do anything. Effects won't run, which means no `useEffect` or `useLayoutEffect`. State can't be updated, which means `useState` and `useReducer` are useless. Components only render once, which means `useMemo` and `useCallback` are also useless.
- HTTP requests won't finish. If you call `fetch`, your component will never see that promise resolve.

In short, treat components as pure functions: props in, JSX out.

## Dynamic Paths

Radish also allows you to create multiple HTML files from a single page. This can be useful if you have collections of content, such as blog posts.

To have Radish create multiple pages, export a function called `paths` from your page component. That function will be called with your content, and should return paths as an array of strings.

For example, to make a page for each blog post, your `paths` function might look like this:

```jsx
// pages/blog/$slug.jsx

export function paths(content) {
  return Object.values(content.blog).map(blog => slug);
}
```

If a file returns a list of paths, Radish will only turn those paths into HTML files — it won't create an HTML file for the page component itself. Although not required, it's recommended to differentiate these files from normal pages by starting their filenames with `$`.

## Using Content

Radish provides a hook `useContent` that returns the content object. Page components are passed their path as a prop, so you can render different content conditionally depending on the path.

Within your React components, each piece of content has a special property, `Component`, that you can use in your JSX to render that content on the page.

A full page component that creates an HTML file for each blog post might look like this:

```jsx
// pages/blog/$slug.jsx

import { useContent } from "radish";

export default function Blog({ path }) {
  const slug = path.split("/").pop();

  const content = useContent();
  const ContentComponent = content.blog[slug].Component;

  return (
    <div>
      <ContentComponent />
    </div>
  );
}

export function paths(content) {
  return Object.keys(content.blog);
}
```

## Head

Radish exposes a `<Head>` component that you can use to set tags in a page's `<head>`, such as title and open graph data. You can also use the `html` and `body` props to set attributes on the `<html>` and `<body>` elements.

```jsx
// pages/index.jsx

import { Head } from "radish";

export default function About() {
  return (
    <Head html={{ lang: "en" }}>
      <title>All About Me!</title>
    </Head>
  );
}
```

## 404s

If you create a page at `src/pages/404.jsx` `src/pages/404.tsx`, Radish will render it to `build/404.html` (rather than nesting it in another folder) and use it as the 404 page in the development server.

Note that to have your 404 page served in production, you must configure your server to use this file as a 404 page.
