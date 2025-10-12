---

title: 'Future tech debt'
slug: 2025/future-tech-debt
description: A rant on fancy new stuff, and why it is likely your future tech debt.
layout: post

tags: 
  - software engineering

author: Nikku<http://lefedt.de/about>

published: 2025-10-12

---


<p class="intro">
  In software engineering, new tools, libraries and approaches sweep in all the time. How much time we want to spend to renovate things, adapt the shiny new? There is value in building your own work on the boring stuff, the things that just work, do one thing and do it well. What is fancy today is likely future tech debt.
</p>

<!-- continue -->

To some of my fellow developers I recently sent the following message:

> [rant] Sometimes we think we're fancy "trying new stuff", but without actually "migrating over" we'll just pile up technical debt. Today I spent 2:30 hours, trying to get [some project] back to a usable state ("running tests locally and on CI"). What is trivial with most of our projects (because they use the same, proven infrastructure) was much harder, because the project uses [fancy cool thing, 4 years ago].
>
> **TLDR:** When inventing new things, or "modernizing things" always consider the cost of you getting back into the "new stuff", which will just be "different stuff" in two years from now. There is value in just doing boring software development. There is value to work on top of technology that just does the job, and does it right. I have not seen a benefit of [fancy new thing] over [the old thing] that would justify the cost [of migrating]. For me personally, this is just future tech debt.
>
> PS: Of course there will be times when we decide (for clear reasons) to migrate over. But [such reasons should be justified](https://nikku.github.io/talks/2025-no-refactoring-issues/#finish-what-you-started).

To the message, I attached [XKCD#927](https://xkcd.com/927/), titled "Standards":

[<img class="noborder" src="https://imgs.xkcd.com/comics/standards.png" alt="XKCD #927 - Standards" />](https://xkcd.com/927/)
