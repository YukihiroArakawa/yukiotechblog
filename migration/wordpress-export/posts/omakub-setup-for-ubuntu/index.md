---
title: "[Ubuntu24.04] omakubでUbuntu環境を良い感じに設定する"
date: 2025-03-23
categories: 
  - "linux"
coverImage: "Screenshot-from-2025-03-23-14-38-16.png"
slug: "omakub-setup-for-ubuntu"
type: "post"
---

## omakubとは

omakubとはUbuntu Desktop環境を良い感じにしてくれるプラグインです。

[https://omakub.org](https://omakub.org)

具体的には以下の表にあるアプリをインストールしてくれたり、良い感じのデスクトップテーマやホットキーなどを設定してくれます。

| ジャンル | インストールされるもの | 説明 |
| --- | --- | --- |
| terminal | Aracritty | Rust製の軽量なターミナル.   以下のツールも一緒にインストールされる   eza, fzf, ripgrep, zoxide, bg |
| terminal multiplexer | Zellij | Rust製の軽量で直感的な操作が可能なターミナルマルチプレクサー |
| Editor | Neovim (with lazyvim) | lazyvimを適応済みのNeovim |
| IDE | VSCode |  |
| Launcherアプリ | Ulauncher | Raycastっぽいランチャーアプリ |
| その他 | \- Docker (MySQL, Redisコンテナ付き)   \- lazydocker   \- lazygit   \- WhatsApp   \- Xournal++ (PDF Viewer)   \- VLC (video player)   \- pinta (image editor)   \- gh command (GitHub CLI)   \- mise (RubyとNode.jsのバージョン管理ツール)   \- Ruby, Node.js, Python, Go, Java   \- Super+1/2/3..で仮想デスクトップを切替可能   \- Alt + デスクトップに配置した順序 でアプリを起動/切替可能 |  |

## 前提条件

omakubをインストールするためには以下の3つの条件を満たす必要があります。

- x86のコンピュータであること（ARMはまだサポートされていない）

- Ubuntuインストーラーを入れる32GB以上のUSBメモリ

- Ubuntu 24.04（または24.10）。

筆者はLenovoのThinkPad E14 Gen6(AMD)にUbuntu24をインストールし、その後にomakubをインストールしました。

omakubインストール時に種々のプロファイルが編集されるので、基本的に何もいじられていないUbuntu24にインストールするのが良いと思います。

## install方法

ubuntu24がインストールできたら、次に以下のコマンドでomakub自体をインストールします

```
wget -qO- https://omakub.org/install | bash
```

インストール時に一緒にミドルウェアをインストールするかどうかも聞かれるので、お好みで選んでください。

ruby on rails、golangなどを一緒に入れるかどうか、docker上ですぐにmysqlが起動できるようにしておくかとか色々聞かれます。

## 補足：Alacritty起動時にtmuxを起動するよう修正

OmakubではAlacritty(terminal)起動時にターミナルマルチプレクサーであるZellijが起動されます。

このZellijは直感的にではあるものの、筆者はtmuxのほうが慣れているので、tmuxを一緒に起動するように修正しています。

修正するには$HOME/.local/share/omakub/defaults/alacritty.toml `の(1) programを`/bin/bashに変更した上で、(2) argsという値を追加してそこでtmuxをターミナル起動時に立ち上げるように設定します。

```
[env]
TERM = "xterm-256color"

[shell]
-- program = "zellij"
++ program = "/bin/bash"
++ args = ["-l", "-c", "tmux attach -t default || tmux new -s default \\; source ~/.config/tmux/default.session.conf"]

...
```
