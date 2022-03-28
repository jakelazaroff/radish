---
order: 1
title: Content
---

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
image = "url('./image.png')"
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

## Remote Data

Radish also supports content files written in JavaScript and TypeScript. If you import from a URL in those files, Radish will make an HTTP request and return the response as a JavaScript object. You can use this to load data from remote data sources:

```js
// content/scrobbles.js

export { default } from "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=radish&api_key=abcdef1234567890&format=json";
```

You can also write code to process any data you load before exporting it:

```js
// content/scrobbles.js

import res from "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=radish&api_key=abcdef1234567890&format=json";

export default res.recenttracks.track.map(track => ({
  title: track.name,
  artist: track.artist["#text"]
}));
```

## Drafts

Radish ignores content files if the first character in the filename is an underscore. For example, the page at `src/content/_draft.md` won't show up in the content object. This allows you to work on content without publishing it before it's ready.

## Syntax Highlighting

Within `.md` and `.mdx` files, Radish will highlight code surrounded with three backticks. You can specify the language immediately after the first set of backticks:

````md
---
# content/code.mdx
---

Some example code:

```js
console.log("Hello, world!");
```
````

Radish highlights code using [highlight.js](https://highlightjs.org). The highlight.js website includes a page where you can [preview different themes](https://highlightjs.org/static/demo/). Once you find one you like, [download it from GitHub](https://github.com/highlightjs/highlight.js/tree/main/src/styles).

For the highlighting to show up on your website, you need to import the CSS for your chosen theme:

```css
/* styles/syntax.css */

.hljs {
  color: #2f3337;
  background: #f6f6f6;
}

/* rest of the theme... */
```

```css
/* styles/style.css */

@import "./syntax.css";
```
