const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('DES BOT is a bot that helps you host e-Sports tournament in your Discord Server'),
	async execute(interaction) {
		await interaction.reply('DES BOT is a bot that helps you host e-Sports tournament in your Discord Server');
	},
};
