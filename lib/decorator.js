var ansi = require('ansi');
var cursor = ansi(process.stdout);

var actions = {};

actions.plane = function(text = '', newline = true) {
    cursor.write(text).write(newline ? '\n' : '');
    return this;
};

actions.info = function(text = '', newline = true) {
    cursor.green().write(text).reset().write(newline ? '\n' : '');
    return this;
};

actions.warning = function(text = '', newline = true) {
    cursor.yellow().write(text).reset().write(newline ? '\n' : '');
    return this;
};

actions.error = function(text = '', newline = true) {
    cursor.red().bold().write(text).reset().write(newline ? '\n' : '');
    return this;
};

module.exports = actions;