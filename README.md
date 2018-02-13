# Mastodon Federation bot

マストドン用連合bot (Federation bot) です。

## 機能

- 自動フォロー返し
- 未フォローユーザーを自動フォロー（これから実装予定）

## Requires

- Node.js(latest)  
My develop environment is (v9.5.0)

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
            "access_token": "REMOTE INSTANCE ACCESS TOKEN",
            "hashtag": "hash_tag"
        },
        {
            "domain": "example3.com",
            "access_token": "REMOTE INSTANCE ACCESS TOKEN",
            "hashtag": "hash_tag"
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
- `alliances.access_token`: リモートインスタンスに設置した監視アカウントのアクセストークンです。  
※リモートインスタンスではストリーミングを流すだけです。フォロー等アカウント操作はしません。
- `alliances.hashtag`: ストリーミングを流すハッシュタグを指定します。

