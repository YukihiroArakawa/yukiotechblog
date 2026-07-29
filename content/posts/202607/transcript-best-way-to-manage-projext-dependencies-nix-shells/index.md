---
title: "[Transcript/Vocabulary] Best Way To Manage Projext Dependencies | Nix Shells"
date: 2026-07-29
categories: ["english-learning", "transcript", "nix"]
slug: "transcript-best-way-to-manage-projext-dependencies-nix-shells"
type: "post"
---

## Reference 

Best Way To Manage Project Dependencies | Nix Shells

https://www.youtube.com/watch?v=0YBWhSNTgV8

## Transcript

### 0:00–0:43 — Why Nix shells are useful

Nix shells are one of the most useful features of Nix. They help solve the well-known “it works on my machine” problem by giving developers controlled development environments. They also keep development tools from cluttering the normal user environment.

A shell can be created, removed, and shared easily. The video covers temporary package installation, declarative development shells, interactive package building, and integration with Nix flakes.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| infamous | /ˈɪnfəməs/ | Well known for a bad or difficult reason. | The bug became infamous after it broke every developer machine. |
| pollute | /pəlˈuːt/ | To make something messy by adding unwanted things. | Temporary packages should not pollute the global user environment. |
| manageable | /mˈænɪd‍ʒəbə‍l/ | Easy enough to control, organize, or deal with. | A small shell file keeps project dependencies manageable. |
| “without further ado” | /wɪðˌa‍ʊt fˈɜːðɚɹ ɐdˈuː/ | Without waiting or talking any more; let us begin. | Without further ado, the presenter opened the Nix shell. |

### 0:43–1:22 — Trying packages temporarily

You can enter a temporary shell with a package by using `nix-shell -p` followed by a package name. With flakes, you can use `nix shell` and a package reference such as `nixpkgs#<package>`.

Nix downloads the requested package into the Nix store and opens a shell that is similar to the user’s normal shell. Existing packages and environment variables are preserved, and the requested package is added temporarily.

After leaving the shell with `exit` or closing the terminal, the package is no longer available in the user environment.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| temporarily | /tˌɛmpɚɹˈɛɹᵻli/ | For a limited time, not permanently. | She installed the compiler temporarily for one experiment. |
| preserve | /pɹɪzˈɜːv/ | To keep something in its existing state. | The lock file preserves the versions that worked together. |
| “to begin with” | /tə bɪɡˈɪn wɪð/ | At the start or originally. | To begin with, install Nix before creating a development shell. |

### 1:22–2:35 — The Nix store and garbage collection

Leaving a shell does not immediately delete its packages. Nix does not automatically expose every downloaded package to the user environment. The package remains in the Nix store and can be reused the next time a shell needs it.

There may be several versions of the same tool in the Nix store. Temporary shell packages can become orphaned after the shell is closed. A later Nix garbage collection can remove packages that are no longer needed.

This gives users room to experiment without permanently filling the normal environment with development tools.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| expose | /ɛkspˈo‍ʊz/ | To make something available or visible. | The shell exposes the formatter only while the project is active. |
| Nix store | /nˈɪks stˈɔː‍ɹ/ | The directory where Nix keeps packages and their dependencies. | Nix store paths contain the exact inputs used by a build. |
| garbage collection | /ɡˈɑː‍ɹbɪd‍ʒ kəlˈɛkʃən/ | The process of removing data that is no longer needed. | Garbage collection removed outputs that no profile still referenced. |
| orphaned | /ˈɔː‍ɹfənd/ | No longer connected to or needed by anything. | The failed build left orphaned files with no active reference. |
| “for good” | /fɔː‍ɹ ɡˈʊd/ | Permanently. | After deleting the profile, the package disappeared for good. |

#### Phrases

| Phrase | Meaning |
|---|---|
| as a matter of fact | Used to add a fact that strengthens or corrects what was just said. |
| all over again | From the beginning another time. |

### 2:35–3:11 — Nix shells are not containers

A Nix shell is not a fully isolated container. It mainly changes available packages and environment variables. Changes made to files or other parts of the system can remain after the shell is closed.

This is useful for development because files in the current project remain directly accessible from inside the shell.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| isolated | /ˈa‍ɪsəlˌe‍ɪɾᵻd/ | Separated from the surrounding system. | Each project runs in an isolated environment with its own tools. |
| tinkering | /tˈɪŋkɚɹɪŋ/ | Experimenting with something to learn or improve it. | Tinkering with a shell.nix file is safer than changing system packages. |
| affect | /ɐfˈɛkt/ | To cause a change in something. | Updating one dependency can affect every tool in the shell. |
| “keep in mind” | /kˈiːp ɪn mˈa‍ɪnd/ | Remember this important point. | Keep in mind that unpinned inputs can change between builds. |

### 3:11–4:05 — Defining a shell declaratively

For a reusable development environment, you can create a `shell.nix` file. It acts as a blueprint for the shell, in a way that is somewhat similar to how a Dockerfile describes a Docker image.

The video shows a flexible Nix function that accepts a package set and returns a shell created with `pkgs.mkShell`. The same structure can be used with or without flakes.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| declaratively | /dᵻklˈæɹətˌɪvli/ | By describing the desired result instead of listing every action. | She declared the compiler declaratively instead of installing it by hand. |
| declarative configuration | /dᵻklˈæɹətˌɪv kənfˌɪɡjɚɹˈe‍ɪʃən/ | A description of what a system should contain or look like. | The declarative configuration states which tools the team needs. |
| blueprint | /blˈuːpɹɪnt/ | A plan that describes how something should be created. | The flake acts as a blueprint for identical developer machines. |
| instance | /ˈɪnstəns/ | One particular version or occurrence of something. | Each CI job starts a fresh instance of the development environment. |

### 4:05–5:20 — Useful `mkShell` options

The `packages` option lists tools that should be available in the shell. Examples include Node.js, Python, linters, and language servers.

The `inputsFrom` option can include the dependencies of another package. For example, using the inputs of a Rust program can make the Rust compiler and its other build dependencies available.

The `shellHook` option runs Bash code automatically when the shell starts. Other attributes can be used to define environment variables, including values needed for shared libraries or programming-language tools.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| self-explanatory | /sˈɛlfɛksplˈænətˌɔːɹi/ | Clear enough that it needs little explanation. | A clearly named package list makes the configuration self-explanatory. |
| shell hook | /ʃˈɛl hˈʊk/ | Code that runs automatically when a shell starts. | The shell hook prints a reminder when developers enter the project. |

### 5:20–6:08 — Entering and using the shell

Running `nix-shell` in the directory containing `shell.nix` evaluates the dependencies, downloads required packages, runs the shell hook, and opens the shell.

Development, building, and testing can then be performed normally. Graphical editors such as Visual Studio Code or JetBrains IDEs can also inherit the shell’s packages when they are launched from inside it.

Closing the shell returns the user to the normal environment.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| cumbersome | /kˈʌmbɚsˌʌm/ | Difficult to use because it is long, complex, or inconvenient. | Manually installing every dependency became cumbersome for new contributors. |

### 6:08–7:09 — Development shells with flakes

A shell can be placed inside a flake by assigning it to the default development-shell output for the current system architecture. The previously created `shell.nix` file can be imported, or the shell function can be written directly in the flake.

The options remain mostly the same, but flakes provide stronger control over inputs and package versions. Different versions of `nixpkgs` can be mixed when necessary.

The shell is activated with `nix develop`. Because the dependencies are managed by the flake and its lock file, a shared project can provide consistent package versions to colleagues.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| “mix and match” | /mˈɪks ænd mˈæt‍ʃ/ | To combine items chosen from different groups. | Mix and match tools only when their versions are compatible. |
| consistent | /kənsˈɪstənt/ | Staying the same across people, machines, or times. | Pinned inputs keep local and CI builds consistent. |

#### Phrases

| Phrase | Meaning |
|---|---|
| once again | One more time; again. |

### 7:09–8:20 — Interactive package-building shells

The video then returns to shell-related commands. In addition to opening temporary package environments and reading `shell.nix`, `nix-shell` can open an interactive environment for building a package.

This is useful when a developer wants to examine the build process step by step. The environment is isolated from the normal user environment, but it can still access the project files. It includes the package’s build dependencies and exposes build phases as commands.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| interactively | /ˌɪntɚɹˈæktɪvli/ | In a way that lets a person act and see results step by step. | He entered the shell interactively to test the command. |
| “come to the rescue” | /kˈʌm tə ðə ɹˈɛskjuː/ | To arrive with a solution to a difficult problem. | When the host lacked a compiler, the Nix shell came to the rescue. |
| build process | /bˈɪld pɹˈɑːsɛs/ | The complete set of steps used to turn source code into a package. | The build process uses only the dependencies declared in the derivation. |

#### Phrases

| Phrase | Meaning |
|---|---|
| step by step | One stage at a time. |

### 8:20–9:20 — Running build phases manually

The example uses a minimal GNU Hello derivation. Inside the build shell, the developer can move to a temporary directory and run individual phases such as:

- `unpackPhase`
- `configurePhase`
- `buildPhase`
- `checkPhase`

The developer can stop between phases, inspect files, make temporary changes, and investigate errors. This makes the interactive shell useful for debugging package builds.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| derivation | /dˌɛɹɪvˈe‍ɪʃən/ | A Nix description of how to produce a package or another build result. | The derivation specifies how Nix should build the package. |
| unpack | /ʌnpˈæk/ | To extract files from an archive. | The builder unpacks the source archive before compiling it. |
| tarball | /tˈɑː‍ɹbɔːl/ | A group of files stored in a `.tar` archive, often compressed. | The release tarball contains the source code and documentation. |
| modification | /mˌɑːdɪfɪkˈe‍ɪʃən/ | A change made to something. | A modification to the dependency list creates a new build result. |
| incredibly useful | /ɪŋkɹˈɛdɪbli jˈuːsfə‍l/ | Extremely helpful. | A reproducible shell is incredibly useful when onboarding a teammate. |

#### Phrases

| Phrase | Meaning |
|---|---|
| in between | In the time or space separating two things. |

### 9:20–10:08 — How `nix develop` chooses an environment

With flakes, a package can be assigned to the default package output and opened with `nix develop`.

Nix shells are themselves derivations. The `mkShell` function is essentially a convenient wrapper around the derivation-building machinery, so shell definitions can use build-related options too.

When `nix develop` is run, it uses an available development shell. If an appropriate development shell is not defined, it can open a build environment for the package.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| wrapper | /ɹˈæpɚ/ | A simpler interface built around another function or tool. | The wrapper starts the tool with the required environment variables. |

### 10:08–10:45 — Flake URLs and conclusion

Flake URL syntax can be used with the commands shown in the video. This makes it possible to enter shells defined in flakes hosted elsewhere, including on the internet.

The video concludes by emphasizing how powerful this is for sharing development environments and build environments.

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| “at your disposal” | /æt jʊ‍ɹ dɪspˈo‍ʊzə‍l/ | Available for you to use. | With the shell open, the required compiler is at your disposal. |
| hosted | /hˈo‍ʊstᵻd/ | Stored and made available on a server or online service. | The binary cache is hosted on a server shared by the team. |
