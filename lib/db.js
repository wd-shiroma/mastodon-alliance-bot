var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('./db.sql');

var actions = {};

actions.init = function(accounts = []) {
    db.serialize(function() {
        db.run('create table follows (id integer primary key, acct text, payload text)');
        if (Array.isArray(accounts) && accounts.length) {
            var stmt = db.prepare('insert into follows values (?, ?, ?)');
            for (var i = 0; i < accounts.length; i++) {
                stmt.run([
                    accounts[i].id,
                    accounts[i].acct,
                    JSON.stringify(accounts[i])
                ]);
            }
            stmt.finalize();
        }
    });
};

actions.refresh_follows = function(accounts) {
    db.serialize(function() {
        db.run('drop table follows');
        db.run('vacuum');
        actions.init(accounts);
    });
};

actions.insert_to_follows = function(account) {
    db.serialize(function() {
        db.run('insert into follows values (?, ?, ?)',[
            account.id,
            account.acct,
            JSON.stringify(account)
        ]);
    });
};

actions.is_follow = function(account) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.get('select * from follows where acct = ? limit 1',
                [ account.acct ],
                function(err, rows) {
                    if (err) {
                        reject(err);
                    } else if (rows.length) {
                        resolve(rows[0])
                    } else {
                        reject();
                    }
                }
            );
        );
    );
};

module.exports = actions;
