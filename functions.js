exports.wrongCommand = (message) => {
	message.channel.send('The command doesn\'t exist');
};

exports.missingArgument = (message) => {
	message.channel.send('Missing argument');
};

exports.wrongArgument = (message) => {
	message.channel.send('Wrong argument');
};

exports.sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};