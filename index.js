const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

const token = require("./token.json").token;

const prefix = require("./prefix.json").prefix;

const bot = new Discord.Client();

var servers = {};

function wrongCommandError(message) {
    message.channel.send('The command doesn\'t exist');
}

function argumentMissingError(message) {
    message.channel.send('Missing argument');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

bot.on('ready', async () => {
    console.log('Bot online');
	bot.user.setActivity(prefix + 'help', { type: 'PLAYING' })
        .catch(console.error);
});

bot.on('message', async message => {

    if(message.content.charAt(0) == prefix) {

        let args = message.content.substring(prefix.length).split(" ");
        let embed = new Discord.MessageEmbed();

        switch(args[0]) {
            case "help":
                
                embed.setTitle("Commands (prefix " + prefix + ")")
                .addField("help", "This message with all the available commands")
                .addField("play/p", "Plays the audio of a youtube video")
                .addField("skip", "Skip to the next track in the list, if there isn't any it leaves the voice channel")
                .addField("jump", "Jump to the track n of the second argument")
                .addField("stop/leave/l/disconnect", "Leaves the voice channel")
                .addField("queue", "Display the queue");
                
                message.channel.send(embed);
                break;

            case "p":
            case "play":

                function play(connection, message) {
                    var server = servers[message.guild.id];

                    server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}));

                    server.queue.shift();

                    server.dispatcher.on("finish", () => {
                        server.titles.shift();
                        if(server.queue[0]) {
                            play(connection, message);
                        }
                        else {
                            connection.disconnect();
                        }

                    });
                }

                var re = /(?:https?:\/\/)?(?:(?:www\.|m.)?youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]{11})/;
                var url = "";

                if(!args[1]) {
                    argumentMissingError(message);
                    return;
                }

                if(!re.test(args[1])) {

                    var name = args.slice(1, args.length).join(" ");

                    yts(name, function (err, r) {
                        const videos = r.videos
                        url = videos[0].url;
                    });
                }
                else {
                    url = args[1];
                }

                await sleep(5000);
                
                if(!message.member.voice.channel) {
                    message.channel.send("You must be in a voice channel");
                    return;
                }

                if(!servers[message.guild.id]) servers[message.guild.id] = {
                    queue: [],
                    titles: []
                };

                var server = servers[message.guild.id];

                server.queue.push(url);
                
                var title = "";

                ytdl.getBasicInfo (url, async (err, info) => {
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

            case "jump":

                var server = servers[message.guild.id];

                if(args[1]==null) {
                    argumentMissingError(message);
                }

                if(isNaN(args[1])) {
                    wrongCommandError(message);
                }

                if(bot.voice.connections.size==1) {
                    
                    for(var i=0;i<parseInt(args[1])-1;i++) {
                        server.dispatcher.end();
                        await sleep(500);
                    }

                    message.react("👌");
                }
                
                break;

            case "leave":
            case "l":
            case "disconnect":
            case "stop":

                var server = servers[message.guild.id];

                if(bot.voice.connections.size==1) {
                    for(var i=server.queue.length-1;i>=0;i--) {
                        server.queue.splice(i, 1);
                        server.titles.splice(i, 1);
                    }
                    
                    server.dispatcher.end();
                    message.react("👌");
                }
                
                break;

            case "queue":

                var server = servers[message.guild.id];

                if(server.titles.length == 0) {
                    message.channel.send("No songs queued");
                }
                else {

                    let songsList = "\n1 - " + server.titles[0] + " (currently playing)";
                    
                    for(let i=1;i<server.titles.length;i++) {
                        songsList = songsList.concat("\n" + (i+1).toString() + " - " + server.titles[i]);
                    }
                    
                    embed.addField("Queued songs:", songsList);
                    message.channel.send("Queued songs:" + songsList);

                }

                
                break;

            default:
                wrongCommandError(message);
                
                break;
        }

    }

});

bot.login(token);