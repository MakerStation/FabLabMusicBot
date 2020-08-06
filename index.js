const Discord = require('discord.js');
const bot = new Discord.Client();

const ytdl = require('ytdl-core');
const yts = require('yt-search');

const requires = (...modules) => modules.map(module => require(module));
const [{ help }, { play }, { skip }, { jump }, { repeat }, { pause }, { resume }, { stop }, { queue }] = requires('./commands/help', './commands/play', './commands/skip', './commands/jump', './commands/repeat', './commands/pause', './commands/resume', './commands/stop', './commands/queue');

const {
	token,
	spClientId,
	spClientSecret,
} = require('./token.json');

const prefix = require('./prefix.json').prefix;

const {
	wrongCommand,
} = require('./functions');

const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
	clientId: spClientId,
	clientSecret: spClientSecret,
});

spotifyApi.clientCredentialsGrant()
	.then(function(data) {

		spotifyApi.setAccessToken(data.body['access_token']);

	}, function(err) {
		console.log('Something went wrong!', err);
	});

const servers = {};

bot.on('ready', async () => {
	console.log('Bot online');
	bot.user.setActivity(prefix + 'help', {
		type: 'PLAYING',
	})
		.catch(console.error);
});

bot.on('message', async (message) => {

	if (!servers[message.guild.id]) {
		servers[message.guild.id] = {
			queue: [],
			titles: [],
			currentlyPlaying: '',
			repeating: false,
		};
	}

	if (message.content.startsWith(prefix)) {

		const args = message.content.substring(prefix.length).split(' ');
		const embed = new Discord.MessageEmbed();
		const server = servers[message.guild.id];

		switch (args[0]) {
		case 'help':

			help(message, embed, prefix);

			break;

		case 'p':
		case 'play':

			play(message, server, bot, args, ytdl, yts, spotifyApi);

			break;

		case 'skip':

			skip(message, server, bot);

			break;

		case 'jump':

			jump(message, server, bot, args);

			break;

		case 'repeat':

			repeat(message, server);

			break;

		case 'pause':

			pause(message, server, bot);

			break;

		case 'resume':

			resume(message, server, bot);

			break;

		case 'leave':
		case 'l':
		case 'disconnect':
		case 'stop':

			stop(message, server, bot);

			break;

		case 'queue':

			queue(message, server);

			break;

		default:

			wrongCommand(message);

			break;
		}

	}

});

bot.login(token);