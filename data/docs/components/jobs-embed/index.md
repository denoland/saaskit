---
title : "Embedders for Jobs and News"
description : "Jobs and News Embedder demo"
embedder: true
tag: Embedder
menu:
  developers:
    parent: 'Components'
    weight: 20
images:
  - "hero-create.jpg"
toc: true
---

## Jobs Embedder

Get the ID from the dashboard. Profiles > edit. The ID is in the URL.
Set the limit to ***100*** jobs to show all the jobs for most companies. For those that have more, it is not recommended to set this higher as the load would increase and the page will slow down.

### Code

data-profile_id is used for selecting the company. FashionUnited can provide you with your company profile ID.

**Third-party site**
{{< highlight html >}}
<div class="fu-embed-jobs" data-component="CompanyJobs" data-locales="en-US,nl-NL" data-limit="5" data-profile_id="Y6Maua8gHEFRHuQTN"></div>
{{</ highlight >}}

**FashionUnited site**
{{< highlight html >}}
{{< jobs-embedder limit="5" id="Y6Maua8gHEFRHuQTN" locale="en-US,nl-NL" >}}
{{</ highlight >}}

### Result for Nike

{{< jobs-embedder limit="5" id="Y6Maua8gHEFRHuQTN" locale="en-US,nl-NL" >}}

### Simplified example, Pandora

**Third-party site**
{{< highlight html >}}
<div class="fu-embed-jobs" data-component="CompanyJobs" data-limit="5" data-profile_id="KfcXaKxq4XXjbeefY"></div>
{{</ highlight >}}

{{< jobs-embedder locale="en-US" limit="5" id="KfcXaKxq4XXjbeefY" >}}

## News Embedder

### Code

**Third-party site**
{{< highlight html >}}
<div class="fu-news-embed" data-field="fashionunitedComNewsArticles" data-keywords="pandora,pandora-related," data-limit="5"></div>
{{</ highlight >}}

**FashionUnited site**
{{< highlight html >}}
{{</*news-embedder field="fashionunitedComNewsArticles" keyword="pandora,pandora-related," limit="5"*/>}}
{{</ highlight >}}

### Result for Pandora

{{< news-embedder field="fashionunitedComNewsArticles" keyword="pandora,pandora-related," limit="5" >}}

#### Source code

On a FashionUnited landing page use the Hugo shortcode.
{{< highlight html >}}
{{</*jobs-embedder locale="en-US" limit="5" id="Y6Maua8gHEFRHuQTN"*/>}}
{{</ highlight >}}
On a client side use html and the embedder javascript.
{{< highlight html >}}
{{< jobs-embedder locale="en-US" limit="5" id="Y6Maua8gHEFRHuQTN" >}}
{{< / highlight >}}
