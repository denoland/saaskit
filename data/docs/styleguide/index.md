---
title: "Styleguide"
author: Joost van der Laan
comments: false
date: 2020-08-04 13:23:01+00:00
images:
  - "hero-create.jpg"
menu:
  developers:
    weight: 99
---

## Styleguide

Examples of styling content **without** code samples in between.

### Typography

Examples of typography

# h1 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

## h2 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

### h3 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

#### h4 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

##### h5 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

###### h6 Heading

The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

<span class="subtitle1">Subtitle1</span>

<span class="subtitle2">Subtitle2</span>

Body1 The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.

<p class="body2">Body2 The Fashionunited platform connects your website or application with the worldwide fashion conversation happening on Fashionunited.</p>

<span class="overline">Overline</span>

<span class="btn">Button</span>

<span class="caption">Caption</span>

## Horizontal Rules

___

---

***

## For typography pro's: Smart quotes, mdash & ndash

mdash: &mdash;
ndash: &ndash;
regular hyphen: -

<!-- 
## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes' -->

## Emphasis

**This is bold text**

**This is bold text**

*This is italic text*

*This is italic text*

~~Strikethrough~~

## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
    + Marker character change forces new list start:
        + Ac tristique libero volutpat at
        + Facilisis in pretium nisl aliquet
        + Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar

## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code

Block code "fences"

```
Sample text here...
```

Syntax highlighting

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link <https://github.com/nodeca/pica> (enable linkify to see)

## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"

## Emojies

Unicode emojies are supported everywhere nowadays, use them:
[Unicode emoji list](https://unicode.org/emoji/charts/full-emoji-list.html)

 Copy-paste from the **browser** column. Result:

 😀

<!-- `U+1F609`	becomes: `&#1F609;` becomes: &#1F609;  -->

## Unicode characters

&#9658;
&#767;
&#2400;

All different ways of writing should work. For example, for Euro:

`&#8364; &#x20AC; &euro;` =

&#8364; &#x20AC; &euro;

### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

+ 19^th^
+ H~2~O

### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++

### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==

### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.

### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

*Compact style:*

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b

### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.

*[HTML]: Hyper Text Markup Language

### [Custom containers](https://github.com/markdown-it/markdown-it-container)

::: warning
*here be dragons*
:::
