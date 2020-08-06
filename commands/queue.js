exports.queue = async (message, server) => {
	if (server.titles.length == 0) {
		message.channel.send('No songs queued');
	}
	else {

		let songsList = '';

		if (server.repeating) songsList = '\n1 - ' + server.titles[0] + ' (repeating)';
		else if (server.dispatcher.paused) songsList = '\n1 - ' + server.titles[0] + ' (paused)';
		else songsList = '\n1 - ' + server.titles[0] + ' (currently playing)';

		for (let i = 1; i < server.titles.length; i++) {
			songsList = songsList.concat('\n' + (i + 1).toString() + ' - ' + server.titles[i]);
			if(i > 15) {
				songsList = songsList.concat('\nContinue...');
				break;
			}
		}

		message.channel.send('Queued songs (' + server.titles.length + '):' + songsList);

	}
};