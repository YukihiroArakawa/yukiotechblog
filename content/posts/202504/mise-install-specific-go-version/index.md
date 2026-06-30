---
title: "miseで特定のGo言語のバージョンをインストールして切り替える"
date: 2025-04-05
categories: 
  - "golang"
coverImage: "Screenshot-from-2025-03-23-15-55-23.png"
slug: "mise-install-specific-go-version"
type: "post"
---

miseというミドルウェアのバージョンを切り替えるツールを使って特定のGo言語のバージョンをインストールしたいと思います。

イメージはrenvとかと同じですが、rubyだけでなくGo言語やterraformやnode.jsをはじめとして色々な言語やツールに対応しているっぽいです。便利。

[https://mise.jdx.dev/demo.html](https://mise.jdx.dev/demo.html)

```
$ mise exec go@1.23.8 -- go -v
mise go@1.23.8 ✓ installed                                                                                                                 flag provided but not defined: -v
Go is a tool for managing Go source code.

Usage:

        go <command> [arguments]

The commands are:

        bug         start a bug report
        build       compile packages and dependencies
        clean       remove object files and cached files
        doc         show documentation for package or symbol
        env         print Go environment information
        fix         update packages to use new APIs
        fmt         gofmt (reformat) package sources
        generate    generate Go files by processing source
        get         add dependencies to current module and install them
        install     compile and install packages and dependencies
        list        list packages or modules
        mod         module maintenance
        work        workspace maintenance
        run         compile and run Go program
        telemetry   manage telemetry data and settings
        test        test packages
        tool        run specified go tool
        version     print Go version
        vet         report likely mistakes in packages

Use "go help <command>" for more information about a command.

Additional help topics:

        buildconstraint build constraints
        buildmode       build modes
        c               calling between Go and C
        cache           build and test caching
        environment     environment variables
        filetype        file types
        go.mod          the go.mod file
        gopath          GOPATH environment variable
        goproxy         module proxy protocol
        importpath      import path syntax
        modules         modules, module versions, and more
        module-auth     module authentication using go.sum
        packages        package lists and patterns
        private         configuration for downloading non-public code
        testflag        testing flags
        testfunc        testing functions
        vcs             controlling version control with GOVCS

Use "go help <topic>" for more information about that topic.

$ go version
go version go1.24.0 linux/amd64

$ mise ls
Tool    Version  Source                      Requested
go      1.23.8
go      1.24.0   ~/.config/mise/config.toml  latest
java    24.0.0   ~/.config/mise/config.toml  latest
node    22.14.0  ~/.config/mise/config.toml  lts
python  3.13.2   ~/.config/mise/config.toml  latest
```

ちなみに特定のプロジェクトでのみ特定のバージョンを利用したい場合は以下のコマンドを実行する

```
$ cd myproj
$ mise use go@1.23.8
```

グローバルでバージョンを設定したい場合は以下の通り

```
$ mise use --global go@1.23.8
mise ~/.config/mise/config.toml tools: go@1.23.8

$ go version
go version go1.23.8 linux/amd64
```
