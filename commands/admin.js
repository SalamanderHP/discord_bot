const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('admin assign'),
	async execute(interaction) {
    const role = interaction.options.getRole('role');
    const member = interaction.options.getMember('target');
    console.log(member);
    member.roles.add(role);
    interaction.reply(`User is now admin of this channel and can use all the commands.`)
	},
};
