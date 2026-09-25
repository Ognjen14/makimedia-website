# makimedia-website

The website for [Makimedia](https://github.com/Ognjen14/Makimedia), a free, open source video player for Windows, Android and Android TV.

Published at **[makimedia.org](https://makimedia.org)** with GitHub Pages.

## What is here

A static site with no build step. Edit the files and push; GitHub Pages publishes the `main` branch.

| File | What it is |
|---|---|
| `index.html` | The home page |
| `privacy.html` | Privacy policy |
| `legal.html` | Legal notice |
| `contact.html` | Contact page and form |
| `help.html` | Getting started, streaming from a PC, common questions and troubleshooting |
| `contribute.html` | How to help: testing, bug reports, ideas, film series, code |
| `blog.html` | The list of blog posts, newest first |
| `blog/` | One page per post. `_post-template.html` is the starting point and is not published |
| `feed.xml` | The blog's RSS feed |
| `404.html` | Shown by GitHub Pages for any address that doesn't exist. Its links start with `/`, because it can appear at any depth |
| `sitemap.xml`, `robots.txt` | Tell search engines which pages exist |
| `CNAME` | The site's domain, `makimedia.org`, for GitHub Pages. Don't delete or rename it |
| `style.css` | All styles, light and dark |
| `script.js` | Screenshot slideshows, device tabs and the full-screen viewer |
| `contact.js` | Sends the contact form through Web3Forms |
| `nav.js` | Opens and closes the header menu on phones |
| `help.js` | Opens a question on the Help page when a link points straight at it |
| `assets/` | App icon, fonts, the TMDB logo and screenshots (WebP). `app-icon.png` is the 512 px original; pages use the small copies made from it: `favicon-32.png` (browser tab), `apple-touch-icon.png` (180 px, phone home screen) and `logo-68.png` (header) |
| `assets/share.png` | The 1200 by 630 picture shown when a link to the site is shared |
| `assets/icons/` | Every small icon on the site, one SVG file each |

After changing `style.css` or `script.js`, raise the `?v=` number where the pages link to them, so visitors get the new version instead of a cached one. The same applies to a screenshot replaced under the same file name.

## Icons

Icons are placed with `<span class="ico i-NAME" aria-hidden="true"></span>`, where `NAME` is the file name in `assets/icons/` without `.svg`. They take the colour of the text around them, so a rule such as `color: var(--gold)` recolours them, in light and dark alike.

To add one, save a 24 by 24 SVG in `assets/icons/`, drawn in `currentColor` with its line width set in the file, and add a line for it next to the others at the top of `style.css`:

```css
.i-NAME { --ico: url("assets/icons/NAME.svg"); }
```

Parts filled with `fill-opacity=".18"` show as the soft background tone. The large illustrations on the home page stay inline, because their colours change with the theme.

## Adding a blog post

1. Copy `blog/_post-template.html` to `blog/<name>.html`, for example `blog/makimedia-0-2-0.html`. Lowercase, words joined with `-`.
2. In the copy, replace the placeholders: `POST_TITLE`, `POST_SUMMARY` (one sentence), `POST_FILE` (the name without `.html`), `POST_DATE` (for example `3 October 2026`) and `POST_DATE_ISO` (`2026-10-03`). Change the tag to `<span class="post-tag news">News</span>` for a post that isn't a release, and write the body.
3. In `blog.html`, copy the first `<li class="post-item">` block to the **top** of the list and change its link, date, tag, title and summary.
4. In `feed.xml`, copy the first `<item>` to the top, fill it in the same way, and set `<pubDate>` and `<lastBuildDate>` in the format `Sat, 03 Oct 2026 12:00:00 GMT`.
5. In `sitemap.xml`, add a `<url>` for the post, and set the `<lastmod>` of `blog.html` to the same date.

Every page has a `<link rel="canonical">` and `og:` tags with its full `https://makimedia.org/` address. A new page needs them too, copied from an existing page with the address changed.

## Contact

[support@makimedia.org](mailto:support@makimedia.org)

## Licence

The Makimedia **app** is free software under the GNU General Public License, version 2 or later. See the [app repository](https://github.com/Ognjen14/Makimedia).

The **website content** in this repository (text, design and illustrations) is not open-licensed: all rights reserved, TopicDev. The screenshots show film and show titles, posters and artwork that belong to their respective owners and appear only to illustrate how Makimedia displays a library. The Roboto font is under the Apache License 2.0, and the TMDB logo belongs to TMDB.
