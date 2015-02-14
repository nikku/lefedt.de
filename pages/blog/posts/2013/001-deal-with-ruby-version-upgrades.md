---

title: Using STFU powers to deal with Ruby version upgrades
slug: 2013/deal-with-ruby-version-upgrades
layout: post

tags: [ ruby, ruby on rails, encoding ]

author: Nikku<http://lefedt.de/about>
published: 2013-03-24

---

... or how to spend unneccessary time on infrastructure problems.

Ruby is a great language and offers [many tools](https://rubygems.org/) to quickly develop ([web](http://rubyonrails.org/)) applications and awesome libraries. But sometimes it sucks. And that is the case when migrating applications to new Ruby versions.

<!-- continue -->

The last weekends I worked on switching my Ruby on Rails 2.x applications from Ruby 1.8 to Ruby 1.9. One thing I learned is that Ruby 1.9 uses UTF-8 for file encoding now. Rails 2.3 applications and libraries (e.g. the `mysql` gem) have a number of issues with that, different ones depending on the platform you are running ruby on. This is a non-complete list of things to care about when updating.

## Encoding Update

To start with, Ruby uses the `LANG` environment variable to determine file encoding. So make sure you have it set to a UTF-8 locale on your system.

```
irb(main):001:0> ENV['LANG']
=> "en_US.UTF-8"
```

Next, make sure that you do not use any special NON-ASCII characters (åößè are good candidates) in mail templates because the `action-mailer` gem for Rails 2.3 does not quite seem to understand UTF-8 yet.

Also, make sure your source files are UTF-8 encoded (adding the `# encoding: utf-8` header may be required, too). And then, instruct your rails application to use UTF-8 as [the default encoding](https://gist.github.com/cypriss/1976864):

```ruby
# add to top of config/environment.rb
Encoding.default_external = Encoding.default_internal = Encoding::UTF_8
```

If you use regular expressions, do not wonder why they [don't match anymore](http://stackoverflow.com/questions/3576232/how-to-match-unicode-words-with-ruby-1-9). They just don't because you may not have solved [all encoding problems](http://yehudakatz.com/2010/05/05/ruby-1-9-encodings-a-primer-and-the-solution-for-rails/) yet.


## After encoding

You are done with encoding problems now and want to use all the latest UTF-8 compatible gems now?
Reconsider. Then make sure to stick to the 1.x version of `rubygems`. Because rails 2.3 does not like the 2.0 versions of the gem.

Check your database connectivity library (I used the `mysql` gem for Ruby 1.8). The `mysql` gem has encoding issues on Linux systems, so switching to the `mysql2` gem is inevitable. Only versions < 0.3 work though. Just because. If you are on windows stick to the `mysql` gem for now. Because `mysql2` gives `Bad file descriptor` errors.


## Remove deprecation warnings

Use `Object#tap` instead of `#returning`. Looks awful in code but prevents your server log from getting spammed.

Think about monkey patching your Rails 2 app for some more UTF-8 compatibility or switch directly to Rails 3.


## Finally

Drink a coffee, eat a muffin and read about others [going](http://nerds.airbnb.com/upgrading-from-ree-187-to-ruby-193) [through](http://techtime.getharvest.com/blog/harvest-is-now-on-ruby-1-dot-9-3) the same kind of stuff, some even spending month to do it.