---
title: "FashionUnited for Websites"
author: Joost van der Laan
---

Fashionunited for Websites is a suite of embeddable widgets, buttons, and
client-side scripting tools to integrate Fashionunited and display jobs on your
website or JavaScript application, including Embedded Jobs.

## Embedded Job Accordion

(Embed jobs on your site, loaded from our API)

With this API one can easily display jobs on one's own website while the jobs
are being hosted by us. This allows people to not worry about having to setup an
infrastructure to handle vacancies and also generates far more traffic than
publishing jobs on their own website.

Some examples:

[Asics Branding Page](https://fashionunited.uk/jobs/asics-jobs),
[SMCP Branding Page](https://fashionunited.de/jobs/smcp-jobs),
[VF Branding Page](https://fashionunited.de/jobs/vf-jobs),
[GAB](http://www.gab.eu/jobs/)

To place this API in your own website, all you need to do is paste a bit of code
on any page or site you want for it to display. It is in fact more easy than
embedding a YouTube video.

```html
<div
  class="fu-embed-jobs"
  data-locales=""
  data-profile_id=""
  data-component="CompanyJobs">
  <script src="https://fashionunited.com/global-assets/jobs-embed/embed.js" async=""></script>
</div>
```

_Bare minimum code for job embedder. Add locale and profile ID (to be generated
by FashionUnited). Styling can be adapted to match any site design._

```html
<div
  class="fu-embed-jobs"~~~~
  data-locales="en-US,nl-NL"
  data-category="Design & Creative"
  data-profile_id="2HycEba6EMxMYbyJN"
  data-keywords="fashionweek"
  data-limit="20"
  data-skip="15"
  data-component="CompanyJobs">
  <script src="https://fashionunited.com/global-assets/jobs-embed/embed.js" async=""></script>
</div>
```

_Optional fields that can be added._

## Attributes

- data-locales: Comma separated list of locales to be displayed, all meteor job
  board locales if ommitted

- data-category: Name of category to be displayed, possible values:

  - "Design & Creative",
  - "Internships",
  - "Other",
  - "Product & Supply Chain",
  - "Retail Management & In-store",
  - "Sales & Marketing"

- data-profile_id: mongodb \_id of the profile to be displayed (to be generated
  by FashionUnited)

- data-keywords: keywords to filter on (same as you would type it in the search
  field in the meteor job board)

- data-limit: number of jobs to be displayed (default is 10)

- data-skip: number of jobs to be skipped (for pagination)

- data-component: which component to use when displaying jobs:
  - "CompanyJobs": show the jobs for an external company page (default).
  - "HomePageJobs": show jobs for our home pages.
  - "SearchJobs": add a search box to the CompanyJobs.

## Examples

## Jobs Embedder

Get the ID from the dashboard. Profiles > edit. The ID is in the URL. Set the
limit to _**100**_ jobs to show all the jobs for most companies. For those that
have more, it is not recommended to set this higher as the load would increase
and the page will slow down.

### Code

data-profile_id is used for selecting the company. FashionUnited can provide you
with your company profile ID.

**Third-party site**

```html
<div class="fu-embed-jobs" data-component="CompanyJobs" data-locales="en-US,nl-NL" data-limit="5" data-profile_id="Y6Maua8gHEFRHuQTN"></div>
```

### Simplified example, Pandora

**Third-party site**

```html
<div class="fu-embed-jobs" data-component="CompanyJobs" data-limit="5" data-profile_id="KfcXaKxq4XXjbeefY"></div>
```

## News Embedder

### Code

**Third-party site**

To embed a list of 5 news articles from FashionUnited.com about Pandora, use the
following code:

```html
<div class="fu-news-embed" data-field="fashionunitedComNewsArticles" data-keywords="pandora,pandora-related," data-limit="5"></div>
```
