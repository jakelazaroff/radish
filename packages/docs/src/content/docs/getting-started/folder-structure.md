---
order: 3
title: Folder Structure
---

A Radish project's folder structure looks like this:

```txt
build/
┗━ public/
src/
┣━ content/
┣━ pages/
┗━ styles/
    ┗━ style.css
```

- All your source code goes in `src`
- `src/pages` is a special folder; Radish turns all the React component files in here into static HTML pages
- `src/content` is a special folder; Radish reads all the files in here and provides it to your pages as a JavaScript object
- `src/styles/style.css` is a special file; Radish uses this to import all your styles with a `<link>` tag
- When you build your site, all the HTML files go in `build`
- When you build your site, all the public assets (CSS, JS, images, etc) go in `build/public`
