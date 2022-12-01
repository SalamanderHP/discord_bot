const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, } = require('discord.js');
const { request } = require('undici');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('User stat')
    .addStringOption(option =>
      option.setName('input')
      .addChoices(
        { name: "ladder", value: 'ladder' },
        { name: "tournament", value: 'tournament' }
      )
      .setDescription('Select user to view stat')),
	async execute(interaction) {
    const listType = interaction.options.getString('input');
    if (listType === "ladder") {
      let response = await request(`${process.env.API_SERVER}/des-bot/get-ladder-games`);
      const { data } = await response.body.json();
      if (!data) {
        interaction.reply(`No data`);
        return;
      }

      let row = new ActionRowBuilder();
      data.map(game => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ladder-game-${game.gameInfo._id}`)
            .setLabel(game.gameInfo.name)
            .setStyle(ButtonStyle.Primary)
        )
      });

      let embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Select game to display ladders`)

      await interaction.reply({ embeds: [embed], components: [row] });
    }
	},
};
