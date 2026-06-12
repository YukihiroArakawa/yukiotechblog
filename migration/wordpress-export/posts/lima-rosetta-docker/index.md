---
title: "Rosettaを有効にしたarmアーキテクチャのlimaインスタンス上でx86アーキテクチャのdockerコンテナがうまく動作しない問題の解決"
date: 2025-03-17
categories: 
  - "linux"
coverImage: "Screenshot-from-2025-03-23-14-38-16.png"
slug: "lima-rosetta-docker"
type: "post"
---

## 環境

- Mac OS: sonoma 14.0.1

- Chip: Apple Silicon M2

- lima: 1.0.1

## 前提知識

### Qemu

Quick Emulatorの略で、『[**コンピュータ**](https://e-words.jp/w/%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF.html)の[**CPU**](https://e-words.jp/w/CPU.html)（[**MPU**](https://e-words.jp/w/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%83%97%E3%83%AD%E3%82%BB%E3%83%83%E3%82%B5.html)/[**マイクロプロセッサ**](https://e-words.jp/w/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%83%97%E3%83%AD%E3%82%BB%E3%83%83%E3%82%B5.html)）や各種の制御回路の動作を[**ソフトウェア**](https://e-words.jp/w/%E3%82%BD%E3%83%95%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A2.html)によって再現し、実際の[**オペレーティングシステム**](https://e-words.jp/w/OS.html)（[**OS**](https://e-words.jp/w/OS.html)）や[**アプリケーションソフト**](https://e-words.jp/w/%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%BD%E3%83%95%E3%83%88.html)を導入して動作させることができる。[**Windows**](https://e-words.jp/w/Windows.html)上のQEMU[**環境**](https://e-words.jp/w/%E7%92%B0%E5%A2%83.html)で[**Linux**](https://e-words.jp/w/Linux.html)を起動するなど、QEMUが[**実行**](https://e-words.jp/w/%E5%AE%9F%E8%A1%8C.html)されている[**OS**](https://e-words.jp/w/OS.html)とQEMU上で[**実行**](https://e-words.jp/w/%E5%AE%9F%E8%A1%8C.html)する[**OS**](https://e-words.jp/w/OS.html)は異なっていてもよい。』というやつ

[https://e-words.jp/w/QEMU.html](https://e-words.jp/w/QEMU.html)

limaでvmを作成する際に、qemuを使うことでIntelプロセッサをベースにしたイメージのコンテナを立てることができる。

ただし、めちゃくちゃ遅く、自分のローカル環境ではE2EテストでAPIがタイムアウトになっていたので、できれば使いたくない

### Rosettta

Rosettaとは、Apple シリコン(arm)を搭載した Mac でも、Intel プロセッサ搭載 Mac 用に開発されたアプリを使えるようにするためのツール。

[https://support.apple.com/ja-jp/102527](https://support.apple.com/ja-jp/102527)

このRosettaをlimaのvmで利用するようにすれば、vmをarmで立てた上で、その上にintelプロセッサのイメージのコンテナを立てることができる

速度的にもQemuを使ってlimaのvmを立てるよりも早い

WSのE2Eテストをローカルで回す場合だと数倍程度早くなる

## やろうとしていたこと

limaでarmアーキテクチャかつrosettaを利用するvmを立てた上で、そのvm上でx86アーキテクチャ(intel)のイメージであるSQL Serverのコンテナを立てることをやろうとしていました。

```
# limaのvmを立てるためのyamlファイル

...

mountType: virtiofs
## Rosettaを利用するように設定
rosetta:
  enabled: true
  binfmt: true

...

## aarch64(arm)のvmを立てるように設定
images:
- location: "https://cloud-images.ubuntu.com/releases/24.04/release/ubuntu-24.04-server-cloudimg-arm64.img"
  arch: "aarch64"
vmType: vz
arch: aarch64
```

```
# SQL Serverコンテナを立てるためのdocker-compose.yml
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-CU15-GDR1-ubuntu-22.04
    container_name: mssql
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=Password123
      - MSSQL_PID=Standard
    ports:
      - '1433:1433'
    restart: always
    user: root
    volumes:
      - db_data:/var/opt/mssql
    healthcheck:
      test: [ "CMD", "/opt/mssql-tools18/bin/sqlcmd", "-U", "sa", "-P", "Password123", "-Q", "SELECT 1", "-C" ]
      interval: 10s
      timeout: 5s
      start_period: 10s
      retries: 10
```

## 事象「VMは立てられるがSQL Serverのコンテナがうまく立ち上がらない」

具体的に発生していた事象としては、SQL Serverのコンテナをdocker compose upで立てようとした際に、ステータスがunhealthyで再起動を繰り返していました。

```
! mssql The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested                          0.0s
container mssql is unhealthy
```

またdocker logsでSQL Serverコンテナ内のログを確認すると、以下のエラーを吐き続けていました。

勘のいい人なら、「あれCPUアーキテクチャの差異をRosettaが吸収できていないのでは？」と気づくと思います。

ただ、社内の他の開発者はうまく動作していたので、自分固有の問題という感じでした。

```
exec /opt/mssql/bin/permissions_check.sh: exec format error
```

ちなみにlimaのvmを作成する際の処理では以下の警告が出ていました.

Rosettaを使うように設定する処理がうまくいかなかったという類のエラーですね.

```
WARN[0314] [hostagent] Unable to configure Rosetta: 
failed to create a new rosetta directory share caching option: 
unsupported build target macOS version for 14.0 
(the binary was built with __MAC_OS_X_VERSION_MAX_ALLOWED=130300; 
needs recompilation)
```

## 原因「Mac OS Venture(13)の時にbrew install したlimaを使っていたため、limaのvmを立てる際の処理でsonoma以上でないと使えない処理を振り分ける条件分岐でエラーになっていた

結論、原因はMac OS Vernture時代にbrew installしてビルドしたlimaが原因でした。

一つ一つ処理を追っていきます

### limaのソースコードを追ってみる

まずlimaのソースコードでlimaのvm作成時に吐いていた警告「Unable to configure Rosetta」をgrepしてみます。

そうすると`attachFolderMounts`という関数ないでエラーログを吐いていることがわかります。

ここから、さらにエラーの原因となる関数`createRosettaDirectoryShareConfiguration`のソースコードも見てみます。

```
// vm_darwin.go

func attachFolderMounts(driver *driver.BaseDriver, vmConfig *vz.VirtualMachineConfiguration) error {
    var mounts []vz.DirectorySharingDeviceConfiguration
    if *driver.Instance.Config.MountType == limayaml.VIRTIOFS {
        for i, mount := range driver.Instance.Config.Mounts {
            expandedPath, err := localpathutil.Expand(mount.Location)
            if err != nil {
                return err
            }
            if _, err := os.Stat(expandedPath); errors.Is(err, os.ErrNotExist) {
                err := os.MkdirAll(expandedPath, 0o750)
                if err != nil {
                    return err
                }
            }

            directory, err := vz.NewSharedDirectory(expandedPath, !*mount.Writable)
            if err != nil {
                return err
            }
            share, err := vz.NewSingleDirectoryShare(directory)
            if err != nil {
                return err
            }

            tag := fmt.Sprintf("mount%d", i)
            config, err := vz.NewVirtioFileSystemDeviceConfiguration(tag)
            if err != nil {
                return err
            }
            config.SetDirectoryShare(share)
            mounts = append(mounts, config)
        }
    }

    if *driver.Instance.Config.Rosetta.Enabled {
        logrus.Info("Setting up Rosetta share")
        // エラーを渡している関数はここ
        directorySharingDeviceConfig, err := createRosettaDirectoryShareConfiguration()
        if err != nil {
                         // ここで対象のエラーログを吐いていいる
            logrus.Warnf("Unable to configure Rosetta: %s", err)
        } else {
            mounts = append(mounts, directorySharingDeviceConfig)
        }
    }

    if len(mounts) > 0 {
        vmConfig.SetDirectorySharingDevicesVirtualMachineConfiguration(mounts)
    }
    return nil
}
```

[https://github.com/lima-vm/lima/blob/c10cb9c9dfd61b13f5be31e370d7dad96445f776/pkg/vz/vm\_darwin.go#L582-L583](https://github.com/lima-vm/lima/blob/c10cb9c9dfd61b13f5be31e370d7dad96445f776/pkg/vz/vm_darwin.go#L582-L583)

そうするとlimaのvm作成時のエラーメッセージとして表示されていた詳細がさらに見つかりました。

```
// lima-vm/lima/pkg/vz/rosetta_directory_share_arm64.go
func createRosettaDirectoryShareConfiguration() (*vz.VirtioFileSystemDeviceConfiguration, error) {
    config, err := vz.NewVirtioFileSystemDeviceConfiguration("vz-rosetta")
    if err != nil {
        return nil, fmt.Errorf("failed to create a new virtio file system configuration: %w", err)
    }
    availability := vz.LinuxRosettaDirectoryShareAvailability()
    switch availability {
    case vz.LinuxRosettaAvailabilityNotSupported:
        return nil, errRosettaUnsupported
    case vz.LinuxRosettaAvailabilityNotInstalled:
        logrus.Info("Installing rosetta...")
        logrus.Info("Hint: try `softwareupdate --install-rosetta` if Lima gets stuck here")
        if err := vz.LinuxRosettaDirectoryShareInstallRosetta(); err != nil {
            return nil, fmt.Errorf("failed to install rosetta: %w", err)
        }
        logrus.Info("Rosetta installation complete.")
    case vz.LinuxRosettaAvailabilityInstalled:
        // nothing to do
    }

    rosettaShare, err := vz.NewLinuxRosettaDirectoryShare()
    if err != nil {
        return nil, fmt.Errorf("failed to create a new rosetta directory share: %w", err)
    }
    macOSProductVersion, err := osutil.ProductVersion()
    if err != nil {
        return nil, fmt.Errorf("failed to get macOS product version: %w", err)
    }
    if !macOSProductVersion.LessThan(*semver.New("14.0.0")) {
                // エラーログの原因となる関数
        cachingOption, err := vz.NewLinuxRosettaAbstractSocketCachingOptions("rosetta")
        if err != nil {
                        // ここでvm作成時のエラーログが吐かれている
            return nil, fmt.Errorf("failed to create a new rosetta directory share caching option: %w", err)
        }
        rosettaShare.SetOptions(cachingOption)
    }
    config.SetDirectoryShare(rosettaShare)

    return config, nil
}
```

### vzのソースコードを追ってみる

さらにエラーメッセージの原因となる関数`vz.NewLinuxRosettaAbstractSocketCachingOptions("rosetta")`を追ってみます。

この関数はlimaとは別のライブラリ[github.com/Code-Hex/vz](http://github.com/Code-Hex/vz/v3)の関数でした。

コードを追ってみると「This is only supported on macOS 14 and newer」というコメントがあり、macOS14より新しくないとダメだよという記載が見つかります。

```
// Code-Hex/vz/shared_directory_arm64.go

// NewLinuxRosettaAbstractSocketCachingOptions creates a new LinuxRosettaAbstractSocketCachingOptions.
//
// The name of the Abstract Socket to be used to communicate with the Rosetta translation daemon.
//
// This is only supported on macOS 14 and newer, error will
// be returned on older versions.
func NewLinuxRosettaAbstractSocketCachingOptions(name string) (*LinuxRosettaAbstractSocketCachingOptions, error) {
    if err := macOSAvailable(14); err != nil {
        return nil, err
    }
    maxNameLen := maximumNameLengthVZLinuxRosettaAbstractSocketCachingOptions()
    if maxNameLen < len(name) {
        return nil, fmt.Errorf("name length exceeds maximum allowed length of %d", maxNameLen)
    }

    cs := charWithGoString(name)
    defer cs.Free()

    nserrPtr := newNSErrorAsNil()
    asco := &LinuxRosettaAbstractSocketCachingOptions{
        pointer: objc.NewPointer(
            C.newVZLinuxRosettaAbstractSocketCachingOptionsWithName(cs.CString(), &nserrPtr),
        ),
    }
    if err := newNSError(nserrPtr); err != nil {
        return nil, err
    }
    objc.SetFinalizer(asco, func(self *LinuxRosettaAbstractSocketCachingOptions) {
        objc.Release(self)
    })
    return asco, nil
}

func maximumNameLengthVZLinuxRosettaAbstractSocketCachingOptions() int {
    return int(uint32(C.maximumNameLengthVZLinuxRosettaAbstractSocketCachingOptions()))
}
```

ここでlimaのvm作成時の警告メッセージに戻って確認すると、以下のように「macOSのバージョンが14.0に対応しているビルド対象じゃないよ. このバイナリは\_\_MAC\_OS\_X\_VERSION\_MAX\_ALLOWED=130300でビルドされているよ. 再コンパイルが必要だよ」とあります.

```
unsupported build target macOS version for 14.0 
(the binary was built with __MAC_OS_X_VERSION_MAX_ALLOWED=130300; 
needs recompilation)
```

「\_\_MAC\_OS\_X\_VERSION\_MAX\_ALLOWED」という定数で改めてvzのソースコードをgrepしてみます。

そうすると「Code-Hex/vz/virtualization\_helper.h」というヘッダーファイルに\_\_MAC\_OS\_X\_VERSION\_MAX\_ALLOWEDの記載がありました。

よく読んでみると、\_\_MAC\_OS\_X\_VERSION\_MAX\_ALLOWEDが130000以上の場合はmacOS 13 APIではdisabledされているとあります。

```
# Code-Hex/vz/virtualization_helper.h

#pragma once

#import <Availability.h>
#import <Foundation/Foundation.h>

NSDictionary *dumpProcessinfo();

#define RAISE_REASON_MESSAGE                                                                               \
    "This may possibly be a bug due to library handling errors.\n"                                         \
    "I would appreciate it if you could report it to https://github.com/Code-Hex/vz/issues/new/choose\n\n" \
    "Information: %@\n"

#define RAISE_UNSUPPORTED_MACOS_EXCEPTION()                   \
    do {                                                      \
        [NSException                                          \
             raise:@"UnhandledAvailabilityException"          \
            format:@RAISE_REASON_MESSAGE, dumpProcessinfo()]; \
        __builtin_unreachable();                              \
    } while (0)

// for macOS 12.3 API
#if __MAC_OS_X_VERSION_MAX_ALLOWED >= 120300
#define INCLUDE_TARGET_OSX_12_3 1
#else
#pragma message("macOS 12.3 API has been disabled")
#endif

// for macOS 13 API
#if __MAC_OS_X_VERSION_MAX_ALLOWED >= 130000
#define INCLUDE_TARGET_OSX_13 1
#else
#pragma message("macOS 13 API has been disabled")
#endif

// for macOS 14 API
#if __MAC_OS_X_VERSION_MAX_ALLOWED >= 140000
#define INCLUDE_TARGET_OSX_14 1
#else
#pragma message("macOS 14 API has been disabled")
#endif
```

あれ私のmacOS 14なんだが、、、と思ったのですが、ここでもう一度limaのvm作成時の警告メッセージに立ち返ります。

ここで、macOS14でしか使えないAPIだよとエラーが出ているのに、実際のmacOSは14なので

「あれ私のlima、ローカルのOSをmacOS13として認識してないか、、？」ということがわかります。

```
unsupported build target macOS version for 14.0 
(the binary was built with __MAC_OS_X_VERSION_MAX_ALLOWED=130300; 
needs recompilation)
```

### brew installしたときはmacOSは13だった

ここで過去を振り返ってみると、limaをbrew installしたとき、自分のmacOSは13でした。

そのため、その時点でlimaをbrew installした場合、macOS13としてビルドされたlimaをinstallしていたっぽいです。

そのため、limaを動かした際に、「お前macOS13だからこのAPI使えなくてRosettaうまく動かせないよ」という警告が出ていたということでした。

※ ここら辺の理解が怪しいので、間違っているかもですが、ざっくり言うと上記が原因

## 解決策: limaをinstallし直す

解決策だけ見てしまうとあっけないですが、limaをbrew uninstallした上で、再度installし直すことで、macOS14としてビルドされたlimaがインストールされるので、この問題は解決しました。

## 学び

ツールがうまく動作しない場合、ツールが吐いているlogをツールのソースコードでgrepしてみると色々わかることがあり調査が捗るなと思いました。
