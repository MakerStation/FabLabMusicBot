exports.repeat = async (message, server) => {
	if (server.repeating) {
		server.repeating = false;
		message.react('▶️');
	}
	else {
		server.repeating = true;
		message.react('🔁');
	}
};