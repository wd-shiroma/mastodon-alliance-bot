#!/usr/bin/env node

var Mastodon = require('mstdn-api').default;
var config = require('config');

var verify_credentials;
var streams = [];
var tokens = {};

var is_local = function(account) {
    return account.acct !== account.username;
}

var is_following = async function(account) {
    var relationships = await tokens[config.access_token].get('accounts/relationships', {id: [account.id]});
    return relationships[0].following;
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
        process.exit(1);
    });

    streams.push(stream);
    console.log(config.domain + ': notificaton streaming start');
};

var start_alliance_streaming = function(alliance) {
    var alliance_token = tokens[alliance.access_token];
    var stream = alliance_token.stream('hashtag?tag=' + alliance.hashtag, 1000);
    var statuses, account;

    stream.on('update', function(payload) {
        setTimeout(search_and_following, config.delay, payload, alliance.follow_back);
    });

    stream.on('error', function(error) {
        console.log('error!');
        console.log(error);
        process.exit(1);
    });

    streams.push(stream);
    console.log(alliance.domain + ': #' + alliance.hashtag + ' tag streaming start');
};

var search_and_following = async function(payload, follow_back = false) {
    var token = tokens[config.access_token];
    if (!(await is_following(payload.account)) && !is_local(payload.account)) {
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
            start_alliance_streaming(a);
        });
    }
};

process.on('unhandledRejection', console.dir);

main();

