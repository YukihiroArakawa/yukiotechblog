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

## Vocabulary

| Word or expression | Simple English meaning | Example |
|---|---|---|
| infamous | Well known for a bad or difficult reason. | The “it works on my machine” problem is infamous among developers. |
| pollute | To make something messy by adding unwanted things. | Temporary shells do not pollute the normal user environment. |
| manageable | Easy enough to control, organize, or deal with. | Declarative configuration keeps the system manageable. |
| temporarily | For a limited time, not permanently. | The package is temporarily available inside the shell. |
| declaratively | By describing the desired result instead of listing every action. | The tools in the shell are defined declaratively in a Nix file. |
| interactively | In a way that lets a person act and see results step by step. | A package can be built interactively to find an error. |
| preserve | To keep something in its existing state. | The shell can preserve the user’s existing environment variables. |
| expose | To make something available or visible. | Nix does not expose every stored package to the normal shell. |
| Nix store | The directory where Nix keeps packages and their dependencies. | A downloaded compiler remains in the Nix store. |
| garbage collection | The process of removing data that is no longer needed. | Garbage collection can delete unused packages from the Nix store. |
| orphaned | No longer connected to or needed by anything. | A temporary package may become orphaned after the shell is closed. |
| “for good” | Permanently. | Unused packages can be deleted for good during garbage collection. |
| isolated | Separated from the surrounding system. | A Nix shell is not as isolated as a container. |
| tinkering | Experimenting with something to learn or improve it. | The shell is useful for development and tinkering. |
| affect | To cause a change in something. | The shell mainly affects packages and environment variables. |
| declarative configuration | A description of what a system should contain or look like. | A `shell.nix` file is declarative configuration for a shell. |
| blueprint | A plan that describes how something should be created. | The `shell.nix` file acts as a blueprint for the environment. |
| instance | One particular version or occurrence of something. | The shell uses the selected `nixpkgs` instance. |
| self-explanatory | Clear enough that it needs little explanation. | The name `inputsFrom` is fairly self-explanatory. |
| shell hook | Code that runs automatically when a shell starts. | A shell hook can print a message or prepare environment variables. |
| “to begin with” | At the start or originally. | The package was not installed globally to begin with. |
| “mix and match” | To combine items chosen from different groups. | Flakes can mix and match packages from different sources. |
| consistent | Staying the same across people, machines, or times. | The lock file keeps package versions consistent. |
| cumbersome | Difficult to use because it is long, complex, or inconvenient. | A long build-shell command can look cumbersome. |
| “come to the rescue” | To arrive with a solution to a difficult problem. | An interactive build shell comes to the rescue when a build fails. |
| derivation | A Nix description of how to produce a package or another build result. | The GNU Hello package is defined as a derivation. |
| unpack | To extract files from an archive. | The unpack phase extracts the source code. |
| tarball | A group of files stored in a `.tar` archive, often compressed. | The source code is downloaded as a tarball. |
| “keep in mind” | Remember this important point. | Keep in mind that the shell can still change project files. |
| modification | A change made to something. | A developer can make a modification between build phases. |
| build process | The complete set of steps used to turn source code into a package. | The interactive shell helps inspect the build process. |
| incredibly useful | Extremely helpful. | Stopping between build phases is incredibly useful for debugging. |
| wrapper | A simpler interface built around another function or tool. | `mkShell` is a convenient wrapper around derivation-building features. |
| “at your disposal” | Available for you to use. | Flake URL syntax is at your disposal when opening remote shells. |
| hosted | Stored and made available on a server or online service. | A flake can be hosted in an online repository. |
| “without further ado” | Without waiting or talking any more; let us begin. | Without further ado, the video starts the configuration example. |

## Especially Useful Phrases

### as a matter of fact

Meaning: Used to add a fact that strengthens or corrects what was just said.

Example: As a matter of fact, several versions of Node.js may already exist in the Nix store.

### once again

Meaning: One more time; again.

Example: The video once again compares the classic Nix method with the flake method.

### step by step

Meaning: One stage at a time.

Example: The interactive shell lets you examine a build step by step.

### in between

Meaning: In the time or space separating two things.

Example: You can stop in between build phases and inspect the files.

### all over again

Meaning: From the beginning another time.

Example: Nix does not need to download the same stored package all over again.

## Transcript

### 0:00–0:43 — Why Nix shells are useful

Nix shells are one of the most useful features of Nix. They help solve the well-known “it works on my machine” problem by giving developers controlled development environments. They also keep development tools from cluttering the normal user environment.

A shell can be created, removed, and shared easily. The video covers temporary package installation, declarative development shells, interactive package building, and integration with Nix flakes.

### 0:43–1:22 — Trying packages temporarily

You can enter a temporary shell with a package by using `nix-shell -p` followed by a package name. With flakes, you can use `nix shell` and a package reference such as `nixpkgs#<package>`.

Nix downloads the requested package into the Nix store and opens a shell that is similar to the user’s normal shell. Existing packages and environment variables are preserved, and the requested package is added temporarily.

After leaving the shell with `exit` or closing the terminal, the package is no longer available in the user environment.

### 1:22–2:35 — The Nix store and garbage collection

Leaving a shell does not immediately delete its packages. Nix does not automatically expose every downloaded package to the user environment. The package remains in the Nix store and can be reused the next time a shell needs it.

There may be several versions of the same tool in the Nix store. Temporary shell packages can become orphaned after the shell is closed. A later Nix garbage collection can remove packages that are no longer needed.

This gives users room to experiment without permanently filling the normal environment with development tools.

### 2:35–3:11 — Nix shells are not containers

A Nix shell is not a fully isolated container. It mainly changes available packages and environment variables. Changes made to files or other parts of the system can remain after the shell is closed.

This is useful for development because files in the current project remain directly accessible from inside the shell.

### 3:11–4:05 — Defining a shell declaratively

For a reusable development environment, you can create a `shell.nix` file. It acts as a blueprint for the shell, in a way that is somewhat similar to how a Dockerfile describes a Docker image.

The video shows a flexible Nix function that accepts a package set and returns a shell created with `pkgs.mkShell`. The same structure can be used with or without flakes.

### 4:05–5:20 — Useful `mkShell` options

The `packages` option lists tools that should be available in the shell. Examples include Node.js, Python, linters, and language servers.

The `inputsFrom` option can include the dependencies of another package. For example, using the inputs of a Rust program can make the Rust compiler and its other build dependencies available.

The `shellHook` option runs Bash code automatically when the shell starts. Other attributes can be used to define environment variables, including values needed for shared libraries or programming-language tools.

### 5:20–6:08 — Entering and using the shell

Running `nix-shell` in the directory containing `shell.nix` evaluates the dependencies, downloads required packages, runs the shell hook, and opens the shell.

Development, building, and testing can then be performed normally. Graphical editors such as Visual Studio Code or JetBrains IDEs can also inherit the shell’s packages when they are launched from inside it.

Closing the shell returns the user to the normal environment.

### 6:08–7:09 — Development shells with flakes

A shell can be placed inside a flake by assigning it to the default development-shell output for the current system architecture. The previously created `shell.nix` file can be imported, or the shell function can be written directly in the flake.

The options remain mostly the same, but flakes provide stronger control over inputs and package versions. Different versions of `nixpkgs` can be mixed when necessary.

The shell is activated with `nix develop`. Because the dependencies are managed by the flake and its lock file, a shared project can provide consistent package versions to colleagues.

### 7:09–8:20 — Interactive package-building shells

The video then returns to shell-related commands. In addition to opening temporary package environments and reading `shell.nix`, `nix-shell` can open an interactive environment for building a package.

This is useful when a developer wants to examine the build process step by step. The environment is isolated from the normal user environment, but it can still access the project files. It includes the package’s build dependencies and exposes build phases as commands.

### 8:20–9:20 — Running build phases manually

The example uses a minimal GNU Hello derivation. Inside the build shell, the developer can move to a temporary directory and run individual phases such as:

- `unpackPhase`
- `configurePhase`
- `buildPhase`
- `checkPhase`

The developer can stop between phases, inspect files, make temporary changes, and investigate errors. This makes the interactive shell useful for debugging package builds.

### 9:20–10:08 — How `nix develop` chooses an environment

With flakes, a package can be assigned to the default package output and opened with `nix develop`.

Nix shells are themselves derivations. The `mkShell` function is essentially a convenient wrapper around the derivation-building machinery, so shell definitions can use build-related options too.

When `nix develop` is run, it uses an available development shell. If an appropriate development shell is not defined, it can open a build environment for the package.

### 10:08–10:45 — Flake URLs and conclusion

Flake URL syntax can be used with the commands shown in the video. This makes it possible to enter shells defined in flakes hosted elsewhere, including on the internet.

The video concludes by emphasizing how powerful this is for sharing development environments and build environments.
