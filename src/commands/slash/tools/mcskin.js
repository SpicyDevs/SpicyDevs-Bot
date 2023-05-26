const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {

    const name = interaction.options.getString('name');

    if (name == null) return client.errUsage({ usage: "mcskin [player name]",type: 'editreply' }, interaction)
const row = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setStyle(Discord.ButtonStyle.Link).setLabel('Download!').setURL(`https://minotar.net/armor/body/${name}/700.png`))
    client.embed({
        title: `🎮・Skin of ${name}`,
        image: `https://minotar.net/armor/body/${name}/700.png`,
        thumbnail: `https://minotar.net/avatar/${name}/100.png`,
        type: 'editreply',
        components: [row],
    }, interaction)

}
