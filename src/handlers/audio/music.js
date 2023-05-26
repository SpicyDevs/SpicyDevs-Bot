const Discord = require('discord.js');
const Voice = require('@discordjs/voice');

module.exports = (client) => {
    client.on(Discord.Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton()) {
            if (interaction.customId == "Bot-musicpause") {
                interaction.deferUpdate();

                const player = client.player.players.get(interaction.guild.id);
                if (!player) return;

                player.pause(true)

                const embedData = interaction.message.embeds[0];

                let row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.previous)
                            .setCustomId("Bot-musicprev")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.play)
                            .setCustomId("Bot-musicstart")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.stop)
                            .setCustomId("Bot-musicstop")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.next)
                            .setCustomId("Bot-musicnext")
                            .setStyle(Discord.ButtonStyle.Secondary),
                    );

                client.embed({
                    title: embedData.title,
                    url: embedData.url,
                    desc: `Music is currently paused`,
                    thumbnail: embedData.thumbnail.url,
                    fields: embedData.fields,
                    components: [row],
                    color: client.config.colors.error,
                    type: 'edit'
                }, interaction.message)
            }

            if (interaction.customId == "Bot-musicstart") {
                interaction.deferUpdate();

                const player = client.player.players.get(interaction.guild.id);
                if (!player) return;

                player.pause(false)

                const embedData = interaction.message.embeds[0];

                let row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.previous)
                            .setCustomId("Bot-musicprev")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.pause)
                            .setCustomId("Bot-musicpause")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.stop)
                            .setCustomId("Bot-musicstop")
                            .setStyle(Discord.ButtonStyle.Secondary),

                        new Discord.ButtonBuilder()
                            .setEmoji(client.emotes.music.next)
                            .setCustomId("Bot-musicnext")
                            .setStyle(Discord.ButtonStyle.Secondary),
                    );

                    let row1 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setEmoji("🔁")
                .setLabel("Loop")
                .setCustomId("Bot-musicloop")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("📃")
                .setCustomId("Bot-musicqueue")
                .setLabel("Queue")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("🔀")
                .setCustomId("Bot-musicshuffle")
                .setLabel("Shuffle")
                .setStyle(Discord.ButtonStyle.Secondary),

           /* new Discord.ButtonBuilder()
                .setEmoji(client.emotes.music.next)
                .setCustomId("Bot-musicnext")
                .setStyle(Discord.ButtonStyle.Secondary),*/
        );

                client.embed({
                    title: embedData.title,
                    url: embedData.url,
                    desc: `Music is currently resumed`,
                    thumbnail: embedData.thumbnail.url,
                    fields: embedData.fields,
                    components: [row, row1],
                    type: 'edit'
                }, interaction.message)
            }

            if (interaction.customId == "Bot-musicstop") {
                interaction.deferUpdate();

                const player = client.player.players.get(interaction.guild.id);
                if (!player) return;

                player.destroy();

                client.embed({
                    desc: `Music is currently stopped`,
                    color: client.config.colors.error,
                    components: [],
                    type: 'edit'
                }, interaction.message)
            }

            if (interaction.customId == "Bot-musicnext") {
                interaction.deferUpdate();

                const player = client.player.players.get(interaction.guild.id);
                if (!player) return;

                player.stop();

                const track = player.queue.current;

                let row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setEmoji("⏮️")
                            .setCustomId("Bot-musicprev")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏸️")
                            .setCustomId("Bot-musicpause")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏹️")
                            .setCustomId("Bot-musicstop")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏭️")
                            .setCustomId("Bot-musicnext")
                            .setStyle(Discord.ButtonStyle.Primary),
                    );

                    let row1 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setEmoji("🔁")
                .setLabel("Loop")
                .setCustomId("Bot-musicloop")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("📃")
                .setCustomId("Bot-musicqueue")
                .setLabel("Queue")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("🔀")
                .setCustomId("Bot-musicshuffle")
                .setLabel("Shuffle")
                .setStyle(Discord.ButtonStyle.Secondary),

           /* new Discord.ButtonBuilder()
                .setEmoji(client.emotes.music.next)
                .setCustomId("Bot-musicnext")
                .setStyle(Discord.ButtonStyle.Secondary),*/
        );

                client.embed({
                    title: `${client.emotes.normal.music}・${track.title}`,
                    url: track.uri,
                    desc: `Music started in <#${player.voiceChannel}>!`,
                    thumbnail: track.thumbnail,
                    fields: [
                        {
                            name: `👤┆Requested By`,
                            value: `${track.requester}`,
                            inline: true
                        },
                        {
                            name: `${client.emotes.normal.clock}┆Ends at`,
                            value: `<t:${((Date.now() / 1000) + (track.duration / 1000)).toFixed(0)}:f>`,
                            inline: true
                        },
                        {
                            name: `🎬┆Author`,
                            value: `${track.author}`,
                            inline: true
                        }
                    ],
                    components: [row, row1],
                    type: 'edit'
                }, interaction.message)
            }

            if (interaction.customId == "Bot-musicprev") {
                interaction.deferUpdate();

                const player = client.player.players.get(interaction.guild.id);
                if (!player || !player.queue.previous) return;

                const track = player.queue.previous;

                let row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setEmoji("⏮️")
                            .setCustomId("Bot-musicprev")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏸️")
                            .setCustomId("Bot-musicpause")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏹️")
                            .setCustomId("Bot-musicstop")
                            .setStyle(Discord.ButtonStyle.Primary),

                        new Discord.ButtonBuilder()
                            .setEmoji("⏭️")
                            .setCustomId("Bot-musicnext")
                            .setStyle(Discord.ButtonStyle.Primary),
                    );

                    let row1 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setEmoji("🔁")
                .setLabel("Loop")
                .setCustomId("Bot-musicloop")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("📃")
                .setCustomId("Bot-musicqueue")
                .setLabel("Queue")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setEmoji("🔀")
                .setCustomId("Bot-musicshuffle")
                .setLabel("Shuffle")
                .setStyle(Discord.ButtonStyle.Secondary),

           /* new Discord.ButtonBuilder()
                .setEmoji(client.emotes.music.next)
                .setCustomId("Bot-musicnext")
                .setStyle(Discord.ButtonStyle.Secondary),*/
        );

                client.embed({
                    title: `${client.emotes.normal.music}・${track.title}`,
                    url: track.uri,
                    desc: `Music started in <#${player.voiceChannel}>!`,
                    thumbnail: track.thumbnail,
                    fields: [
                        {
                            name: `👤┆Requested By`,
                            value: `${track.requester}`,
                            inline: true
                        },
                        {
                            name: `${client.emotes.normal.clock}┆Ends at`,
                            value: `<t:${((Date.now() / 1000) + (track.duration / 1000)).toFixed(0)}:f>`,
                            inline: true
                        },
                        {
                            name: `🎬┆Author`,
                            value: `${track.author}`,
                            inline: true
                        }
                    ],
                    components: [row,row1],
                    type: 'edit'
                }, interaction.message)

                player.play(player.queue.previous)
            }

            if (interaction.customId == "Bot-musicloop") {
                const player = client.player.players.get(interaction.guild.id);
  
    player.setTrackRepeat(!player.trackRepeat);
    const trackRepeat = player.trackRepeat ? "enabled" : "disabled";

    client.succNormal({
        text: `Loop is **${trackRepeat}** for the current song`,
        type: 'ephemeral'
    }, interaction);
            }

            if (interaction.customId == "Bot-musicqueue") {
                const player = client.player.players.get(interaction.guild.id);
               
                let count = 0;
                let status;
            
                if (player.queue.length == 0) {
                    status = "No more music in the queue";
                }
                else {
                    status = player.queue.map((track) => {
                        count += 1;
                        return (`**[#${count}]**┆${track.title.length >= 45 ? `${track.title.slice(0, 45)}...` : track.title} (Requested by <@!${track.requester.id}>)`);
                    }).join("\n");
                }
            
                if (player.queue.current.thumbnail) thumbnail = player.queue.current.thumbnail;
                else thumbnail = interaction.guild.iconURL({ size: 1024 });
            
                client.embed({
                    title: `${client.emotes.normal.music}・Songs queue - ${interaction.guild.name}`,
                    desc: status,
                    thumbnail: thumbnail,
                    fields: [
                        {
                            name: `${client.emotes.normal.music} Current song:`,
                            value: `${player.queue.current.title} (Requested by <@!${player.queue.current.requester.id}>)`
                        }
                    ],
                    type: 'ephemeral'
                }, interaction)
            }

            if (interaction.customId == "Bot-musicshuffle") {
                const Discord = require('discord.js');

    const player = client.player.players.get(interaction.guild.id);

    if (player.queue.size === 0) return client.errNormal({
        error: "Not enough song to shuffle",
        type: 'ephemeral'
    }, interaction);

    player.queue.shuffle()

    client.succNormal({
        text: `Shuffled the queue!`,
        type: 'ephemeral'
    }, interaction);

            }


        }
    }).setMaxListeners(0);
}

 