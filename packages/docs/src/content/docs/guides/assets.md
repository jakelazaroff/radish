---
order: 3
title: Assets
---

When you import assets in your components or styles, or reference them with `url()` in your content files, Radish will load the asset automatically. For static assets like images, Radish returns the URL for you to use in your components. However, Radish treats certain assets differently:

## CSS

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
// pages/page.jsx

import css from "./style.module.css";

function Page() {
  return (
    <div className={css.wrapper}>
      <h1 className={css.title}>Hello, world!</h1>
    </div>
  );
}
```

## JavaScript

Radish doesn't export any JavaScript by default, but you can still bundle and load scripts onto your webpages. If you import a script with the extension `.bundle.ts` or `.bundle.js`. Radish will bundle the script and return a URL that you can use in a `<script>` tag:

```jsx
// pages/page.jsx

import script from "./index.bundle.js";

function Page() {
  return <script type="module" src={script} />;
}
```

Note that only the file you're directly importing from your component needs to have the `.bundle` extension prefix. Any files imported from the `.bundle` file can have a normal `.js` or `.ts` extension.

## SVG

By default, importing an SVG returns a URL that you can use in the `src` attribute of an `img` tag. To import SVGs as React components, use the extension `.react.svg`; this will include the SVG markup in the page.

```jsx
// pages/page.jsx

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
