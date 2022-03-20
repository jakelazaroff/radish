<div align="center">
  <img src="../../images/logo.svg" width="500" height="180" alt="Radish" >
</div>

Radish is a React-based static site generator that outputs plain HTML and CSS files, without serving any JavaScript to the client.

## Motivation

Static site generators like Hugo lack the conveniences of modern web app development, such as components and CSS modules. On the other hand, frameworks like Gatsby bolt a full single-page app on top of static websites. Radish takes a middle ground — you get the full power of React in development, while exporting plain HTML and CSS.

### Radish vs. Hugo/Jekyll/Eleventy

[Hugo](https://gohugo.io/), [Jekyll](https://jekyllrb.com/) and [Eleventy](https://www.11ty.dev/) are all "traditional" static site generators: they create static HTML from templates, with no client-side JavaScript by default. There are no templates; code is reused with shortcodes or partials, and any logic is written in the templates themselves. There's no CSS modularity; you have to make sure you don't accidentally reuse a class name.

Radish also exports static HTML files — but they're rendered by React. In particular, components and CSS modules are helpful for keeping your website maintainable.

**Use Radish if:** you prefer to work with React

**Use Hugo/Jekyll/Eleventy if:** you prefer not to work with React

### Radish vs. Gatsby/Create React App

[Gatsby](https://www.gatsbyjs.com/) exports static HTML that is hydrated with a full client-side React app once the JavaScript bundle loads. By default, [Create React App](https://create-react-app.dev/) exports a client-side React app with minimal markup, but there are [third-party libraries you can use to create "snapshots"](https://create-react-app.dev/docs/pre-rendering-into-static-html-files/) — static HTML pages that also load a full React app.

Radish does not export any JavaScript for the client. Radish does allow you load JavaScript, but it just treats it as a normal file; you're responsible for loading it and integrating it with your HTML.

(Technically, you can use Radish to load React on the client, but at that point it would make more sense to use a tool like Gatsby or Create React App.)

**Use Radish if:** your website doesn't need JavaScript at all, or if you don't plan to use React on the client

**Use Gatsby/Create React App if:** you'd like your static site to be a full React app as well

## Project Structure

A Radish project's folder structure looks like this:

```
build/
└─ public/
src/
├─ content/
└─ pages/
```

- All your source code goes in `src`
- `src/pages` is a special folder; Radish turns all the React component files in here into static HTML pages
- `src/content` is a special folder; Radish reads all the files in here and provides it to your pages as a JavaScript object
- All the built files go in `build`
- All the public assets (CSS, JS, images, etc) go in `build/public`

## Content

The `content` folder contains data that you can use in your pages. Radish supports many different formats of content: you can write in Markdown, or use TOML, YAML or JSON for more structured content.

Markdown content uses [MDX](https://mdxjs.com), so you can import other React components.

```md
---
# content/about.mdx
title: All about me!
---

import Banner from "components/Banner";

Hello, world!

<Banner />
```

Radish also supports content files in [TOML](https://toml.io), [YAML](https://yaml.org) and [JSON](https://www.json.org). You can reference assets by using `url()`, like in CSS; Radish will take care of loading the asset and give you the path to the file so you can reference it in your component:

```toml
# content/site.toml
title = "A Cool Website"
image = "url('./image.png')
```

```yaml
# content/site.yaml
title: A Cool Website
image: url("./image.png")
```

```js
// content/site.json
{
  "title": "A Cool Website",
  "image": "url('./image.png')"
}
```

When content is available to your code, it's in an object that matches the file structure of the `content` folder. For example, if you have the files `content/about.md`, `site.toml`, `content/blog/one.md` and `content/blog/two.md`, the content object might look like this:

```js
{
  site: { title: "A Cool Website", image: "/public/image-ABCDEF90.png" },
  about: { title: "All about me!" },
  blog: {
    "one": { /* ... */ },
    "two": { /* ... */ }
  }
}
```

The nested object for each piece of content is populated with the data or front matter from that file.

### Drafts

Radish ignores content files if the first character in the filename is an underscore. For example, the page at `src/content/_draft.md` won't show up in the content object. This allows you to work on content without publishing it before it's ready.

## Pages

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

### Dynamic Paths

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

### Using Content

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

### Head

Radish exposes a `<Head>` component that you can use to set tags in a page's `<head>`, such as title and open graph data. You can also use the `html` and `body` props to set attributes on the `<html>` and `<body>` elements.

```jsx
// pages/index.jsx

import { Head } from 'radish";

export default function About() {
  return (
    <Head html={{ lang: "en" }}>
      <title>All About Me!</title>
    </Head>
  )
}
```

### 404s

If you create a page at `src/pages/404.jsx` `src/pages/404.tsx`, Radish will render it to `build/404.html` (rather than nesting it in another folder) and use it as the 404 page in the development server.

Note that to have your 404 page served in production, you must configure your server to use this file as a 404 page.

## Assets

When you import assets in your components or styles, or reference them with `url()` in your content files, Radish will load the asset automatically. For static assets like images, Radish returns the URL for you to use in your components. However, Radish treats certain assets differently:

### CSS

Radish automatically bundles and links `src/styles/style.css`. Any global styles, such as resets and fonts, should either go directly in this file or be `@import`ed into it:

```css
/* styles/style.css */
@import "./fonts.css";

*,
*::before,
*::after {
  box-sixing: border-box;
}
```

If you have no global styles, you can simply leave `src/styles/style.css` blank.

Radish treats files with the `.module.css` extension as CSS modules, and return an object of class names:

```css
/* style.module.css */

.wrapper {
  border: 1px solid pink;
}

.title {
  font-style: italic;
}
```

```jsx
import css from "./style.module.css";

function Page() {
  return (
    <div className={css.wrapper}>
      <h1 className={css.title}>Hello, world!</h1>
    </div>
  );
}
```

### JavaScript

Radish doesn't export any JavaScript by default, but you can still bundle and load scripts onto your webpages. If you import a script with the extension `.bundle.ts` or `.bundle.js`. Radish will bundle the script and return a URL that you can use in a `<script>` tag:

```jsx
import script from "./index.bundle.js";

function Document() {
  return <script type="module" src={script} />;
}
```

Note that only the file you're directly importing from your component needs to have the `.bundle` extension prefix. Any files imported from the `.bundle` file can have a normal `.js` or `.ts` extension.

### SVG

By default, importing an SVG returns a URL that you can use in the `src` attribute of an `img` tag. To import SVGs as React components, use the extension `.react.svg`; this will include the SVG markup in the page.

```jsx
import img from "./img.svg";
import Icon from "./Icon.react.svg";

function Page() {
  return (
    <div>
      <img src={img} alt="Descriptive alt text" />
      <Icon />
    </div>
  );
}
```

## Service Worker

When you build your website, Radish includes a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) to improve performance and make it work offline.

By default, Radish will always request new versions of your pages, and it will cache assets for a year. You can configure this time by setting the `max-age` cache control directive from your webserver. If you do override it, you should try to keep assets cached for a long time; since Radish changes asset filenames whenever the contents change, they are guaranteed to be up-to-date.

To prevent the service worker from caching individual files, set the `no-store` cache control directive on your webserver. To disable the service worker entirely, build your website with the flag `--service-worker=disabled`.

Note that if you host your static assets on a different domain, the service worker won't be able to cache them.
