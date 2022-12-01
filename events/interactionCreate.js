const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

module.exports = {
	name: Events.InteractionCreate,
  once: false,
	async execute(interaction) {
    if (interaction.isButton()) {
			if (interaction.customId.includes('ladder-game')) {
				await ladderGameButtonHandle(interaction);
				return;
			}
			if (interaction.customId.includes('ladder')) {
				await ladderButtonHandle(interaction);
				return;
			}
		}
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};

const ladderGameButtonHandle = async (interaction) => {
	let gameId = interaction.customId.split("-");
	gameId = gameId?.[2];
	if (gameId) {
		let response = await request(`${process.env.API_SERVER}/des-bot/get-ladder-by-game?game=${gameId}`);
		let { data } = await response.body.json();
		let embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Ladders`)
		let row = new ActionRowBuilder();
		data.map(ladder => {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`ladder-${ladder._id}`)
					.setLabel(ladder.title)
					.setStyle(ButtonStyle.Secondary)
			)
		});

		await interaction.reply({ embeds: [embed], components: [row] });
	}
}

const ladderButtonHandle = async (interaction) => {
	let ladderId = interaction.customId.split("-");
	ladderId = ladderId?.[1];
	if (ladderId) {
		let response = await request(`${process.env.API_SERVER}/ladder/details/${ladderId}`);
		console.log(ladderId, response);
		let { data } = await response.body.json();
		let ladderInfo = data?.ladder;
		let embed = new EmbedBuilder()
      .setColor(0x0099FF)
			.addFields(
				{ name: 'Game', value: ladderInfo.game_config.game.name },
				{ name: 'Status', value: ladderInfo.status },
				{ name: 'Hosted by', value: `${ladderInfo.start_time} - ${ladderInfo.end_time}` },
				{ name: 'Prizepool', value: ladderInfo.prize_pool?.total_prize?.toString() },
				{ name: 'Game mode', value: ladderInfo.game_config?.config?.match_record_condition?.game_mode?.mode?.[0]?.toString() || "Mode" },
				{ name: 'Rank', value: `[Rank] - [Rank]` },
				{ name: 'Region', value: ladderInfo.game_config?.config?.overall?.region?.[0]?.toString() },
				{ name: 'Entry fee', value: ladderInfo.registration_fee?.amount?.toString() },
				{ name: 'Participants(s)', value: `${ladderInfo.players?.length}/${ladderInfo.max_player}`?.toString() },
				{ name: 'Prize Distribution', value: `1st [TBA] / 1st [team name]` },
			)
			.setFooter({ text: "Join ladder?" })
		let row = new ActionRowBuilder();
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`ladder-registration-yes`)
				.setLabel("Yes")
				.setStyle(ButtonStyle.Success)
		)
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`ladder-registration-no`)
				.setLabel("No")
				.setStyle(ButtonStyle.Danger)
		)

		interaction.reply({embeds: [embed], components: [row]});
	}
}
