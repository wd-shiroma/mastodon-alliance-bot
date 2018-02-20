# Mastodon alliance bot

マストドン用の、リモートインスタンスで流れているハッシュタグTLを監視するbotです。

## What purpose

デフォルトハッシュタグをLTLに流すインスタンス( https://theboss.tech など)の完全なLTLを再現するために作りました。

## Features

- 自インスタンスのbotの自動フォロー返し
- リモートインスタンスのトゥートを監視し、自インスタンスでsearch
- リモートインスタンスのアカウントを監視し、自インスタンスのbotで自動フォロー

## Requires

- Node.js(latest)
My develop environment is (v8.6.0)

## How to use

```script
# download git repository.
git clone https://github.com/wd-shiroma/mastodon-federation-bot

# setup configuration.
cd mastodon-federation-bot
cp config/default.json.sample config/default.json
vim config/default.json


## npm scripts

# install packages
npm install

# check user environment
npm test

# run bot
npm start

# stop bot
npm stop

# stop all forever processes
npm run stopall

# list bot running
npm run list
```

## Configuration

Configuration file is loaded `./config/default.json`.

サンプルファイルをコピーして自分の環境に合わせて編集してください。

```script
cp config/default.json.sample config/default.json
vim config/default.json
```

```
$ cat config/default.json.sample
{
    "domain": "example.com",
    "access_token": "YOUR INSTANCE ACCESS TOKEN",
    "follow_back": true,
    "follow_back_status": "フォローしました。。。承認をしてください。。。",
    "delay": 10000,
    "alliances": [
        {
            "domain": "example2.com",
            "hashtag": "hash_tag",
            "follow_back": true
        },
        {
            "domain": "example3.com",
            "hashtag": "hash_tag",
            "follow_back": false
        }
    ]
}
```

- `domain`: 自インスタンスのドメイン名です。
- `access-token`: botとして動作させるアカウントのアクセストークンです。
※「ユーザー設定」→「開発」→「アプリ」から各自でアクセストークンを取得してください。
- `follow_back`: 自インスタンスのbotがフォローされたら自動フォロー返しをします。
- `follow_back_status`: 相手が鍵アカウントの場合はフォローリクエストを送ったメッセージを投げます。
- `delay`: リモートインスタンスのトゥート検索とフォローの実行遅延時間を設定します。(ms)
- `alliances`: ハッシュタグストリームを流すリモートインスタンスの情報です。(複数指定可)
- `alliances.domain`: リモートインスタンスのドメイン名です。
- `alliances.hashtag`: ストリーミングを流すハッシュタグを指定します。
- `alliances.follow_back`: ストリーミングに流れてきた未フォローアカウントをフォローします。

