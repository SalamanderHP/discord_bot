const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with TBA!'),
	async execute(interaction) {
		await interaction.reply('TBA');
	},
};
