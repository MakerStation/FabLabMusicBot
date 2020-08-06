exports.help = async (message, embed, prefix) => {

	embed.setTitle('Commands (prefix ' + prefix + ')')
		.addField('help', 'This message with all the available commands')
		.addField('play/p', 'Plays the audio of a youtube video')
		.addField('skip', 'Skip to the next track in the list, if there isn\'t any it leaves the voice channel')
		.addField('jump', 'Jump to the track n of the second argument')
		.addField('repeat', 'Toggle track repeating')
		.addField('pause', 'Pause the audio playback')
		.addField('resume', 'Resume the audio playback')
		.addField('stop/leave/l/disconnect', 'Leaves the voice channel')
		.addField('queue', 'Display the queue');

	message.channel.send(embed);
};