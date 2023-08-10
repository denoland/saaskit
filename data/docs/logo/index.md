---
title: Logo
images: 
  - "hero-create.jpg"
background_position: "50% 10%"
menu:
  developers:
    weight: 20
toc: true
---

## Quality Assurance

### SVG logo

SVG is an image format for vector graphics. It literally means Scalable Vector
Graphics. Basically, what you work with in Adobe Illustrator. You can use SVG on
the web pretty easily, but there is plenty you should know.

#### Why use SVG at all?

- Small file sizes that compress well
- Scales to any size without losing clarity (except very tiny)
- Looks great on retina displays
- Design control like interactivity and filters

#### SVG requirements

In order to make the SVG images responsive in all the browsers it's important to
follow the following requirements:

- Remove the height and width from the svg tags.
- Add preserveAspectRatio="xMinYMin meet".

Example:

SVG tag before:

```html
<svg version="1.1" id="underground-sign" xmlns="http://www.w3.org/2000/svg"
width="960px" height="560px" viewBox="0 0 960 560" xml:space="preserve">
```

SVG tag after:

```html
<svg version="1.1" id="underground-sign" xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 960 560" preserveAspectRatio="xMinYMin meet">
```

This will ensure that the SVG image will resize to any container.

In addition, the aim of this section is to ensure the maximun quality of the
images in any device specially smartphones. Thus, we strongly recommend to use
the path property for shaping the image instead of an image tag inside the svg
tag.

[Source: W3C](https://www.w3.org/TR/SVG/single-page.html#coords-PreserveAspectRatioAttribute)

#### SVG at FashionUnited

For all job feed integrations and job postings we are able to use SVG. Logo's
are therefore best supplied in SVG format.

TLDR; If you want your brand to look best on the internet, on all devices, use
SVG.

## FashionUnited Logo Usage

The logo makes the link between fashion and uniting everyone working within the
industry, which of course the name FashionUnited embodies. It is displayed in a
stylish and modern font, with an emphasis on the word United by making that
bold.

The normal logo with FASHIONUNITED spelled together is preferred. But in terms
of size, this is sometimes suboptimal, therefore the square version created. It
must always be accompanied by the circular logo with the F in it, or favicon.

In principle, the logo will only be used in black or in white. The background
color or the image the logo is placed upon may vary in color, so obviously it
depends on that whether the white or black logo is to be used.

{{< amp-image src="icon-logo-613x357.jpg" width="613" height="357"
layout="responsive" >}}
<br>

The FashionUnited circle, when used in this combination, should always have a
height of 400% of the FashionUnited letters.

The Full logo should always have a whitespace around it of the same height of
the FashionUnited letters.

{{< amp-image src="icon-270x269.jpg" width="270" height="269"
layout="responsive" >}}
<br>

The whitespace arount the circle logo should always be 25% of the size of the
logo.

{{< amp-image src="logo-572x87.jpg" width="572" height="87" layout="responsive"
>}}
<br>

If the text-only logo is used there aways is a minimum whitespace around the
logo of 50% of the height of the logo.

{{< amp-image src="22-66-22-807x914.jpg" width="807" height="914"
layout="responsive" >}}
<br>

The logo can never be wider than 66% of the maximum width of the area it is
placed in.

{{< amp-image src="onderbalk-802x914.jpg" width="802" height="914"
layout="responsive" >}}
<br>

If we make a screen or ad with a background image or background color, we always
show the logo in a white border on the bottom (which is 10% of the height of the
image.)

### Download

Here you can download the logo in various formats and packages:

- [all FashionUnited logos in .ai format](/docs/logo/FashionUnited-ai-logos.zip)
- [all FashionUnited logos in .eps format](/docs/logo/FashionUnited-eps-logos.zip)
- [all FashionUnited logos in .svg format](/docs/logo/FashionUnited-svg-logos.zip)
- [all FashionUnited logos in all vector oriented formats](/docs/logo/FashionUnited-vector-oriented-logos.zip)

Additionally, you can download the
[complete logo stylesheet in .pdf format](/docs/logo/styleguide_FU_logo_2021.pdf).
