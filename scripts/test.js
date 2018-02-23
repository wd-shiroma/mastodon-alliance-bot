var Mastodon = require('mstdn-api').default;
var msg = require('../lib/decorator');
var WebSocketClient = require('websocket').client;

var error_process = function(e, text = '') {
    msg.error('NG');
    if (text) msg.warning(text);
    console.log(e);
    process.exit(0);
}

var check_authorization = function(conf) {
    var bot;
    try {
        bot = new Mastodon(conf.access_token, conf.domain);
    } catch(e) {
        error_process(e, 'Creating bot object failed');
    }

    return new Promise(function(resolve, reject) {
        bot.get('accounts/verify_credentials')
        .then(function(data) {
            msg
                .info('OK')
                .plane('Authorized account is: ' + data.acct + '@' + conf.domain);
            resolve(data);
        }, function(err) {
            msg.error('NG');
            if (err.response) {
                msg
                    .plane('Status code: ', false).error(err.response.statusCode.toString())
                    .plane('Response body: ', false).error(JSON.stringify(err.response.body));
            } else {
                console.log(err);
            }
            reject(err);
        })
    });
};

var check_streaming_authorization = function(conf) {
    return new Promise(function(resolve, reject) {
        var client = new WebSocketClient();
        client.on('connect', (connection) => {
            connection.close();
            msg.info('OK');
            resolve(true);
        });
        client.on('connectFailed', function(error) {
            msg.error('NG').plane('code: ' + error.code + ', host: ' + error.host + ':' + error.port);
            reject(false);
        });
        client.on('httpResponse', (response, wsc) => {
            msg.error('NG');
            console.log(response.statusCode, response.statusMessage, response.req.path, response.req._header);
            reject(false);
        });
        client.connect('wss://' + conf.domain + '/api/v1/streaming/?stream=hashtag&tag=' + conf.hashtag);
    });
};

var check_alliances_authorization = function(alliances) {
    return new Promise(async function(resolve, reject) {
        var authorized = true;
        var check_streaming;

        if (Array.isArray(alliances)) {
            for (key in alliances) {
                var a = alliances[key];
                msg.plane('Connecting alliance timeline (' + a.domain + '#' + a.hashtag + ') ... ', false);

                try {
                    check_streming = await check_streaming_authorization(a);
                    authorized = check_streaming ? authorized : false;
                } catch(e) {
                    authorized = false;
                }
            }
        }
        if (authorized) {
            resolve();
        } else {
            reject();
        }
    });
};

msg.plane('Testing Alliance BOT environments').plane().plane('Loading configuration ... ', false);

try {
    var config = require('config');
} catch(e) {
    error_process(e, 'Loading failed.')
}

msg.info('OK').plane('Authorizing bot account ... ', false);

check_authorization(config)
.then(function() {
    return check_alliances_authorization(config.alliances);
})
.then(function() {
    msg.plane('\nAll tests was completed!');
    process.exit(0);
}, function(e) {
    process.exit(1);
});
