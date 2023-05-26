const Discord = require('discord.js');
const { REST } = require('discord.js');
const { Routes } = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');

module.exports = (client) => {
    const interactionLogs = new Discord.WebhookClient({
        id: client.webhooks.interactionLogs.id,
        token: client.webhooks.interactionLogs.token,
    });

    const commands = [];

    if (client.shard.ids[0] === 0) console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), (chalk.green(`Loading commands`)), (chalk.white(`...`)))
    if (client.shard.ids[0] === 0) console.log(`\u001b[0m`);

    fs.readdirSync('./src/interactions').forEach(dirs => {
        const commandFiles = fs.readdirSync(`./src/interactions/${dirs}`).filter(files => files.endsWith('.js'));

        if (client.shard.ids[0] === 0) console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), chalk.red(`${commandFiles.length}`), (chalk.green(`commands of`)), chalk.red(`${dirs}`), (chalk.green(`loaded`)));

        for (const file of commandFiles) {
            const command = require(`${process.cwd()}/src/interactions/${dirs}/${file}`);
            client.commands.set(command.data.name, command);
            commands.push(command.data);
        };
    });

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    (async () => {
        try {
            const embed = new Discord.EmbedBuilder()
                .setDescription(`Started refreshing application (/) commands.`)
                .setColor(client.config.colors.normal)
            interactionLogs.send({
                username: 'Bot Logs',
                embeds: [embed]
            });

            await rest.put(
                Routes.applicationCommands(client.config.discord.id),
                { body: commands },
            )

            const embedFinal = new Discord.EmbedBuilder()
                .setDescription(`Successfully reloaded ${commands.length} application (/) commands.`)
                .setColor(client.config.colors.normal)
            interactionLogs.send({
                username: 'Bot Logs',
                embeds: [embedFinal]
            });

        } catch (error) {
            console.log(error);
        }
    })();

    let ammount = 0;
  fs.readdirSync(`${process.cwd()}/src/commands/prefix/`).forEach(dir => {
    const files = fs.readdirSync(`${process.cwd()}/src/commands/prefix/${dir}/`).filter(file => file.endsWith('.js'));
    if (!files || files.legnth <= 0) console.log(("Commands - 0").red)
    files.forEach((file) => {
      let command = require(`${process.cwd()}/src/commands/prefix/${dir}/${file}`)
      if (command) {
        client.commands.set(command.name, command)
        ammount++;
        if (command.aliases && Array.isArray(command.aliases)) {
          command.aliases.forEach(alias => {
            client.aliases.set(alias, command.name)
          })
        }
      } else {
        console.log(chalk.red(chalk.bold(`Command Error: ${command.name || file.split('.js')[0] || "Missing Name"}`)))
      }
    });
  });
  setTimeout(() => {
    console.log(chalk.green(`Loaded ${ammount} Prefix Commands`.bold))
  }, 1500)
}

 