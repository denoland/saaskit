---
title: "Editorial cheat sheet"
author: Joost van der Laan
comments: false
date: 2019-10-25 07:07:01+00:00
---

## How to use the news upload form &ndash; Video

- [How to use the news upload form - YouTube video](https://www.youtube.com/watch?v=xKR86VSNfNQ)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/xKR86VSNfNQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Most of what you need to publish on the FashionUnited platform is supported by
markdown. Here's the relevant links:

- [Headings](https://www.markdownguide.org/basic-syntax/#headings)
- [Paragraphs](https://www.markdownguide.org/basic-syntax/#paragraphs-1)
- [Emphasis (bold, italic)](https://www.markdownguide.org/basic-syntax/#emphasis)
- [Blockquotes](https://www.markdownguide.org/basic-syntax/#blockquotes-1)
- [Lists](https://www.markdownguide.org/basic-syntax/#lists)
- [Links](https://www.markdownguide.org/basic-syntax/#links)
- [Images](https://www.markdownguide.org/basic-syntax/#images-1)
- [HTML](https://www.markdownguide.org/basic-syntax#html)

### Learn more about Markdown

1. [How to Write Faster, Better & Longer: The Ultimate Guide to Markdown](https://ghost.org/blog/markdown/)
2. [Markdown Cheat sheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
   &ndash; For advanced use, the basics are covered on this page.

### When using HTML

For any markup that is not covered by Markdown's syntax, you simply use HTML
itself [[source](https://daringfireball.net/projects/markdown/syntax#html)].

Use blank lines to separate block-level HTML elements like `<div>`, `<table>`,
`<pre>`, and `<p>` from the surrounding content
[[source](https://www.markdownguide.org/basic-syntax#html-best-practices)].

**Good example:**

```markdown
This is a regular paragraph.

<figure>
  <img src="https://media.fashionunited.com/media/dummy/landscape.jpeg" alt="my alt text">
  <figcaption>This is my caption text.</figcaption>
</figure>

**This is a bold paragraph.**

<div class="article-promo">
  Werken bij een van de merken in Amsterdam The Style Outlets?
</div>

Inline HTML (span, img, etc.) is allowed
<img src="https://media.fashionunited.com/media/dummy/landscape.jpeg"> and will
render fine. _And an italic sentence._
```

**Bad example:**

```html
This is a regular paragraph.
<figure>
  <img src="https://media.fashionunited.com/media/dummy/landscape.jpeg" alt="my alt text">
  <figcaption>This is my caption text.</figcaption>
</figure>
**This is bold a paragraph.**
<div class="article-promo">
  Werken bij een van de merken in Amsterdam The Style Outlets?
</div>
Inline HTML (span, img, etc.) is allowed <img src="https://media.fashionunited.com/media/dummy/landscape.jpeg"> and will render fine.
*And an italic sentence.*
```

## News Article: Basic, no extra images

Please note:

- The title is set in a separate field.
- the header image that you upload will insert at the top of your article
  automatically. This looks like a link:
  `![](https://fashionunited.com/some-image.jpg)`

```markdown
Net sales at Coach-parent Tapestry Inc totalled 715 million dollars for the
fourth quarter compared to 1.51 billion dollars in the prior year. The company
said in a statement that gross profit totalled 499 million dollars on a reported
basis, while gross margin for the quarter was 69.8 percent compared to 999
million dollars and 66 percent, respectively, in the prior year. Net loss for
the quarter was 294 million on a reported basis, with loss per diluted share of
1.06 dollars compared to net income of 149 million dollars with earnings per
diluted share of 51 cents in the prior year period.

## Review of Tapestry’s fourth quarter performance

On a non-GAAP basis, gross profit for the fourth quarter was 507 million
dollars, while gross margin was 71 percent compared to 1.02 billion dollars and
67.3 percent, respectively, in the prior year. Operating loss was approximately
280 million dollars on a reported basis, while operating margin was negative
39.2 percent versus operating income of 171 million dollars and an operating
margin of 11.3 percent in the prior year. On a non-GAAP basis, operating loss
was 70 million dollars, while operating margin was negative 9.8 percent versus
operating income of 222 million dollars and an operating margin of 14.7 percent
in the prior year.
```

## News Article: with 1 extra image

```markdown
Net sales at Coach-parent Tapestry Inc totalled 715 million dollars for the
fourth quarter compared to 1.51 billion dollars in the prior year. The company
said in a statement that gross profit totalled 499 million dollars on a reported
basis, while gross margin for the quarter was 69.8 percent compared to 999
million dollars and 66 percent, respectively, in the prior year. Net loss for
the quarter was 294 million on a reported basis, with loss per diluted share of
1.06 dollars compared to net income of 149 million dollars with earnings per
diluted share of 51 cents in the prior year period.

## Review of Tapestry’s fourth quarter performance

On a non-GAAP basis, gross profit for the fourth quarter was 507 million
dollars, while gross margin was 71 percent compared to 1.02 billion dollars and
67.3 percent, respectively, in the prior year.
![](https://fashionunited.com/img/master/2020/08/13/kate-spade-1-coraplf0-2020-08-13.jpeg)
Operating loss was approximately 280 million dollars on a reported basis, while
operating margin was negative 39.2 percent versus operating income of 171
million dollars and an operating margin of 11.3 percent in the prior year. On a
non-GAAP basis, operating loss was 70 million dollars, while operating margin
was negative 9.8 percent versus operating income of 222 million dollars and an
operating margin of 14.7 percent in the prior year.
```

## Embed Video

### YouTube

#### Code

```html
## Youtube
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/cvDVoGUOks4?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
</div>
```

#### Result

<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/cvDVoGUOks4?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
</div>

### Vimeo

#### Code

```html
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="https://player.vimeo.com/video/366820993"  frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
</div>
```

#### Result

<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="https://player.vimeo.com/video/366820993"  frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
</div>

### Hyperlink

```md
My favorite website is [FashionUnited](https://fashionunited.com)
```

My favorite website is [FashionUnited](https://fashionunited.com).

### Images

```md
![Alttext](URL)
```

Or, with optional titletext:

```md
![Alttext](URL "Titletext")
```

- Alttext is **mandatory**. Always provide an alt text describing what's in the
  picture. This helps **SEO** and visually impaired people using
  **screenreaders**. [Read more](https://moz.com/learn/seo/alt-text)
- Title text is optional / not needed. The title text will show on mouse hover.
  On mobile phones, over 50% of users as of 2019, you cannot hover. Hence the
  title text is useless.

```md
![ALTTEXT](https://media.fashionunited.com/media/dummy/portrait.jpeg "Title text, optional. Shows on mouse hover.")
```

![Alt text, mandatory. Always provide an alt text describing what's in the picture!](https://media.fashionunited.com/media/dummy/portrait.jpeg "Title text, optional. Shows on mouse hover.")

### Image with caption

Markdown does not support figcaption. Therefore we must use HTML.

```html
<figure>
  <img src="https://media.fashionunited.com/media/dummy/landscape.jpeg" alt="my alt text">
  <figcaption>This is my caption text.</figcaption>
</figure>
```

<figure>
  <img src="https://media.fashionunited.com/media/dummy/landscape2.jpeg" alt="my alt text">
  <figcaption>This is my caption text.</figcaption>
</figure>

#### Caption with links

```html
<figure>
  <img src="https://media.fashionunited.com/media/dummy/portrait2.jpeg" alt="Macaque in the trees">
  <figcaption>A cheeky macaque, Lower Kintaganban River, Borneo. Original by <a href="https://fashionunited.com/">Richard Clark</a></figcaption>
</figure>
```

<figure>
  <img src="https://media.fashionunited.com/media/dummy/portrait2.jpeg" alt="Macaque in the trees">
  <figcaption>A cheeky macaque, Lower Kintaganban River, Borneo. Original by <a href="https://fashionunited.com/">Unsplash</a></figcaption>
</figure>

### Linking images

```md
[![ALTTEXT!](https://media.fashionunited.com/media/dummy/landscape.jpeg)](https://fashionunited.com)
```

[![ALTTEXT!](https://media.fashionunited.com/media/dummy/landscape.jpeg)](https://fashionunited.com)

## Default image

```html
<img src="https://static.fashionunited.com/2015/NEWSpicture.jpg" alt="">
```

## Label

```html
<span class="label label-primary">INTERVIEW</span>
```

## IM Small

<img src="https://static.fashionunited.com/201709/6blankimage3.jpg" alt="">

Link to 1 article

```html
<div class="panel panel-default">
  Also read:
  <div class="panel-body">
    <a href="LINK" target="_self"><u>TEXT</u></a>
  </div>
</div>
```

## Read more box

```html
<div class="article-promo">
  <header>Read more:</header>
<ul>
      <li><a href="LINK" target="_self">TEKST</a></li>
      <li><a href="LINK" target="_self">TEKST</a></li>
      <li><a href="LINK" target="_self">TEKST</a></li>
    </ul>
  </div>
```

## Frame

```html
<div class="panel panel-default">
  <div class="panel-body">
    Basic panel example
  </div>
</div>
```

### Frame with links

```html
<div class="panel panel-default">
  <div class="panel-body">
    <strong><p>Lees ook:</p></strong>
    <ul type="square">
      <li><a href="LINK" target="_self"><u>TEXT</u></a></li>
      <li><a href="LINK" target="_self"><u>TEXT</u></a></li>
      <li><a href="LINK" target="_self"><u>TEXT</u></a></li>
    </ul>
  </div>
</div>
```

### Frame within article, grey

```html
<div class="panel panel-default" style="float: right; padding-left: 10px; border: none;">
  <div class="panel-body">
    <div style="background-color: #eee; padding: 30px;">
      <div class="blokje">
        <strong><small>In het kort (test)</small></strong>
        <ul>
          <li><small>Opgericht in 1988</small></li>
          <li><small>Adres: test test</small></li>
          <li><small>Aantal werknemers: test test</small></li>
          <li><small>Wapenfeiten: test test prijs test</small></li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

## Promotional box

See a preview of the promotional boxes in our
[Storybook](https://fashionunited.com/storybook/?path=/story/article--with-image).

```html
<div class="article-promo">
  Werken bij een van de merken in Amsterdam The Style Outlets?
</div>
```

### Promotional box, with a header text

`<header>...</header>`

```html
<div class="article-promo">
  <header>Promotion</header>
  Werken bij een van de merken in Amsterdam The Style Outlets?
</div>
```

### Promotional box, with link

`class="article-promo"`

```html
<div class="article-promo">
  <header>Achtergrondinformatie</header>
  <p>
    De mode-industrie is een van de vervuilendste industrieën wereldwijd. We quoten de Amerikaanse modejournalist Dana Thomas: ‘van het vergaren van grondstoffen tot <a rel="noopener noreferrer" href="https://fashionunited.nl/v1/leads/ophef-afvalberg-kleding/20080828131" target="_self"><u>de afvalberg vol kleding</u></a>’. Enerzijds is de modesector dus zo vervuilend omdat modebedrijven gigantisch veel kleren produceren, anderzijds omdat consumenten - jij en ik - enorme hoeveelheden kleding kopen - en weggooien.
  </p>
</div>
```

<img src="https://storage.googleapis.com/fu-logos/logos/article-promo.png" alt="Article Promo Box">

### Promotional box, with alternative styling

`class="article-promo--alt"`

```html
<div class="article-promo--alt">
  <header>Promotion</header>
  Werken bij een van de merken in Amsterdam The Style Outlets? <a href="https://fashionunited.com/">Bekijk hier alle vacatures &gt;&gt;</a>
</div>
```

<img src="https://storage.googleapis.com/fu-logos/logos/article-promo--alt.png" alt="Article Promo Box Alternative">

## Details-menu

```html
<details>
  <summary>Een ander idee is dichter bij huis produceren.<span class="dropdown-icon"></span>Dat doet Zara overigens ook.</summary>
  <details-menu role="menu">
    <div class="article-promo">
      <p>
        <u>Mode wordt weer dicht bij de afzetmarkt gemaakt</u><br>
        Voor <em>nearshoring</em>, waarbij de productie dus dichter bij de
        afzetmarkt plaatsvindt, en <em>reshoring</em>, het terughalen van de
        productie uit lagelonenlanden, is steeds meer interesse in de branche. Zo
        blijkt ook uit het in 2018 verschenen rapport 'Is apparel manufacturing
        coming home?' en het 2021 onderzoek 'Revamping fashion sourcing: Speed and
        flexibility to the fore' van het Amerikaanse adviesbureau McKinsey. Daarin
        gaf 71 procent van de Chief Purchasing Officers (CPO’s) die McKinsey
        ondervroeg, aan <a rel="noopener noreferrer" href="https://fashionunited.nl/nieuws/business/minder-opties-meer-in-season-en-meer-analytics-nieuw-onderzoek-onthult-sourcingtrends/2021111651666" target="_self"><u>meer te willen gaan <em>nearshoren</em></u></a>.
      </p>

      <p>
        Dat er in de modewereld een toenemende interesse is voor productie in de
        buurt van de afzetmarkt, stelt ook de Amerikaanse (mode)journalist Dana
        Thomas. Thomas schrijft in haar boek Fashionolopis (over de opkomst en
        keerzijde van fast fashion) dat deze <em>nearshoring</em> trend in Amerika
        en Engeland al een paar jaar geleden in gang is gezet. <small>(Bron: De
        Correspondent artikel 'Van Made in Bangladesh naar Made in Europe’ van Emy
        Demkes, uit oktober 2019.)</small>
      </p>

      <p>
        Han Bekke, voorzitter van branchevereniging Modint, verklaarde tegenover
        NOS eveneens "een duidelijke trend" te zien. In het artikel 'Groeiend
        aantal modebedrijven wil weg van 'race to bottom' in China' uit april 2021
        stelt Bekke: "Steeds meer orders gaan naar landen als Turkije, Portugal en
        Italië en Oost-Europese landen."
      </p>
    </div>
  </details-menu>
</details>
<p>The rest of the article.....</p>
```

Additional information to use this tag:

- Make sure that the paragraph is wrapped with a `<details>` tag.
- The `<summary>` tag is used to define a visible heading for the `<details>`
  element.
- Make sure the `<span class="dropdown-icon"></span>` tag is added to the
  `<summary>` tag to show the dropdown icon.
- The `<details-menu>` tag is used to define the content of the details menu.
- The `<details-menu>` tag must have the `role="menu"` attribute.
- The `<details-menu>` tag must have a `<div class="article-promo">` tag as a
  child.
- The `<div class="article-promo">` should contain `<p>` tags with the content
  of the details menu.
- Continue the article after the `<details>` tag, so that the DOM looks like:

```html
<p></p>
<details></details>
<p></p>
```

closed:
<img src="https://storage.googleapis.com/fu-logos/logos/details-menu--closed.png" alt="Details menu closed">

open:
<img src="https://storage.googleapis.com/fu-logos/logos/details-menu--open.png" alt="Details menu open">

## Dropdown for credit details / references, using an asterisk (*) icon

In order to display a dropdown with an asterisk, use the same element as the
`details-menu`, but replace `<span class="dropdown-icon"></span>` with
`<span class="asterisk-icon"></span>`.

Example:

```html
<details>
  <summary aria-haspopup="menu" role="button">
    Example of credit details.
    <span class="asterisk-icon"></span>Notice how it uses an asterisk instead of 
    a chevron icon
  </summary>
  <details-menu role="menu">
    <div class="article-promo">
      <p>Credits to FashionUnited</p>
    </div>
  </details-menu>
</details>
```
