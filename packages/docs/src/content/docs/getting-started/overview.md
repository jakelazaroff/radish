---
order: 1
title: Overview
---

Static site generators like Hugo lack the conveniences of modern web app development, such as components and CSS modules. On the other hand, frameworks like Gatsby bolt a full single-page app on top of static websites. Radish takes a middle ground — you get the power of React in development, while exporting plain HTML and CSS for production.

## Radish vs. Hugo/Jekyll/Eleventy

[Hugo](https://gohugo.io/), [Jekyll](https://jekyllrb.com/) and [Eleventy](https://www.11ty.dev/) are all "traditional" static site generators: they create static HTML from templates, with no client-side JavaScript by default. There are no components; code is reused with shortcodes or partials, and any logic is written in the templates themselves. There's no CSS modularity; you have to make sure you don't accidentally reuse a class name.

Radish also exports static HTML files — but they're rendered by React. In particular, components and CSS modules are helpful for keeping your website maintainable.

**Use Radish if:** you prefer to work with React

**Use Hugo/Jekyll/Eleventy if:** you prefer not to work with React

## Radish vs. Gatsby/Create React App

[Gatsby](https://www.gatsbyjs.com) exports static HTML that is hydrated with a full client-side React app once the JavaScript bundle loads. By default, [Create React App](https://create-react-app.dev) exports a client-side React app with minimal markup, but there are [third-party libraries you can use to create "snapshots"](https://create-react-app.dev/docs/pre-rendering-into-static-html-files/) — static HTML pages that also load a full React app.

Radish does not export any JavaScript for the client. Radish does allow you load JavaScript, but it just treats it as a normal file; you're responsible for loading it and integrating it with your HTML.

(Technically, you can use Radish to load React on the client, but at that point it would make more sense to use a tool like Gatsby or Create React App.)

**Use Radish if:** your website doesn't need JavaScript at all, or if you don't plan to use React on the client

**Use Gatsby/Create React App if:** you'd like your static site to be a full React app as well

## Radish vs. Remix/Next.js

[Remix](https://remix.run) is a full-stack React framework focused on web fundamentals. [Next.js](https://nextjs.org) is also a full-stack React framework. The use cases for these tools don't overlap too much with Radish, but they're included here for posterity.

**Use Radish if:** you're building a website of static pages with content managed locally

**Use Remix/Next.js if:** you're building a web app of dynamic pages with content managed in a database
