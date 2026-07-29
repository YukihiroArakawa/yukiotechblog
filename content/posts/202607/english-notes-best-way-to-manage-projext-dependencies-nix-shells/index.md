---
title: "[Vocabulary/Transcript] Best Way To Manage Projext Dependencies | Nix Shells"
date: 2026-07-29
categories: ["english-learning", "nix"]
slug: "english-notes-best-way-to-manage-projext-dependencies-nix-shells"
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

| Word or expression | Simple English meaning |
|---|---|
| infamous | Well known for a bad or difficult reason. |
| pollute | To make something messy by adding unwanted things. |
| manageable | Easy enough to control, organize, or deal with. |
| “without further ado” | Without waiting or talking any more; let us begin. |

### 0:43–1:22 — Trying packages temporarily

You can enter a temporary shell with a package by using `nix-shell -p` followed by a package name. With flakes, you can use `nix shell` and a package reference such as `nixpkgs#<package>`.

Nix downloads the requested package into the Nix store and opens a shell that is similar to the user’s normal shell. Existing packages and environment variables are preserved, and the requested package is added temporarily.

After leaving the shell with `exit` or closing the terminal, the package is no longer available in the user environment.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| temporarily | For a limited time, not permanently. |
| preserve | To keep something in its existing state. |
| “to begin with” | At the start or originally. |

### 1:22–2:35 — The Nix store and garbage collection

Leaving a shell does not immediately delete its packages. Nix does not automatically expose every downloaded package to the user environment. The package remains in the Nix store and can be reused the next time a shell needs it.

There may be several versions of the same tool in the Nix store. Temporary shell packages can become orphaned after the shell is closed. A later Nix garbage collection can remove packages that are no longer needed.

This gives users room to experiment without permanently filling the normal environment with development tools.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| expose | To make something available or visible. |
| Nix store | The directory where Nix keeps packages and their dependencies. |
| garbage collection | The process of removing data that is no longer needed. |
| orphaned | No longer connected to or needed by anything. |
| “for good” | Permanently. |

#### Phrases

| Phrase | Meaning |
|---|---|
| as a matter of fact | Used to add a fact that strengthens or corrects what was just said. |
| all over again | From the beginning another time. |

### 2:35–3:11 — Nix shells are not containers

A Nix shell is not a fully isolated container. It mainly changes available packages and environment variables. Changes made to files or other parts of the system can remain after the shell is closed.

This is useful for development because files in the current project remain directly accessible from inside the shell.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| isolated | Separated from the surrounding system. |
| tinkering | Experimenting with something to learn or improve it. |
| affect | To cause a change in something. |
| “keep in mind” | Remember this important point. |

### 3:11–4:05 — Defining a shell declaratively

For a reusable development environment, you can create a `shell.nix` file. It acts as a blueprint for the shell, in a way that is somewhat similar to how a Dockerfile describes a Docker image.

The video shows a flexible Nix function that accepts a package set and returns a shell created with `pkgs.mkShell`. The same structure can be used with or without flakes.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| declaratively | By describing the desired result instead of listing every action. |
| declarative configuration | A description of what a system should contain or look like. |
| blueprint | A plan that describes how something should be created. |
| instance | One particular version or occurrence of something. |

### 4:05–5:20 — Useful `mkShell` options

The `packages` option lists tools that should be available in the shell. Examples include Node.js, Python, linters, and language servers.

The `inputsFrom` option can include the dependencies of another package. For example, using the inputs of a Rust program can make the Rust compiler and its other build dependencies available.

The `shellHook` option runs Bash code automatically when the shell starts. Other attributes can be used to define environment variables, including values needed for shared libraries or programming-language tools.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| self-explanatory | Clear enough that it needs little explanation. |
| shell hook | Code that runs automatically when a shell starts. |

### 5:20–6:08 — Entering and using the shell

Running `nix-shell` in the directory containing `shell.nix` evaluates the dependencies, downloads required packages, runs the shell hook, and opens the shell.

Development, building, and testing can then be performed normally. Graphical editors such as Visual Studio Code or JetBrains IDEs can also inherit the shell’s packages when they are launched from inside it.

Closing the shell returns the user to the normal environment.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| cumbersome | Difficult to use because it is long, complex, or inconvenient. |

### 6:08–7:09 — Development shells with flakes

A shell can be placed inside a flake by assigning it to the default development-shell output for the current system architecture. The previously created `shell.nix` file can be imported, or the shell function can be written directly in the flake.

The options remain mostly the same, but flakes provide stronger control over inputs and package versions. Different versions of `nixpkgs` can be mixed when necessary.

The shell is activated with `nix develop`. Because the dependencies are managed by the flake and its lock file, a shared project can provide consistent package versions to colleagues.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| “mix and match” | To combine items chosen from different groups. |
| consistent | Staying the same across people, machines, or times. |

#### Phrases

| Phrase | Meaning |
|---|---|
| once again | One more time; again. |

### 7:09–8:20 — Interactive package-building shells

The video then returns to shell-related commands. In addition to opening temporary package environments and reading `shell.nix`, `nix-shell` can open an interactive environment for building a package.

This is useful when a developer wants to examine the build process step by step. The environment is isolated from the normal user environment, but it can still access the project files. It includes the package’s build dependencies and exposes build phases as commands.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| interactively | In a way that lets a person act and see results step by step. |
| “come to the rescue” | To arrive with a solution to a difficult problem. |
| build process | The complete set of steps used to turn source code into a package. |

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

| Word or expression | Simple English meaning |
|---|---|
| derivation | A Nix description of how to produce a package or another build result. |
| unpack | To extract files from an archive. |
| tarball | A group of files stored in a `.tar` archive, often compressed. |
| modification | A change made to something. |
| incredibly useful | Extremely helpful. |

#### Phrases

| Phrase | Meaning |
|---|---|
| in between | In the time or space separating two things. |

### 9:20–10:08 — How `nix develop` chooses an environment

With flakes, a package can be assigned to the default package output and opened with `nix develop`.

Nix shells are themselves derivations. The `mkShell` function is essentially a convenient wrapper around the derivation-building machinery, so shell definitions can use build-related options too.

When `nix develop` is run, it uses an available development shell. If an appropriate development shell is not defined, it can open a build environment for the package.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| wrapper | A simpler interface built around another function or tool. |

### 10:08–10:45 — Flake URLs and conclusion

Flake URL syntax can be used with the commands shown in the video. This makes it possible to enter shells defined in flakes hosted elsewhere, including on the internet.

The video concludes by emphasizing how powerful this is for sharing development environments and build environments.

#### Vocabulary

| Word or expression | Simple English meaning |
|---|---|
| “at your disposal” | Available for you to use. |
| hosted | Stored and made available on a server or online service. |
