---
title: "dotfilesをシンボリックリンク管理からnix管理に変えました"
date: 2026-02-22
categories: 
  - "nix"
coverImage: "Screenshot-from-2026-02-22-16-40-58.png"
slug: "nix-dotfiles-migration"
type: "post"
---

## 元々のdotfilesのツラミ

元々私は.bashrc、.tmux.confなどをgit管理してシンボリックリンクを貼るというdotfiles運用をしていました。

ただこの運用だと色々つらいことが出てきました。

- シンボリックリンクを貼るのが面倒。シンボリックリンクを貼るためのシェルスクリプトをちょこちょこ治すのが面倒

- 設定ファイルの管理以上のことはしていないので、PC交換時に依存をちまちまインストールし直す必要があり面倒
    - ex) tmuxをapt installするなど

ということでnixでdotfiles管理するようにしつつ、ミドルウェアについてもなるべくnix管理するようにしてみました。

## nix管理後のディレクトリ構造

ディレクトリ構造は以下の通りです。

```
├── bashrc
│   └── bashrc
├── flake.lock
├── flake.nix
├── home-manager
│   └── home.nix
├── nix
│   ├── nix.conf
│   └── nix.conf.backup
...
├── tmux
│   ├── tmux.conf
│   └── tmux_setup.sh
└── ubuntu
    ├── ubuntu-setup.desktop
    └── ubuntu_setup.sh
```

flake.nixでhome-manager(nixのホームディレクトリ管理ツール)を定義して管理するようにしており、home-manager(home.nix)でドットファイルやその他のミドルウェアを管理するようにしています。

## 運用の流れ

### 1\. 新規ドットファイルの追加

新しいドットファイルを追加したいとなったらdotfilesリポジトリにファイル作成した上で、home.nixのxdg.configFileにdotfiles上のパスとホームディレクトリの.config配下のどこに配置するかを定義します。

```
{ config, pkgs, ... }:

{
 ...

  # ------------------------------
  # Dotfiles under ~/.config (XDG_CONFIG_HOME)
  # ------------------------------
  # XDG 機能を有効化（通常 ~/.config を基準に扱う）
  xdg.enable = true;

  # xdg.configFile."<relative path>".source = <path>;
  # => ~/.config/<relative path> に source の内容をリンク配置

  xdg.configFile."tmux/tmux.conf".source = ./../tmux/tmux.conf;
  xdg.configFile."tmux/tmux_setup.sh".source = ./../tmux/tmux_setup.sh;
  ...

  # ------------------------------
  # Dotfiles under $HOME (arbitrary paths)
  # ------------------------------
  # home.file."<path from HOME>".source = <path>;
  # => ~/<path from HOME> に source の内容をリンク配置
  home.file = {
    ".bashrc".source = ./../bashrc/bashrc;
    ".local/share/omakub/defaults/alacritty.toml".source = ./../alacritty/alacritty.toml;
  };

  ...
}
```

次にhome.nixや対象のファイルをgit add してステージングエリアに配置します。

最後にhome-manager switchコマンドで適応します。

```
$ nix run home-manager/master -- switch --flake .#username -b backup
```

毎回変更をgit管理しているわけなので、変更後に挙動がおかしくなった場合はかんたんに巻き戻しが可能です。

### 2\. ミドルウェアの追加

ミドルウェアを追加したいとなったら、home.nixのhome.packagesに追加します。

```
  home.packages = [
    pkgs.tmux
    # pdfのページ追加・削除・入れ替えツール
    pkgs.pdfarranger 
  ];

```

追加したら先程と同様にgit add してhome-manager swtichするとミドルウェアがインストールされます。

この方法ではnix pkgsというパッケージからインストールする形になるのですが、一部ミドルウェアでは最新版が存在しない場合があります。

その場合はflake.nixから最新版を取得するように個別定義することもできます。

```
    # codex CLI パッケージを提供する flake
    codex-nix.url = "github:sadjow/codex-nix";
```

また特定のバージョン・ハッシュで固定したい場合もflakeで管理してflake.lockでガチッと縛ることもできるそうです。

nixは再現性が売りなので、ここまでやるとどの環境でもほぼ動くとなりそうですが、一旦私は依存関係の管理が快適にできればいいなというレベルなのでそこまでやっていないです。

## おわりに

今回、再現性が売りのnixを使ってドットファイル管理やパッケージ管理をするように変更してみました。

PC変更時もかんたんに現在の環境を再現できるようになったと思うので、これからなるべくnixで管理するようにしていこうかなと思います。

よかったらリポジトリも見ていってね。

https://github.com/YukihiroArakawa/dotfiles
