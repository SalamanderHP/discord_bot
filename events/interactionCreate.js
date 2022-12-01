const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
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
		let row = new ActionRowBuilder();
		data.map(ladder => {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`ladder-${ladder._id}`)
					.setLabel(ladder.title)
					.setStyle(ButtonStyle.Secondary)
			)
		});

		await interaction.reply({ content: "Ladders", components: [row] });
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
		let responseString = `Ladder: ${ladderInfo.title}\n`
			+ `Game: ${ladderInfo.game_config.game.name}\n`
			+ `Status: ${ladderInfo.status}\n`
			+ `Hosted by: ${ladderInfo.organizer}\n`
			+ `Time: ${ladderInfo.start_time} - ${ladderInfo.end_time}\n`
			+ `Prizepool: ${ladderInfo.prize_pool?.total_prize}\n`
			+ `Game mode: ${ladderInfo.game_config?.config?.match_record_condition?.game_mode?.mode?.[0]}\n`
			+ `Rank: [Rank] - [Rank]\n`
			+ `Region: ${ladderInfo.game_config?.config?.overall?.region?.[0]}\n`
			+ `Entry fee: ${ladderInfo.registration_fee?.amount}\n`
			+ `Participants(s): ${ladderInfo.players?.length}/${ladderInfo.max_player}\n`
			+ `Prize Distribution: 1st [TBA] / 1st [team name]\n`
			+ "Join this ladder?";
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

		interaction.reply({content: responseString, components: [row]});
	}
}
