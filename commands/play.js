const {
	sleep,
	missingArgumentError,
} = require('../functions');

const queueAndPlayTracks = async (message, server, bot, ytdl, yts, tracks, queueingMessage, queueingPos, queueLenght) => {
	let name = tracks[0].track.name;
	tracks[0].track.album.artists.forEach(artist => {
		name += ' ' + artist.name;
	});

	await yts(name, async (err, r) => {
		const videos = await r.videos;
		let url = videos[0].url;
		server.queue.push(url);


		let title = videos[0].title;
		server.titles.push(title);

		if (bot.voice.connections.size == 0) {
			message.member.voice.channel.join().then(connection => {
				playTrack(connection, message, server, ytdl);
			});
		}

		tracks.shift();
		if (tracks[0] != undefined) {
			queueingMessage.edit('Queued ' + queueingPos + '/' + queueLenght + ' (' + title + ')');
			queueAndPlayTracks(message, server, bot, ytdl, yts, tracks, queueingMessage, queueingPos + 1, queueLenght);
		}
		else {
			message.reactions.removeAll();
			message.react('👌');
			queueingMessage.edit('Queued all tracks');
		}
	});
};

const playFromName = async (message, server, bot, ytdl, yts, name) => {
	let url = '';
	await yts(name, async (err, r) => {
		const videos = r.videos;
		let url = videos[0].url;
		server.queue.push(url);

		let title = videos[0].title;
		server.titles.push(title);

		playUrl(message, server, bot, ytdl);
		
	});
};

const playFromUrl = async (message, server, bot, ytdl, url) => {
	let title = '';

	await ytdl(url)
		.on('info', (info) => {
			title = info.videoDetails.title;
			server.queue.push(url);
			server.titles.push(title);
			playUrl(message, server, bot, ytdl);
		});

};

const playUrl = (message, server, bot, ytdl) => {
	if (bot.voice.connections.size == 0) {
		message.member.voice.channel.join().then(connection => {
			playTrack(connection, message, server, ytdl);
		});
	}
	message.react('👌')

};

const playTrack = (connection, message, server, ytdl) => {

	if (server.repeating) {
		server.dispatcher = connection.play(ytdl(server.currentlyPlaying, {
			filter: 'audioonly',
		}), {
			bitrate: 30000,
		});
	}
	else {
		server.dispatcher = connection.play(ytdl(server.queue[0], {
			filter: 'audioonly',
		}), {
			bitrate: 30000,
		});
		server.currentlyPlaying = server.queue[0];
		server.queue.shift();
	}

	server.dispatcher.on('finish', () => {
		if (server.repeating) {
			playTrack(connection, message, server, ytdl);
		}
		else {
			server.titles.shift();
			if (server.queue[0]) {
				playTrack(connection, message, server, ytdl);
			}
			else {
				connection.disconnect();
			}
		}

	});
};

exports.play = async (message, server, bot, args, ytdl, yts, spotifyApi) => {

	let name = '';
	const ytRe = /(?:https?:\/\/)?(?:(?:www\.|m.)?youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]{11})/;
	const spRe = /https:\/\/open.spotify.com\/playlist\/(.{22})/;
	let url = '';

	if (!args[1]) {
		missingArgumentError(message);
		return;
	}

	if (!message.member.voice.channel) {
		message.channel.send('You must be in a voice channel');
		return;
	}

	if (ytRe.test(args[1])) {
		url = args[1];
		playFromUrl(message, server, bot, ytdl, url);
	}
	else if (spRe.test(args[1])) {

		spotifyApi.getPlaylistTracks(spRe.exec(args[1])[1])
			.then(
				async function(data) {
					const tracks = data.body.items;
					message.react('🔄');
					let queueingMessage;
					message.channel.send('Queueing').then(sentMessage => queueingMessage = sentMessage);
					await sleep(1000);

					queueAndPlayTracks(message, server, bot, ytdl, yts, tracks, queueingMessage, 1, tracks.length);

				},
				function(err) {
					console.log('Something went wrong!', err);
				},
			);

	}
	else {
		name = args.slice(1, args.length).join(' ');

		playFromName(message, server, bot, ytdl, yts, name);
	}


};