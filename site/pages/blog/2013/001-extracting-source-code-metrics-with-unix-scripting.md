---

title: Extracting source code metrics with shell scripting
layout: blogpost.hbs

slug: 2013-extracting-source-code-metrics-shell-scripting
author: Nico Rehwaldt<https://github.com/Nikku>

tags: [ 'bash' ]

published: 2013-12-08 15:10

---

<p class="intro">
  Recently I was looking at a project and wanted to capture a number of code metrics to see how the project developed over time.
  It turns out some interesting metrics can easily be extracted with basic shell scripting.
</p>

<!-- continue -->


I wanted to figure out, whether the project grew or shrinked over time and how that relates to test code and the number of test cases.

A few metrics that I was interested in were

*   source code size (lines of code and files)
*   test code size (lines of code and files)
*   number of tests

What I came up with is number of bash snippets that collected the information form me.


## Bash for the win

Given I wanted to scan the current directory `.` for source files matching `*.java` we may implement the metrics as follows:

#### Number of Files

```bash
find . -type f -name "*.java" | wc -l
```

#### Lines of Code (LOC)

```bash
find . -type f -name "*.java" \
  -exec cat {} \; | sed '/^\s*$/d' | wc -l
```

This excludes empty lines (`sed '/^\s*$/d'`).

#### Number of Tests

```bash
find . -type f -name "*.java" \
  -exec cat {} \; | grep @Test | wc -l
```

It scans for unit tests (in my case indentified by a `@Test` annotation).


## Over Time Metrics

Based on the three metrics, over time data an be collected by browsing through the projects versioning history.
I combined the above snippets [in a small script](https://gist.github.com/Nikku/4a4c0b7848bd78afc457) that checks out a number of commits to collect the metrics of a project over a series of commits.

It logs `commit_hash`, `src_files`, `test_files`, `src_loc`, `test_loc` and `num_tests` as comma separated values into a specified file. To use it, collect all commits you would like to analyse via `git rev-list first_commit..last_commit` first.

This results in a CSV file with all information in place, ready to be visualized.


## Summary

As it turned out, shell scripting is an appropriate environment do do quick and dirty extraction of source code metrics.
The performance is well enough for a nightly job, too.
On my developer machine for around 90k lines of code project, the scanning takes aproximately five seconds per commit.

Happy analyzing!