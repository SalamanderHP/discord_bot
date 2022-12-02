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
			if (interaction.customId.includes('user-tournament')) {
				await userTournamentButtonHandle(interaction);
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
		let { data } = await response.body.json();
		let ladderInfo = data?.ladder;
		let game_mode = "";
		let attributes = ladderInfo.type === "DOTA2" ? {
			rank: {
				from: ladderInfo.game_config?.config?.overall?.tier?.from?.toString(),
				to: ladderInfo.game_config?.config?.overall?.tier?.to?.toString()
			},
			gameMode: ladderInfo.game_config?.config?.match_record_condition?.game_mode?.mode?.map((mode, index) => {
				if (index == 0) {
					game_mode = mode?.toString();
					return;
				}
				game_mode = `${game_mode?.toString()}, ${mode?.toString()}`;
			})
		} : {
			rank: {
				from: ladderInfo.game_config?.config?.overall?.tier?.from?.toString(),
				to: ladderInfo.game_config?.config?.overall?.tier?.to?.toString()
			},
			gameMode: `${ladderInfo.game_config?.config?.match_record_condition?.game_mode?.mode} - ${ladderInfo.game_config?.config?.match_record_condition?.game_mode?.setting} - ${ladderInfo.game_config?.config?.match_record_condition?.game_mode?.category}`
		};

		let embed = new EmbedBuilder()
      .setColor(0x0099FF)
			.addFields(
				{ name: 'Ladder name', value: ladderInfo.title },
				{ name: 'Game', value: ladderInfo.game_config.game.name },
				{ name: 'Status', value: ladderInfo.status?.toString() || " No data" },
				{ name: 'Hosted by', value: ladderInfo.organizer?.toString() || "No data" },
				{ name: 'Time', value: `${ladderInfo.start_time} - ${ladderInfo.end_time}` },
				{ name: 'Prizepool', value: ladderInfo.prize_pool?.total_prize?.toString() },
				{ name: 'Game mode', value: game_mode?.toString() || "No data" },
				{ name: 'Rank', value: `${attributes.rank.from} - ${attributes.rank.to}` },
				{ name: 'Region', value: ladderInfo.game_config?.config?.overall?.region?.[0]?.toString() || "No region" },
				{ name: 'Entry fee', value: ladderInfo.registration_fee?.amount?.toString() },
				{ name: 'Participants(s)', value: `${ladderInfo.players?.length}/${ladderInfo.max_player}`?.toString() },
				{ name: 'Prize Distribution', value: `1st [TBA] / 1st [team name]` },
			)

		interaction.reply({embeds: [embed]});
	}
}

const userTournamentButtonHandle = async (interaction) => {
	let tournamentId = interaction.customId.split("-");
	tournamentId = tournamentId?.[2];
	if (tournamentId) {
		let response = await request(`${process.env.API_SERVER}/tournament/detail?_id=${tournamentId}`);
		let { data } = await response.body.json();
		let stageName = "";
		let sponsorName = "";
		data?.stages?.map((stage, index) => {
			if (index === 0) {
				stageName = stage.title;
				return;
			}
			stageName = stageName + " - " + stage.title;
		});
		data?.sponsors?.map((sponsor, index) => {
			if (index === 0) {
				sponsorName = sponsor.title;
				return;
			}
			sponsorName = sponsorName + " - " + sponsor.name;
		});

		let embed = new EmbedBuilder()
      .setColor(0x0099FF)
			.addFields(
				{ name: 'Tournament', value: data.name },
				{ name: 'Game', value: data.game.display_name },
				{ name: 'Status', value: data.operating?.status?.toString() || " No data" },
				{ name: 'Hosted by', value: data.guild?.name?.toString() || "No data" },
				{ name: 'Time', value: `${data.operating?.start_time} - ${data.operating?.end_time}` },
				{ name: 'Prizepool', value: data.total_prize?.toString() },
				{ name: 'Game mode', value: data?.game_mode?.display_name?.toString() || "No data" },
				{ name: 'Entry fee', value: data.registration?.fee?.quantity?.toString() || "0" },
				{ name: 'Team(s) joined', value: `${data?.teams?.length}` || "0" },
				{ name: 'Sponsors', value: sponsorName?.toString() || "No data" },
				{ name: 'Prize Distribution', value: `1st [TBA] / 1st [team name]` },
				{ name: 'Stages', value: stageName?.toString() || "No data" },
			)

		interaction.reply({embeds: [embed]});
	}
}
