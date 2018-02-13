var Mastodon = require('mstdn-api').default;

var actions = {};

actions.api = () => {
    return new Mastodon('5bc5f70a91662e6307adcac975e79a1e3b9172a003f3e57f31e4d9b95a45f83d', 'abyss.fun');
};

module.exports = actions;
