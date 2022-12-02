const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	execute(message) {
		// console.log(`Message created! ${message}`);
	},
};
