const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const player = client.player.players.get(interaction.guild.id);

    const channel = interaction.member.voice.channel;
    if (!channel) return client.errNormal({
        error: `You're not in a voice channel!`,
        type: 'editreply'
    }, interaction);

    if (player && (channel.id !== player?.voiceChannel)) return client.errNormal({
        error: `You're not in the same voice channel!`,
        type: 'editreply'
    }, interaction);

    if (!player || !player.queue.previous) return client.errNormal({
        error: "There are no songs was played previously",
        type: 'editreply'
    }, interaction);

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
        components: [row, row1],
        type: 'editreply'
    }, interaction)

    player.play(player.queue.previous)
}

 