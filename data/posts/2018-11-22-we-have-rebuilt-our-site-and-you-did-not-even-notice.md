---
title: "We have rebuilt our site, and you didn't even notice"
description: "In preparation of the design upgrade, a lot has already changed."
author: "Joost van der Laan"
authors:
  - "Joost van der Laan"
headerimage: true
date: 2018-11-22 13:07:01+00:00
published_at: 2018-11-22
categories:
  - "IT Update"
  - "Product development"
tags:
  - "IT update"
  - "blog"
images:
  - "react-compared.jpg"
---

In preparation of the design upgrade we're working on, a lot has already
changed. Remember the blog post about experiments with GraphQL and React, back
in May? Well, brace yourself, cause we've **already rebuilt most of the news
homepage and article pages** with it.

<figure>{{< amp-image src="./react-compared.jpg" width="2128"
    height="1973" layout="responsive" alt="Screenshot React replaced modules" attribution="CC courtesy of Joost van der Laan" >}}</figure>

<!-- ![ImageAlt][imgref]

[imgref]: ./react-compared.jpg "ImageTitle" -->

The green shows parts that are already replaced. This means both the homepage
and article pages are more easy to replace when the _**design upgrade**_ is
ready. Also, both the homepage and article page load significantly faster, and
the load on our current content platform is greatly reduced.

The key takeaway here is that we use React components, small building blocks you
can use to build a website. It is a more modern approach when compared to Joomla
PHP layouts and templates, as it allows for more flexibility in how you build a
page. Think of it as Lego blocks, where you can have a lot of different colors
and sizes and piece them together any way you like. On top of that, it's far
more easy for us to use data from different systems (jobs, news, lookbook) on a
single page.
