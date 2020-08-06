exports.stop = async (message, server, bot) => {
	server.repeating = false;

	if (bot.voice.connections.size == 1) {
		for (let i = server.queue.length - 1; i >= 0; i--) {
			server.queue.splice(i, 1);
			server.titles.splice(i, 1);
		}

		server.dispatcher.end();
	}
	message.react('🛑');
};