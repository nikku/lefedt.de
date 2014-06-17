---

title: Exploring Run-time Behavior in Reversible Experiments
layout: blogpost.hbs

slug: 2012-master-thesis-finished
author: Nico Rehwaldt<https://github.com/Nikku>

tags: [ 'thesis' ]

published: 2012-09-24 20:22

---


Finished my [master thesis](http://nixis.de/~nikku/uni/master/thesis/exploring-run-time-behavior-nre-2012.pdf) entitled *Exploring Run-time Behavior in Reversible Experiments - An Application of Worlds for Debugging*. It is about painting walls and refrigerators.

<!-- continue -->

From the abstract:

>   Debuggers are often used to inspect running software systems in order to support the understanding of source code. They differ substantially from most tools that visualize run-time data as they make it possible to keep track of a running program as it executes. Thereby they encourage learning through experience. At the same time, conventional debuggers do not properly support incremental understanding. The reason is that they offer only limited options to safely re-explore a particular run-time behavior without restarting the program under observation.

>   Against that background, this work examines Worlds [44]—a language extension that allows for scoping of side effects in imperative programming languages. The thesis evaluates the concept of Worlds to isolate side effects caused during debugging. By doing so, the effects of prior explorations can be discarded and the examination of run-time behavior gets safe to be repeated until it yields the desired knowledge gain.

>   In the course of this work, we present the principle application of Worlds to enable debugging in reversible experiments. Furthermore, we propose a general purpose Worlds mechanism for Squeak/Smalltalk, which is necessary to evaluate the practical application of the concept for Smalltalk. In the course of the evaluation, we present a debugger that employs the mechanism to realize the safe re-examination of behavior inside a debugging session.