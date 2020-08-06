exports.skip = async (message, server, bot) => {
	if (bot.voice.connections.size == 1) {

		server.dispatcher.end();

		message.react('👌');
	}
};