---
title: "Improved job scheduling!"
description: "Getting jobs online faster, while not looking like a 'BrandX-only' jobboard"
author: "Joost van der Laan"
date: 2018-11-22 13:07:01+00:00
published_at: 2018-11-22
categories:
  - "IT Update"
  - "Product development"
tags:
  - "IT update"
  - "blog"
images:
  - "job-list-nike.png"
---

Big clients with a lot of jobs. We've got a few, but weren't always happy with
how the jobboard looked. One Francesca's having a lot of jobs in a feed can make
the FashionUnited jobboard really look like a Francesca's jobboard instead.

So we decided to take action. We setup the jobboard so clients can only post 1
job every 30 minutes per brand during working hours. Get it? 1 Francescas's
job - wait 30 minutes - 1 Francesca's job - wait 30 minutes and so on. Within
that 30 minutes it's likely that another company also posts a job, and this is
enough to prevent our jobboard to look like Francesca's jobboard.

All good, you'd think.

But then along came Nike. Over a 1000 jobs and they needed to go online ASAP.
Peter managed to put everything online at once, but it took just 2 weeks before
we ran into trouble again.

![Job list Nike, the new situation][joblist]

Apparently, Nike "updates" all of it's jobs every few weeks with new ID's. No,
not new content, no new title, not extra details in the description. They
changed just the ID. Not really an update, is it? Well, we've seen this before.
Some companies do this to trick other systems, for example to get jobs at the
top of the jobboard list. Sometimes it is just a limitation of their current ATS
that causes this. (Taleo in the case of Nike) As a result, hundreds of Nike jobs
(the old ID's) went offline. At the same time the queue with jobs to post in the
future started growing. Hundreds of jobs, to be posted in the coming months.
Yes, months. That's what happens when there's only 1 company posting. Since Nike
couldn't help this happening, we needed a fix.

Peter set out on a journey, deep down into the core of our jobs platform while
thousands of jobs where flying around his ears, to find a solution. He came up
with a revamped job scheduler, where we can publish lots of jobs, even within
those 30 minutes.

It works like this, taking Nike as an example:

Posts every minute a maximum 20 jobs. (from any company) For Nike, no new job
will be posted within 30 min, if the previous job is also from Nike. But, once
Francesca's posts, a Nike job will be posted the next minute. (not waiting 30
minutes) Therefore, as long as there is diversity in companies, we can post
orders of magnitude more jobs and the queue won't fill up until months into the
future.

[joblist]: ./job-list-nike.png "Job list Nike, the new situation"
