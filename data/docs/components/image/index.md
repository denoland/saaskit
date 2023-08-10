---
title : "Multiple Image examples in AMP"
description : "AMP demo of images using different techniques, including GIF video, responsive sizes with srcset, fallback and placeholder images."
images: 
  - "image.jpg"
tag: amp
menu:
  developers:
    parent: 'Components'
    weight: 20
amp:
  elements:
toc: true
---

## AMP Image with srcset

{{< amp-image src="//placehold.it/600x600"
    height="300"
    width="300"
    layout="responsive"
    alt="Alternative Text"
>}}

## Image with double placeholder

1 svg 1kb, 1 png 140kb for video gif of 3MB+
{{< amp-image-wrap src="wavepool.gif"
    width="400"
    height="300"
    layout="responsive"
    alt="Alternative Text"
    attribution="CC courtesy of placehold.it"
>}}{{< amp-image-wrap src="wavepool.png"
    layout="fill"
>}}{{< amp-image
attribute="placeholder"
src="wavepool-placeholder.svg"
    layout="fill"
>}}
{{< /amp-image-wrap >}}
{{< /amp-image-wrap >}}

# AMP Image with srcset

{{< amp-image src="//placehold.it/600x600"
    srcset="//placehold.it/600x600 640w, //placehold.it/150x150 320w"
    height="300"
    width="300"
    layout="responsive"
    alt="Alternative Text"
    attribution="CC courtesy of placehold.it"
>}}

# AMP Image with srcset & Fallback

<amp-anim src="wavepool.gif"
  layout="responsive"
  width="400"
  height="300">
  <amp-img placeholder
    src="wavepool.png"
    layout="fill">
  </amp-img>
</amp-anim>

# Placeholder image

<amp-anim src="wavepool.gif"
  layout="responsive"
  width="400"
  height="300">
  <amp-img placeholder
    src="wavepool.png"
    layout="fill">
  </amp-img>
</amp-anim>

# Fallback WebP with JPG, different image formats

<amp-img alt="Mountains"
  width="550"
  height="368"
  layout="responsive"
  src="mountains.webp">
  <amp-img alt="Mountains"
    fallback
    width="550"
    height="368"
    layout="responsive"
    src="mountains.jpg"></amp-img>
</amp-img>

TODO
<!-- {{/*

*/}} -->
