const { timeParsed } = require('../modules/utils');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${timeParsed()}Logged with '${client.user.tag}'`);
    },
};