const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('User stat')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Select user to view stat')),
	async execute(interaction) {
    const username = interaction.options.getString('username');
    if (!username) {
      interaction.reply(`Please type username`);
      return;
    }

    const reponse = await request(`${process.env.API_SERVER}/des-bot/get-stats?username=${username}`);
    const { data } = await reponse.body.json();
    if (!data) {
      interaction.reply(`No data`);
      return;
    }
    let tournamentWinRate = data.tournament_joined > 0 ? (data.tournament_wins || 0 / data.tournament_joined) * 100 : 0;
    let matchWinRate = data.match_played > 0 ? (data.match_wins || 0 / data.match_played) * 100 : 0;
    let embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .addFields(
        { name: "Username", value: data.username },
        { name: "Tournament Stats", value: `Tournament wins: ${data.tournament_wins} / Tournament joined ${data.tournament_joined || 1} (${tournamentWinRate}%)` },
        { name: "Match stats", value: `Match wins: ${data.match_wins} / Match joined ${data.match_played} (${matchWinRate}%)` },
        { name: "Total Earnings", value: data.total_earning?.toString() }
      )
    await interaction.reply({ embeds: [embed] })
	},
};
