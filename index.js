const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const token = require("./token.json").token;

const prefix = require("./prefix.json").prefix;

const bot = new Discord.Client();

var servers = {};

function wrongCommandError(message) {
    message.channel.send('The command doesn\'t exist');
    /*
    setTimeout(function() {
        message.channel.send('!clear 3');
    }, 5000);*/
}

function argumentMissingError(message) {
    message.channel.send('Missing argument');
    /*
    setTimeout(function() {
        message.channel.send('!clear 3');
    }, 5000);*/
}

bot.on('ready', async () => {
    console.log('Bot online');
	bot.user.setActivity(prefix + 'help', { type: 'PLAYING' })
        .catch(console.error);
        
    //var channelTest = bot.channels.find(channel => channel.id === "732992314863124659");
    //channelTest.send("Test");
});

bot.on('message', message => {

    if(message.content.charAt(0) == prefix) {

        let args = message.content.substring(prefix.length).split(" ");
        let embed = new Discord.MessageEmbed();

        switch(args[0]) {
            case "help":
                
                embed.setTitle("Commands (prefix " + prefix + ")")
                .addField("help", "This message with all the available commands")
                .addField("play", "Plays the audio of a youtube video")
                .addField("skip", "Skip to the next track in the list, if there isn't any it leaves the voice channel")
                .addField("stop", "Leaves the voice channel")
                .addField("queque", "Display the queque");
                
                message.channel.send(embed);
                break;

            case "play":

                function play(connection, message) {
                    var server = servers[message.guild.id];

                    server.dispatcher = connection.play(ytdl(server.queque[0], {filter: "audioonly"}));

                    server.queque.shift();

                    server.dispatcher.on("finish", () => {
                        server.titles.shift();
                        if(server.queque[0]) {
                            play(connection, message);
                        }
                        else {
                            connection.disconnect();
                        }

                    });
                }

                var re = /(?:https?:\/\/)?(?:(?:www\.|m.)?youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]{11})/;

                if(!args[1] || !re.test(args[1])) {
                    message.channel.send("No valid youtube link provided");
                    return;
                }
                
                if(!message.member.voice.channel) {
                    message.channel.send("You must be in a voice channel");
                    return;
                }

                if(!servers[message.guild.id]) servers[message.guild.id] = {
                    queque: [],
                    titles: []
                };

                var server = servers[message.guild.id];

                server.queque.push(args[1]);
                
                var title = "";

                ytdl.getBasicInfo (args[1], async (err, info) => {
                    title = await info.videoDetails.title;
                    
                    server.titles.push(title);
                });
                
                if(bot.voice.connections.size==0) message.member.voice.channel.join().then(connection => {
                    play(connection, message);
                })
                message.react("👌");

                break;

            case "skip":

                var server = servers[message.guild.id];

                if(bot.voice.connections.size==1) {
                    
                    server.dispatcher.end();

                    message.react("👌");
                }
                
                break;

            case "stop":

                var server = servers[message.guild.id];

                if(bot.voice.connections.size==1) {
                    for(var i=server.queque.length-1;i>=0;i--) {
                        server.queque.splice(i, 1);
                        server.titles.splice(i, 1);
                    }
                    
                    server.dispatcher.end();
                    message.react("👌");
                }
                
                break;

            case "queque":

                var server = servers[message.guild.id];

                let songsList = "1 - " + server.titles[0] + " (currently playing)";

                embed.setTitle("Queque (" + server.titles.length + ")");
                
                for(let i=1;i<server.titles.length;i++) {
                    songsList = songsList.concat("\n" + (i+1).toString() + " - " + server.titles[i]);
                }
                
                embed.addField("Quequed songs:", songsList);

                message.channel.send(embed);
                
                break;

            default:
                wrongCommandError(message);
                
                break;
        }

    }

});

bot.login(token);