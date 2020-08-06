const {
	missingArgumentError,
	wrongArgumentError,
	sleep,
} = require('../functions');

exports.jump = async (message, server, bot, args) => {
	if (args[1] == null) {
		missingArgumentError(message);
		return;
	}

	if (isNaN(args[1])) {
		wrongArgumentError(message);
		return;
	}

	if (bot.voice.connections.size == 1) {

		for (let i = 0; i < parseInt(args[1]) - 1; i++) {
			server.dispatcher.end();
			await sleep(500);
		}

		message.react('👌');
	}
};