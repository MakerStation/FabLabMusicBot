exports.pause = async (message, server, bot) => {
	if (bot.voice.connections.size == 1 && !server.dispatcher.paused) {
		server.dispatcher.pause();
		message.react('⏸️');
	}
	else {
		message.channel.send('Not possible');
	}
};