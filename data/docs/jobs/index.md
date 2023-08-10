---
title: "Posting jobs, feed integration via JSON or XML"
images: 
  - "hero-create.jpg"
background_position: "50% 10%"
menu:
  developers:
    weight: 20
toc: true
---

# Introduction

FashionUnited’s feed service provides a full suite of real-time, highly
available Jobboard transactions. This service opens the door to FashionUnited’s
infrastructure and enables you to execute a wide variety of jobboard
transactions empowering you to control your content at FashionUnited.

To keep things simple, we also accept existing feeds you might have created for
other jobboards, like:

- LinkedIn
- Indeed
- Trovit
- Jobrapido
- Or others

Therefore, as long as you make sure all the jobs you want posted on the
FashionUnited platform are in your JSON or XML feed, we make sure they are shown
on the FashionUnited platform.

As of now we provide jobboard services for the following countries:

- [https://fashionunited.uk/fashion-jobs](https://fashionunited.uk/fashion-jobs)
  en-GB
- [https://fashionunited.es/ofertas-trabajo-moda](https://fashionunited.es/ofertas-trabajo-moda)
  es-ES
- [https://fashionunited.com.ar/ofertas-trabajo-moda](https://fashionunited.com.ar/ofertas-trabajo-moda)
  es-AR
- [https://au.fashionunited.com/fashion-jobs](https://au.fashionunited.com/fashion-jobs)
  en-AU
- [https://fashionunited.be/fashion-jobs](https://fashionunited.be/fashion-jobs)
  nl-BE
- [https://fashionunited.be/fr/fashion-jobs](https://fashionunited.be/fr/fashion-jobs)
  fr-BE
- [https://fashionunited.ca/fashion-jobs](https://fashionunited.ca/fashion-jobs)
  en-CA
- [https://fashionunited.cl/ofertas-trabajo-moda](https://fashionunited.cl/ofertas-trabajo-moda)
  es-CL
- [https://fashionunited.cn/fashion-jobs](https://fashionunited.cn/fashion-jobs)
  zh-CN
- [https://fashionunited.co/ofertas-trabajo-moda](https://fashionunited.co/ofertas-trabajo-moda)
  es-CO
- [https://fashionunited.fr/fashion-jobs](https://fashionunited.fr/fashion-jobs)
  fr-FR
- [https://fashionunited.de/jobs-in-der-mode](https://fashionunited.de/jobs-in-der-mode)
  de-DE
- [https://fashionunited.in/fashion-jobs](https://fashionunited.in/fashion-jobs)
  en-IN
- [https://fashionunited.it/lavorare-nella-moda](https://fashionunited.it/lavorare-nella-moda)
  it-IT
- [https://fashionunited.mx/ofertas-trabajo-moda](https://fashionunited.mx/ofertas-trabajo-moda)
  es-MX
- [https://fashionunited.nz/fashion-jobs](https://fashionunited.nz/fashion-jobs)
  en-NZ
- [https://fashionunited.com.pe/ofertas-trabajo-moda](https://fashionunited.com.pe/ofertas-trabajo-moda)
  es-PE
- [https://fashionunited.ru/rabota-moda](https://fashionunited.ru/rabota-moda)
  ru-RU
- [https://fashionunited.ch/jobs-in-der-mode](https://fashionunited.ch/jobs-in-der-mode)
  de-CH
- [https://fashionunited.ch/fashion-jobs](https://fashionunited.ch/fashion-jobs)
  fr-CH
- [https://fashionunited.ch/lavorare-nella-moda](https://fashionunited.ch/lavorare-nella-moda)
  it-CH
- [https://fashionunited.nl/modevacatures](https://fashionunited.nl/modevacatures)
  nl-NL
- [/fashion-jobs](/fashion-jobs) en-US
- [https://fashionunited.at/jobs-in-der-mode](https://fashionunited.at/jobs-in-der-mode)
  de-AT
- [https://fashionunited.com.br/fashion-jobs](https://fashionunited.com.br/fashion-jobs)
  pt-BR
- [https://fashionunited.cz/fashion-jobs](https://fashionunited.cz/fashion-jobs)
  cs-CZ
- [https://fashionunited.dk/fashion-jobs](https://fashionunited.dk/fashion-jobs)
  da-DK
- [https://fashionunited.fi/fashion-jobs](https://fashionunited.fi/fashion-jobs)
  fi-FI
- [https://fashionunited.hk/fashion-jobs](https://fashionunited.hk/fashion-jobs)
  zh-HK
- [https://fashionunited.ie/fashion-jobs](https://fashionunited.ie/fashion-jobs)
  en-IE
- [https://fashionunited.lu/fashion-jobs](https://fashionunited.lu/fashion-jobs)
  fr-LU
- [https://fashionunited.no/fashion-jobs](https://fashionunited.no/fashion-jobs)
  nb-NO
- [https://fashionunited.pl/fashion-jobs](https://fashionunited.pl/fashion-jobs)
  pl-PL
- [https://fashionunited.pt/fashion-jobs](https://fashionunited.pt/fashion-jobs)
  pt-PT
- [https://fashionunited.se/fashion-jobs](https://fashionunited.se/fashion-jobs)
  sv-SE
- [https://fashionunited.com.tr/fashion-jobs](https://fashionunited.com.tr/fashion-jobs)
  tr-TR
- [https://fashionunited.hu/allasok-a-divatszakmaban](https://fashionunited.hu/allasok-a-divatszakmaban)
  hu-HU
- [https://fashionunited.jp/fashion-jobs](https://fashionunited.jp/fashion-jobs)
  ja-JP

### Example XML feed

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jobs>
  <job>
    <!-- unique id for the job in the external (your) system -->
    <externalId>00001</externalId>
    <!--
      title of the job
      can only contain the name of the position
      not the city, area or company
    -->
    <title>Design Assistant</title>
    <!--
      list of job categories
      supported categories are 'Design & Creative',
      'Internships', 'Other', 'Product & Supply Chain',
      'Retail Management & In-store', 'Sales & Marketing'
    -->
    <categories>
      <category><![CDATA[Design & Creative]]></category>
      <category>Internships</category>
    </categories>
    <!-- teaser text displayed in the job list, plaintext only, no HTML allowed -->
    <qualifications>Very teasing teaser</qualifications>
    <!--
      description of the job, HTML is allowed
      (when using templates, leave it empty)
      javascript is not allowed
    -->
    <description>
      <![CDATA[We are looking for a <em>motivated</em> employee, who...</description>]]>
    </description>
    <salary>
      <amount>2000</amount>
      <!-- salary currency in ISO 4217 -->
      <currency>EUR</currency>
    </salary>
    <!-- number of available positions -->
    <positions>2</positions>
    <!-- city of job location -->
    <city>Amsterdam</city>
    <!-- country of job location -->
    <country>Netherlands</country>,
    <!-- local address of company -->
    <address>Vijzelstraat 1234</address>
    <!-- list of platforms where the job is to be published -->
    <locales>
      <locale>nl-NL</locale>
    </locales>
    <!--
      true if the job receives applications via FashionUnited universal application form
      false otherwise (external Applicant Tracking System)
    -->
    <universalForm>true</universalForm>
    <!--
      show the job title between the company description and the job description
      should be false when using a template
    -->
    <showTitle>false</showTitle>,
    <company>
      <!-- the name of the company -->
      <name>Example Fashion</name>
      <!--
        description about company
        can be html as well
      -->
      <description>
        <![CDATA[Example Fashion is a <strong>great</strong> place to work...]]>
      </description>
      <!--
        the URL of the company logo, supports: SVG, PNG, JPEG
        SVG is recommended, since it's vector based and scalable
      -->
      <logoUrl>https://example.com/logos/logo.svg</logoUrl>
      <!--
        social media sharing image (og:image) URL, supports: PNG, JPEG
        PNG is recommended, since OpenGraph does not support SVG
        minimum size 200 x 200 pixels
        see: https://developers.facebook.com/docs/sharing/best-practices/
      -->
      <imageUrl>https://example.com/images/image.png</imageUrl>
      <!-- name of contact person from company -->
      <contact>John Smith</contact>
      <!-- company contact person's phone number -->
      <phone>012 345 6789</phone>
      <!--
        company contact person's email
        this email address is used to send applications
      -->
      <email>hr@example.com</email>
    </company>
  </job>
  <!-- ... -->
</jobs>
```

## Posting jobs - options

### Full HTML Job Layout

To emphasize branding for job openings on the FashionUnited jobboard, there is
an option to use custom HTML styling. A few rules apply to this:

- If you want to use images, please send them separately to FashionUnited so we
  can upload them to our servers. Hotlinking of images is allowed, but we prefer
  local images as we can then guarantee optimum performance for your job
  postings.
- All CSS must use classes. We cannot accept generic CSS like
  `p {font-size:12px;}` but must have: `.brand-name p {font-size:12px;}`
- Hotlinking of styles is not allowed.
- Scripts are not allowed at all. You can however use the responsive image &
  responsive embed classes as provided in the Twitter Bootstrap 3 framework.

#### Example for CSS usage

```html
<link href="/global-assets/brands/brandname/css/brandname.css" rel="stylesheet" type="text/css">

<div class="brandname">
    <p>
        JOB DESCRIPTION TEXT
    </p>
    <h2>We are looking for someone who</h2>
    <ul>
        <li>Collaborates</li>
        <li>Develops long term plans</li>
        <li>Participates</li>
    </ul>
</div>
```

### Fonts

- If a non-standard font is used, a licenced version has to be supplied. If that
  cannot be submitted, we always use a font as similar to it as possible via
  Google Fonts.
- We have limited maximum number of different fonts to 2 in one page.

### Images

- Logo's are best supplied in SVG format. You can check this
  [link](/docs/logo/).
- Header images are minimum size of 970px wide, any height | BIGGER IS ALWAYS
  BETTER | If header images are carousel, we have limited maximum number of 4
  images.

### Media

- We can embed videos from Youtube or Vimeo – all we need is a link and of
  course for the embedding option to be turned on for the specific video.
- We can of course link to any social media account possible. For the most
  common ones, we have logos ready for use, but if you need a link to a slightly
  lesser known medium, please supply a vector oriented logo for that as well.

### Example Embed Media (for video)

```html
<!-- For Vimeo -->
<div class="embed-responsive embed-responsive-16by9 ">
  <iframe class="embed-responsive-item" src="https://player.vimeo.com/video/...."></iframe>
</div>

<!-- For Youtube -->
<div class="embed-responsive embed-responsive-16by9" style="margin-top: 10px">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/...."></iframe>
</div>
```
