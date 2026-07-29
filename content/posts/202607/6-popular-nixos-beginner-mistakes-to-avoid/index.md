---
title: "[Transcript/Vocabulary] 6 Popular NixOS Beginner Mistakes To Avoid"
date: 2026-07-29
categories: ["english-learning", "nix"]
slug: "6-popular-nixos-beginner-mistakes-to-avoid"
type: "post"
---

## Reference

6 Popular NixOS Beginner Mistakes To Avoid

https://www.youtube.com/watch?v=jQzPRYgJw04

## Transcript

### 0:00–1:00 — Introduction and online privacy

whether you are new to nixos or an experienced user we all know it is a rabbit hole that goes very deep and descends rapidly and so along the journey every NYX user is likely to experience inevitable mistakes ranging from harmless issues to potentially dangerous errors which is why today we will talk about several mistakes you should be worry about when getting into nixos starting with the most basic Common Sense stuff you likely already know about and finishing with some less obvious mistakes still frequently made by beginners but before we begin talking about the mistakes it would be a mistake not to tell you about the sponsor of today's video nordvpn I'm sure you all are already well aware what nordvpn is it is one of the biggest VPN providers in the world after all and one that I've personally used extensively it's known for being blazingly fast easy to use and most importantly privacy oriented because in a world where surveillance and censorship are only getting worse day by day protecting your online activity has become more crucial than ever and nordvpn helps you with all of that by securing encrypting all the

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| rabbit hole | A situation that becomes increasingly complex as you explore it. |
| malicious | Intended to cause harm. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| range from ... to ... | Include many cases between two limits. |

### 1:00–2:00 — Sharing configurations

internet traffic on your device and allowing you to connect to any of the 118 countries all over the world ensuring you get access to all possible news sources and protecting you from fake or malicious websites with its threat protection Pro feature so if you are serious about online privacy and security Now is the perfect time to follow the link you see on the screen and in the video description to get an exclusive New Year's deal on nordvpn with all four extra months included for free only at nordvpn.com viim joer and now starting with the first dangerous mistake that I very often see beginner nxs users make which is simply not backing up their configuration or keeping it under Version Control I know it sounds obvious but you'd be surprised how often people accidentally end up with a corrupted configuration that it's hard to debug or even delete it all together with no easy way to undo the damage so before you start configuring a machine you care about please don't be lazy initialize a git repo push it to GitHub and thank yourself later doing so

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| configuration | The settings that define how a system works. |
| repository | A storage location for project files and their history. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| in case | If something happens or is needed. |

### 2:00–3:00 — Rebuilds, updates, and upgrades

will also allow you to share it with others in case you ever have to ask for help because trust me it's much easier to find an error in a GitHub repo than a bunch of paste bin links now the second mistake probably equally as common as the first one is not understanding the difference between rebuilds updates and roll backs because if you never update your package versions will remain the same forever and believe it or not n rebuild does not update your system it simply creates a new system generation using package versions determined by NYX packages already present on your system and if you want to actually update those NYX packages you need to pass the -- upgrade flag to the command this way nyos will first download a new version of Nyx packages on your computer and only then rebuild your system giving you a brand new NX generation with fresh new packages however the new package versions will of course only be present on this new generation of Nyx since NYX has no problem storing unlimited amount of different versions of the same package which neat Segways us to the

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| rebuild | Create a system configuration again from its definition. |
| upgrade | Replace software with a newer version. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| keep track of | Continue to know about changes or progress. |

### 3:00–4:00 — Garbage collection

third mistake many new NYX users do not garbage collecting your NYX store because as you update and use shells the old package versions and generations will accumulate over time and eventually can even completely fill your disc so to prevent this from happening don't forget to regularly garbage collect the old Generations you don't need to overdo it keep as many as you want just like updating when and how often you do it depends largely on your personal preference and specific use cases or alternatively you can even automate both updating and cleaning processes using the options you see on the screen next the fourth mistake I sometimes see people make is neglecting the declarative features of Nyx like manually changing your GPU settings desktop environment preferences or even your user password unaware that these changes will not be tracked by nixos and no amount of rolling back will revert them want NX to keep track of something tell it about it it's not some kind of magic backup system after all and I am not saying that everything must be declared in an option that's your choice

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| garbage collect | Remove data or packages that are no longer needed. |
| generation | A saved version of a NixOS system configuration. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| over time | Gradually as time passes. |

### 4:00–5:00 — Declarative configuration

however understanding what is and isn't a part of your configuration is crucial to avoid roll back and general system issues but perhaps the most common mistake from this category and one that I unfortunately very often see promoted online is the use of the Nyx n command what it does is permanently manipulate your NYX environment allowing you to imperatively do dangerous actions like installing or uninstalling packages which may not seem that scary at first but they issue is that most actions performed by NX EnV will also require NX EnV to be undone with no easy way to track the changes meaning by using it you are putting yourself at risk of polluting your system with Undeclared packages or even completely breaking your system the same can be said for the Nyx profile command which is essentially a modernized flake compatible alternative to Nyx EnV but while it does offer a better approach to imperative package management it still goes against the declarative principles of Nyx and thus should be used with caution and

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| declarative | Describing the desired result instead of every action. |
| rollback | Return software or a system to an earlier version. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| be a part of | Belong to or be included in something. |

### 5:00–6:00 — Temporary package environments

only if you really know what you are doing but for those of you who want to download software with one command look into Nyx shells the much safer eeral environments that Grant you temporary access to any packages you may need without any drawbacks of Nick's anv or profile next before we continue to other real world mistakes a bonus mistake I was surprised to find out some people even make completely avoiding the module system and keeping everything in one file come on guys creating files on your computer is literally free and there is no real advantage to having a 2,000 line monster flake with configuration. n Hardware configuration. n or even home. n all embedded into it it does not make your configuration any more portable but only impairs readability and makes finding errors a nightmare all right now the fifth mistake is actually two very related mistakes in one which are trying to learn everything right away and overthinking everything before you even Explore the Nyx ecosystem what do I mean by that well the NY ecosystem is Absol absolutely Giant and if you as a new

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| Nix shell | A temporary environment that provides selected Nix packages. |
| profile | A user environment containing installed packages. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| look into | Investigate or consider something. |

### 6:00–7:00 — Learning at a sustainable pace

user try to learn everything right away you will only confuse yourself and end up hating your computer so take your time don't over complicate things use your machine for its intended purpose and as you run into issues look for Solutions after all using nxs is only as difficult as you make it be but like I've said don't be afraid to explore the ecosystem as there are many Cool Tools and Concepts you may not yet know about that could potentially improve your overall NX experience like flakes for example on our Discord server I've seen many people hesitant to try out flakes because they can seem daunting based on Google search results but in reality they are not nearly as complex as some people may tell you and you do not need to understand all the inner workings to use them in fact the earlier you start using flakes the less issues you will run into later because flakes not only make rolling back updates easier but also promote good reproducibility practices and even let you work with a more modern NX CLI which in my opinion is simply Superior in every way so do

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| productivity | The ability to complete useful work efficiently. |
| overcomplicate | Make something more difficult than necessary. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| take your time | Do something without rushing. |

### 7:00–8:00 — FHS compatibility

learn fakes early but don't let the learning experience harm your productivity and now the final sixth mistake super common among beginners is assuming that non FHS compliance of nyos will somehow render the system completely useless to them and yes nixos is not FHS compliant meaning there is a high chance that some poorly written bash script you found on the internet will not work on it by default but guess what at the moment of recording of this video there are more than 120,000 packages in NYX packages more than in any other Linux repo and some of them do rely on FHS for one reason or another like steam Android studio and vs code FHS just to name a few how come well it's all possible thanks to a function you can find in NYX packages called build FHS EnV which you can use to create lightweight FHS sandboxes for any programs that rely on FHS I'll talk more about it when I finally make a video about running unpatched binaries but even if we don't take it into consideration you can still easily use

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| FHS | The Filesystem Hierarchy Standard used by many Linux systems. |
| compliant | Following a rule, standard, or requirement. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| render ... useless | Cause something to become unable to be used. |

### 8:00–8:34 — Closing thanks

Docker or drro box to run any programs like on any other drro meaning non FHS compliance of Nix being a problem is basically a madeup overblown myth which should not discourage you from trying the dro and now I'd like to thank all the amazing people that support the channel and keep it going especially all of our great monthly members and as always don't forget to check out our Discord server leave a like or a comment if you enjoyed this video or subscribe if you're feeling extra generous thanks for watching and I'll see you in the next one

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| overblown | Made to seem more serious or important than it is. |
| discourage | Make someone less willing to do something. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| keep ... going | Allow something to continue operating. |
