---
title: "コード例で深ぼるEffectiveJava~「第2章コンストラクタの代わりにstaticファクトリメソッドの使用を検討する」の深掘り~"
date: 2025-03-16
categories: 
  - "java"
coverImage: "Screenshot-from-2025-03-23-15-32-06.png"
slug: "effective-java-with-code-static-factory-method"
type: "post"
---

## はじめに

本記事では名著[Effective Java(第3版)](https://amzn.to/4hwNdQh)で言及されているtipsをより深掘りするために、さまざまなコード例を交えて考えるというものになります。

今回は第2章 オブジェクトの生成と消滅の中の項目1「コンストラクタの代わりにstaticファクトリメソッドを検討する」について深掘りします。

## 1\. Staticファクトリメソッドとは

Staticファクトリメソッドとは、「クラスのインスタンスを返す単なるstaticのメソッド」であり、クラスのコンストラクタの代替手段になります。

実装時のポイントは「publicにしたstaticファクトリメソッドから、privateのコンストラクタを呼び出すことでインスタンス生成をする」ということです。

Effective Java内ではBooleanのvalueOf()メソッドが例として挙げられていましたが、よりweb開発者に向けた例としてUserクラスでStaticファクトリメソッドの説明をします。

```
public class User {
    private int id;
    private String name;

    // プライベートコンストラクタ
    private User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // staticファクトリメソッド
    public static User createUser(int id, String name) {
        return new User(id, name);
    }

    public static void main(String[] args) {
        User user = User.createUser(1, "Alice");
        System.out.println(user); // 出力: User{id=1, name='Alice'}
    }
}
```

まずこのUserクラスはidとnameをフィールドに持っており、コンストラクタのメソッドの可視性はprivateになっています。

これに対しstaticファクトリメソッドはpublicになっており、ファクトリメソッド内からprivateのコンストラクタを呼び出してインスタンス生成をしています。

## 2\. Staticファクトリメソッドのメリット

### 2.1. コンストラクタと異なり、名前を持つこと

1点目は「コンストラクタと異なり名前を持つこと」です。

噛み砕いて説明すると、複数の目的を持ったコンストラクタが複数存在する場合にコンストラクタだと同じ名称のメソッドになってしまうためメソッド名から役割を判別できないが、staticファクトリメソッドであればメソッド名を変えることで役割を明示できて可読性が上がるという感じです。

Userクラスを例に説明すると、管理者ユーザと通常ユーザで生成時の処理や渡したいパラメタが異なる際にcreateAdminUser()、createNormalUser()とファクトリメソッドを分けてあげることで、インスタンス生成のメソッドのわかりやすさが上がるという感じです。

```
public class User {
    private int id;
    private String name;

    // プライベートコンストラクタ
    private User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // 管理者ユーザーを生成するstaticファクトリメソッド
    public static User createAdminUser(int id, String name) {
        // ここで管理者ユーザーの生成ロジックを追加できる
        return new User(id, name);
    }

    // 通常ユーザーを生成するstaticファクトリメソッド
    public static User createNormalUser(int id, String name) {
        // ここで通常ユーザーの生成ロジックを追加できる
        return new User(id, name);
    }

    // その他のメソッド...
}
```

### 2.2. コンストラクタと異なり、その呼び出しごとに新たなオブジェクトを生成する必要がないこと

2点目は「コンストラクタと異なり、その呼び出しごとに新たなオブジェクトを生成する必要がないこと」です。

平たく説明すると、再利用可能なオブジェクトに関してはstaticファクトリメソッドを使うことでキャッシュできてメモリ効率やパフォーマンスが向上して良いですよという感じです。

こちらもUserクラスで説明すると以下の通りで、ゲストユーザに関しては一度作成したら、ファクトリメソッドが何回呼ばれても元のインスタンスを返すことで、インスタンス生成のオーバーヘッドを削減できるという感じです。

```
public class User {
    private int id;
    private String name;

    private static final User GUEST_USER = new User(0, "Guest");

    // プライベートコンストラクタ
    private User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // staticファクトリメソッド
    public static User createUser(int id, String name) {
        if (id == 0 && "Guest".equals(name)) {
            return GUEST_USER; // 既存のインスタンスを再利用
        }
        return new User(id, name); // 新しいインスタンスを生成
    }
}
```

### 2.3. コンストラクタと異なり、メソッドの戻り値型の任意のサブタイプのオブジェクトを返せること

3点目は「コンストラクタと異なり、メソッドの戻り値型の任意のサブタイプのオブジェクトを返せること」です。

具体的にはUserインタフェースのファクトリメソッド内でUserクラスのサブタイプとしてNormalUserを生成するのかAdminUserを生成するのか柔軟に切り替えられますとという感じのメリットになります。

まずインタフェースとしてUserを定義します。

```
public interface User {
    int getId();
    String getName();
}
```

次にUserインタフェースの実装クラスとしてAdminUserとNormalUserを定義します。

```
class NormalUser implements User {
  // 実装はAdminUserと同じ
}

class AdminUser implements User {
  // 実装はNormalUserと同じ
}
```

最後に、Userインタフェースの実装クラスを返すファクトリクラスを定義し、その中でstaticファクトリメソッドを定義します。ここではisAdminがtrueかfalseかによって、管理者ユーザを返すか通常ユーザを返すかを切り替えられるようになっています。

```
public class UserFactory {
    public static User createUser(int id, String name, boolean isAdmin) {
        if (isAdmin) {
            // 管理者ユーザーを返す
            return new AdminUser(id, name); 
        } else {
            // 通常ユーザーを返す
            return new NormalUser(id, name); 
        }
    }
}
```

### 2.4. 返されるオブジェクトのクラスは、入力パラメータの値に応じて呼び出しごとに変えられること

4点目は「返されるオブジェクトのクラスは、入力パラメータの値に応じて呼び出しごとに変えられること」です。

例えばUserクラスで説明すると、ファクトリメソッドの引数のisAdminがtrueならAdminUserを生成し、falseならNormalUserを生成するといった感じです。

コード例に関しては長所3と同じです。

### 2.5. 返されるオブジェクトのクラスは、そのstaticファクトリメソッドを含むクラスが書かれた時点で存在する必要がない

5点目は、「返されるオブジェクトのクラスは、そのstaticファクトリメソッドを含むクラスが書かれた時点で存在する必要がない」ということらしいです。

平たく説明すると、「ファクトリメソッドにすることで返すクラスを柔軟に変更できるから、将来的に生成したいクラスが変わっても容易に実装を切り替えられて便利」ということだと思います。

こちらもUserクラスで説明すると長所3とほぼ同じで以下のような感じになります。

```
public interface User {
    int getId();
    String getName();
}

public class UserFactory {
    // Userインタフェースを実装しているクラスのインスタンスを生成する
    public static User createUser(int id, String name) {
        // 一旦は、NormalUserクラスのインスタンスを返すようにしているが、将来的に別のUserインタフェースの実装を返すことも可能
        return new NormalUser(id, name); 
    }
}

class NormalUser implements User {
    private int id;
    private String name;

    public NormalUser(int id, String name) {
        this.id = id;
        this.name = name;
    }
}

// 将来的に以下のようなUserを返すようにすることも可能
class AdminUser implements User {
    private int id;
    private String name;

    public AdminUser(int id, String name) {
        this.id = id;
        this.name = name;
    }
}
```

ポイントは、Userインタフェースを実装したクラスをファクトリメソッドの返り値に設定しておくことで、将来的に別のUserを生成したくなっても簡単に実装が切り替えられるということです。

## 3\. Staticファクトリメソッドのデメリット

### 3.1. publicあるいはprotectedのコンストラクタを持たないクラスのサブクラスは作れないこと

短所の1点目は「publicあるいはprotectedのコンストラクタを持たないクラスのサブクラスは作れないこと」です。

例えばUserクラスのコンストラクがprivateのものしかない以下のような場合を考えます。

```
public class User {
    private int id;
    private String name;

    // プライベートコンストラクタ
    private User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // staticファクトリメソッド
    public static User createUser(int id, String name) {
        return new User(id, name);
    }

    // その他のメソッド...
}
```

この場合はUserクラスを継承したAdminUserを定義することができないので、Userクラスのサブタイプを返すファクトリメソッドも作成できません。

```
public class AdminUser extends User { // エラー: Userクラスにアクセス可能なコンストラクタがない
    // ...
}
```

継承できない不変なクラスを作成するためにprivateのコンストラクタだけ用意する場合は、ファクトリメソッドを使うことが難しくなるため、その場合はコンポジションなど別の設計を導入する必要があると思われます。

その場合の対応は以下の通りです。

まずprivateコンストラクタしか持たせたくないUserクラスにUserクラスのファクトリメソッドを定義します。

```
public class User {
    private int id;
    private String name;

    // プライベートコンストラクタ
    private User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // staticファクトリメソッド
    public static User createUser(int id, String name) {
        return new User(id, name);
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
```

次にAdminUserクラスのフィールドにUserクラスを定義し、AdminUserのファクトリメソッドを用意して、そこでUserのファクトリメソッドを呼ぶ形の実装にします。  
つまり、AdminUserクラスがUserクラスをCompose(内包)するようにして、Userクラスのサブタイプのような役割をAdminUserに持たせるという実装を取ることで、Userクラスのコンストラクタをprivateにした状態で実質サブタイプの役割を果たすクラスのstaticファクトリメソッドが使用できるようになります。

```
public class AdminUser {
    private User user;

    // コンストラクタではUserインスタンスを受け取ります
    public AdminUser(User user) {
        this.user = user;
    }

    // Userのメソッドを委譲
    public int getId() {
        return user.getId();
    }

    public String getName() {
        return user.getName();
    }

    // 管理者ユーザー固有のメソッド
    public void performAdminTask() {
        // 管理者タスクのロジック
    }

    // AdminUserのファクトリメソッド
    public static AdminUser createAdminUser(int id, String name) {
        User user = User.createUser(id, name); // Userのファクトリメソッドを使用
        return new AdminUser(user); // AdminUserインスタンスを生成
    }
}
```

### 3.2. プログラマがstaticファクトリメソッドを見つけるのが難しいこと

2点目の短所は「プログラマがstaticファクトリメソッドを見つけるのが難しいこと」です。

これはJavadocのようなAPIドキュメンテーションツールでコンストラクタがわかりやすくマーキングされるのに対して、ファクトリメソッドはマーキングされないことが多いため、目立たないということを言っているそうです。

ただ筆者的にはこの点はコードのコメントで補えば良い気もしています。

## おわりに

この記事では「コンストラクタの代わりにstaticファクトリメソッドを検討する」という項目をUserクラスを用いて説明しました。  
Effective Javaは有用な内容は書いてあるものの、コード例が少ない項目もあるので適宜コードに起こして理解を深めることが大事ですね。

## 参考

- ブロック, ジョシュア (2018). Effective Java (柴田/芳樹, 翻訳). 第3版. 丸善出版. (原著出版日: 2018/10/30), [https://amzn.to/4hwNdQh](https://amzn.to/4hwNdQh)
