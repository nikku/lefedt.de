---

title: "Contributing to Open Source Projects via Pull Requests: A Checklist"
slug: 2013/contributing-to-oss-through-pull-requests
layout: post

tags: [ git, github, contributing, open source, version control, software development ]

author: Nikku<http://lefedt.de/about>

published: 2013-06-13

---


So there is an open source project on [GitHub](https://github.com). And you forked it already. And there is this bug `XYZ` you would like to fix, throught a [pull request](https://help.github.com/articles/using-pull-requests). This post is a short checklist on how to do it.

<!-- continue -->


## Use Feature Branches

Get ready to work with [feature branches](http://martinfowler.com/bliki/FeatureBranch.html). Those isolate the work you do for a particicular pull request from all the other things you want to contribute.

Create a branch for the issue `XYZ` where you will implement the bug fix.

```
git checkout master        # starting point is your master
git checkout -b XYZ        # create and checkout branch XYZ
                           # you are going to work on
```

Do non-stop coding. All day all night. Mind coding styles of the project you are working on. Use the right tools.

At some point you are done.

```
git log                    # check what you have done
```


## Cleanup using `git rebase`

You may have produced several commits. And there may be typos in your commits. Or you commited `try to fix bug (1..n)`. Squash (i.e. combine) all of your commits and give it a nice commit message. This makes it easier for reviewers to see the actual changes and to eventually merge the pull request.

Your tool for the job is [interactive rebase](https://help.github.com/articles/interactive-rebase). It allows you to reword, remove, combine and alter commits.

```
git rebase -i HEAD~n       # n=number of commits from HEAD
                             # you created
```

This pops up an interactive console

```
pick 906eb32 yea, nearly done
pick 8a45bb9 ok, late night trying again
pick b86deaf got ya
```

Combine all of your commits into one by assigning `s` or `squash` as the rebase operation.


```
pick 906eb32 yea, nearly done
s 8a45bb9 ok, late night trying again
s b86deaf got ya
```

Finish the job, i.e. press [ESC], [:wq] to write the changes and close the editor.

You will be asked to write a commit message that describes everything you did. Make it a [good one](https://github.com/erlang/otp/wiki/writing-good-commit-messages) (check your projects contribution guidelines, too).

Again, finish the job with [ESC], [:wq].

You are done and your changes are ready to be published!


## Push, Pull Request, restart

Push the stuff to your remote:

```
git push origin XYZ
```

If you have pushed parts of the work before, you may need to override these changes by applying force (`-f`):


```
git push -f origin XYZ      # overrides history on the server
                            # branch so take care what you do
```

Create a pull request from your `origin/XYZ` branch to the OSS projects development branch.

Switch back to your master branch


```
git checkout master
```

And create a new feature branch for this `AABB` issue you wanted to fix for such a long time already.

```
git checkout -b AABB
```

## There is more

There exist many more resources worth checking out on the topic:

* [How to GitHub](https://gun.io/blog/how-to-github-fork-branch-and-pull-request/)
* [How and why feature branches](https://www.atlassian.com/git/workflows#!workflow-feature-branch)
* [Keeping feature branches in synch with upstream changes](http://ginsys.eu/git-and-github-keeping-a-feature-branch-updated-with-upstream/).