#!/usr/bin/env node

var Mastodon = require('mstdn-api').default;
var config = require('config');
var WebSocketClient = require('websocket').client;

var verify_credentials;
var streams = [];
var tokens = {};

var is_local = function(account) {
    var re = new RegExp('@' + config.domain + '$');
    return account.username.match(re) ? true : false;
}

var is_following = async function(account_url) {
    var token = tokens[config.access_token];
    var user_data = await token.get('search', { q: account_url, limit: 1 });
    if (user_data && user_data.accounts.length > 0) {
        var relationships = await token.get('accounts/relationships', {id: [user_data.accounts[0].id]});
        return relationships[0].following;
    } else {
        return false;
    }
};

var prepare_tokens = async function() {
    try {
        var a;
        var token = new Mastodon(config.access_token, config.domain);
        verify_credentials = await token.get('accounts/verify_credentials');
        tokens[config.access_token] = token;
        if (Array.isArray(config.alliances)) {
            for (var i = 0; i < config.alliances.length; i++) {
                a = config.alliances[i];
                if (tokens[a.access_token]) continue;
                tokens[a.access_token] = new Mastodon(a.access_token, a.domain);
            }
        }
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};

var get_following = async function() {
    var token = tokens[config.access_token];
    var max_id, following = [];
    var response = token.get('accounts/' + verify_credentials.id + '/following');
    while (response.length > 0) {
        following = follows.concat(response);
    }
};

var start_self_streaming = function() {
    var token = tokens[config.access_token];
    var stream = token.stream('user', 1000);

    stream.on('notification', function(payload) {
        if (payload.type === 'follow') {
            token.post('accounts/' + payload.account.id + '/follow');
            if (payload.account.locked) {
                var _status = '@' + payload.account.acct + ' ' + config.follow_back_status;
                token.post('statuses', {
                    status: _status,
                    visibility: 'direct'
                });
            }
        }
    });

    stream.on('error', function(error) {
        console.log('error!');
        console.log(error);
    });

    streams.push(stream);
    console.log(config.domain + ': notificaton streaming start');
};

var start_alliance_streaming = function(alliance, delay = 1000) {
    var url = 'wss://' + alliance.domain + '/api/v1/streaming/?stream=hashtag&tag=' + alliance.hashtag;
    var client = new WebSocketClient();
    var client_connect = function() {
        client.connect(url);
    };
    client.on('connect', function(connection) {
        console.log(alliance.domain + ': #' + alliance.hashtag + ' tag streaming start');
        connection.on('error', function(e) {
            console.log('streaming error');
        });
        connection.on('close', function() {
            console.log('connection closed.');
            setTimeout(client_connect, delay);
        });
        connection.on('message', function(message) {
            if (message.type !== 'utf8') return;
            var data = JSON.parse(message.utf8Data);
            if (data.event !== 'update') return;
            var payload = JSON.parse(data.payload);
            setTimeout(search_and_following, config.delay, payload, alliance.follow_back);
        });
    });
    client_connect();
    return client;
};

var search_and_following = async function(payload, follow_back = false) {
    var token = tokens[config.access_token];
    if (!is_local(payload.account) && !(await is_following(payload.account.url))) {
        var response = await token.get('search', { q: payload.uri, resolve: true });
        if (!payload.account.locked && follow_back) {
            account = response.statuses[0].account;
            await token.post('accounts/' + account.id + '/follow');
        }
    }
};

var main = async function() {
    await prepare_tokens();
    start_self_streaming();

    if (Array.isArray(config.alliances)) {
        config.alliances.forEach(function(a) {
            streams.push(start_alliance_streaming(a));
        });
    }
};

process.on('unhandledRejection', console.dir);

main();

