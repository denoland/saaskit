---
title: "Small steps big changes"
description: "Taking small steps is key when implementing changes, like a new design."
author: "Joost van der Laan"
authors:
  - "Joost van der Laan"
date: 2019-05-22 10:07:01+00:00
published_at: 2019-05-22
categories:
  - "IT Update"
  - "Product development"
tags:
  - "IT update"
  - "blog"
images:
  - gitlab_workflow_example_11_9.png
---

The internet is constantly moving, and to keep up, you need to change things.
Not once, not twice, but constantly. As the saying goes, "The only constant is
change"_(insert some wrong attribution found in the first Google result here)._

Unsurprisingly, a big part of the work at IT revolves around change, especially
since technology is changing at an ever faster pace.

To give you an idea, we deploy new code to production (the live websites) every
day. Multiple times per day. During working hours. Did you notice it? Probably
not.

So how do we do that?

The answer is simple. You take a new feature, and you downsize it. And then,
when you think it is small enough, you try to make it even smaller.

For example, you better not implement a site-wide redesign all at once. It’s
better to do it in small pieces. That way you keep it simple and easy to work
with. A lot of tiny changes eventually add up to big transformations. But the
process is a lot smoother then big-bang redesigns. At FashionUnited we don't
like big bang redesigns. We don't like big changes. Because big-bang changes
tend to break things. The one thing people dislike more then change? Things that
break.

_Some numbers: there're roughly **over a hundred pieces of code** committed per
day by our developers, starting **thousands of automated tests** checking things
like; code quality, functionality, user interface tests, security and code style
& formatting. There're even automated screenshot tests to see if job templates
look the way they should. Finally, everything gets deployed to production (the
live sites) multiple times per day. Fully automated._

<figure>{{% amp-image src="./gitlab_workflow_example_11_9.png" width="3420"
    height="1894" layout="responsive" alt="Continuous Integration & Continuous Deployment Workflow. CI/CD" %}}</figure>

When was the last time you've seen Facebook or Google do a big makeover of their
sites? That's right, you didn't. Because they make tiny changes all the time.

Yes, their sites now look way different from what they looked like a year ago.
But it's the tiny changes carried out over the year that make it so.

In the past weeks, you've maybe seen us make tiny changes like this. For
example, the navigation bar changed colors, fonts where adjusted in some places,
then more. Menu items got changed (noticed the network link changed to
lookbook?) And so on.

<figure>{{% amp-image src="./newsarticle-card.png" width="375"
    height="385" layout="fixed" alt="NewsArticle Card" attribution="CC courtesy of Joost van der Laan" %}}</figure>

We created a lot of small pieces related to the new design. For example, the
[Job of the Week Card](https://fashionunited.com/storybook/?path=/story/card--job-of-the-week),
[news article card](https://fashionunited.com/storybook/?path=/story/card--news-article-card),
[Image list (used in lookbook)](https://fashionunited.com/storybook/?path=/story/image-list--standard),
[Navigation bars](https://fashionunited.com/storybook/?path=/story/navigation--simple)
and yes, we even have a
[snackbar](https://fashionunited.com/storybook/?path=/story/snackbar--standard)...
Kroketje anyone?

When you put some of these together, you can start seeing the bigger picture.
Check out the [lookbook](https://fashionunited.com/lookbook/) for example, it is
fully in the new design.

<figure>{{% amp-image src="./lookbook.png" width="1980"
    height="1346" layout="responsive" alt="Lookbook" attribution="CC courtesy of Joost van der Laan" %}}</figure>

Back to the news sites, we've also started to make the first changes there. Just
the last 2 weeks we started putting live the
[tags pages like this one for Adidas on UK](https://fashionunited.uk/tags/adidas).
The tags also moved to the **/tags/** sub folder to make things easy, for
example for editorial to analyse.

The [trends page got a similar treatment](https://fashionunited.uk/trends), it
has been converted to the new style and running on a new system using brand-new
technology, **optimized for mobile.**

Both the trends page and tags pages are live only on English sites. Their
performance will be monitored for a while before rolling out to other languages.

Now you probably understand why that navigation bar (we call it navbar) has
switched to white. It made it easy for us to blend in recent changes like tags &
trends pages.

You see? A lot of _small changes_ can add up to something big.

_If you want to see more of the design & upcoming changes, feel free to check
out these prototypes:_

1. [This is a mobile prototype, the most important one (remember, most traffic on the internet is mobile nowadays)](https://www.figma.com/proto/0AIzMrJXBPNXax7QoMLDIS/Design-System?node-id=8918%3A0&scaling=scale-down)
   (homepage + clickable article 5/6) - Figma
2. [Full mobile homepage design](https://www.figma.com/file/0AIzMrJXBPNXax7QoMLDIS/Design-System?node-id=8918%3A0) -
   Figma

3. [This is a desktop prototype](https://www.figma.com/proto/0AIzMrJXBPNXax7QoMLDIS/Design-System?node-id=8283%3A2290&scaling=min-zoom)
   (homepage + first article card clickable) - Figma
4. [Full desktop homepage design](https://www.figma.com/file/0AIzMrJXBPNXax7QoMLDIS/Design-System?node-id=8974%3A4308) -
   Figma
