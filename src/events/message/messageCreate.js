const Discord = require("discord.js");

const Functions = require("../../database/models/functions");
const afk = require("../../database/models/afk");
const chatBotSchema = require("../../database/models/chatbot-channel");
const messagesSchema = require("../../database/models/messages");
const messageSchema = require("../../database/models/levelMessages");
const messageRewards = require("../../database/models/messageRewards");
const Schema = require("../../database/models/stickymessages");
const levelRewards = require("../../database/models/levelRewards");
const levelLogs = require("../../database/models/levelChannels");
const Commands = require("../../database/models/customCommand");
const CommandsSchema = require("../../database/models/customCommandAdvanced");
const fetch = require("node-fetch");

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @returns 
 */
module.exports = async (client, message) => {
  const dmlog = new Discord.WebhookClient({
    id: client.webhooks.dmLogs.id,
    token: client.webhooks.dmLogs.token,
  });

  try {
    // ==============================< Prefix Command Handling >=============================\\	
    const prefix = client.prefix;
    if (message.author.bot) return;
    if (message.channel.type !== 0) return;
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);
    if (!prefixRegex.test(message.content)) return;
    const [mPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(mPrefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd) || client.commands.find(c => c.aliases && c.aliases.includes(cmd)) //|| client.commands.get(client.aliases.get(cmd));
    // ==============================< If command doesn't found >=============================\\         
    if (cmd.length === 0) {
      if (mPrefix.includes(client.user.id))
        return message.reply({
        //  components: [client.linksButtons],
          embeds: [new EmbedBuilder()
            .setColor(client.embed.color)
            .setDescription(`✅ **To see my commands list type \`${client.prefix}help\` or \`/help\`**`)
          ],
        }).catch(() => { });
      return;
    }
    // ==============================< If !command return >=============================\\
    if (!command) {
      return message.reply({
        embeds: [
          client.Embed(false)
            .setColor(client.embed.wrongcolor)
            .setDescription(`ℹ The command \`${cmd}\` does not exist`)
        ]
      }).then(m => setTimeout(() => m.delete(), 6000));
    }
    if (command) {
      // ==============================< Toggle off >=============================\\
      if (command.toggleOff) {
        return await message.reply({
          embeds: [new EmbedBuilder()
            .setDescription(`❎ **That Command Has Been Disabled By The Developers! Please Try Later.**`)
            .setColor(client.embed.wrongcolor)
          ]
        }).then(msg => {
          setTimeout(() => {
            msg.delete().catch((e) => {
              console.log(String(e).grey)
            })
          }, 6000)
        }).catch((e) => {
          console.log(String(e).grey)
        });
      }
      // ==============================< On Mainenance Mode >============================= \\
      if (command.maintenance) {
        return await message.reply({
          content: `❎ **${command.name} command is on __Maintenance Mode__** try again later!`
        })
      }
      // ==============================< Owner Only >============================= \\
      if (command.ownerOnly) {
        const owners = client.config.DEV.OWNER.concat(
          client.config.DEV.CO_OWNER
        );
        if (!owners.includes(message.author.id)) return await message.reply({
          embeds: [new EmbedBuilder()
            .setDescription(`❎ **You cannot use \`${prefix}${command.name}\` command as this is a developer command.**`).setColor(client.embed.wrongcolor)
          ]
        }).then(msg => {
          setTimeout(() => {
            msg.delete().catch((e) => {
              console.log(String(e).grey)
            })
          }, 6000)
        }).catch((e) => {
          console.log(String(e).grey)
        });
      }
      // ==============================< Permissions checking >============================= \\
      if (command.userPerms || command.botPerms) {
        if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPerms || []))) {
          const userPerms = new EmbedBuilder()
            .setDescription(`❎ ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!`)
            .setColor(client.embed.wrongcolor)
          return message.reply({ embeds: [userPerms] })
        }
        if (!message.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPerms || []))) {
          const botPerms = new EmbedBuilder()
            .setDescription(`❎ ${message.author}, I don't have \`${command.botPerms}\` permissions to use this command!`)
            .setColor(client.embed.wrongcolor)
          return message.reply({ embeds: [botPerms] })
        }
      }
      // ==============================< Music Command >============================= \\
      
      // ==============================< NSFW checking >============================= \\
      if (command.nsfwOnly && !message.channel.nsfw) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`❎ ${message.author.username} This command only works in NSFW channels!`)
              .setDescription(`Please go to the NSFW channel to use this command!`)
              .setColor(client.embed.wrongcolor)
          ]

        }).then(m => setTimeout(() => m.delete(), 6000));
      }
      // ==============================< Only for offical guilds >============================= \\
      if (command.guildOnly) {
        const private = client.config.SERVER.OFFICIAL.Guild_ID_1
          .concat(client.config.SERVER.Guild_ID_2);
        if (!private.includes(message.guild.id)) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`❎ ${message.author.username} You have entered an invalid command!`)
                .setDescription(`The command \`${command.name}\` can only be used in the official server.`)
                .setColor(client.embed.wrongcolor)
            ]
          }).then(m => setTimeout(() => m.delete(), 6000));
        }
      }
    
      // ==============================< Start The Command >============================= \\
      await command.run(client, message, args)
    }
    // ==============================< On Error >============================= \\
  } catch (error) {
    client.msg_err(client, message, error);
  }

  if (message.author.bot) return;

  if (message.channel.type === Discord.ChannelType.DM) {
    let embedLogs = new Discord.EmbedBuilder()
      .setTitle(`💬・New DM message!`)
      .setDescription(`Bot has received a new DM message!`)
      .addFields(
        { name: "👤┆Send By", value: `${message.author} (${message.author.tag})`, inline: true },
        { name: `💬┆Message`, value: `${message.content || "None"}`, inline: true },
      )
      .setColor(client.config.colors.normal)
      .setTimestamp();

    if (message.attachments.size > 0)
      embedLogs.addFields(
        { name: `📃┆Attachments`, value: `${message.attachments.first()?.url}`, inline: false },
      )
    return dmlog.send({
      username: "Bot DM",
      embeds: [embedLogs],
    });
  }

  // Levels
  Functions.findOne({ Guild: message.guild.id }, async (err, data) => {
    if (data) {
      if (data.Levels == true) {
        const randomXP = Math.floor(Math.random() * 9) + 1;
        const hasLeveledUp = await client.addXP(
          message.author.id,
          message.guild.id,
          randomXP
        );

        if (hasLeveledUp) {
          const user = await client.fetchLevels(
            message.author.id,
            message.guild.id
          );

          const levelData = await levelLogs.findOne({
            Guild: message.guild.id,
          });
          const messageData = await messageSchema.findOne({
            Guild: message.guild.id,
          });

          if (messageData) {
            var levelMessage = messageData.Message;
            levelMessage = levelMessage.replace(
              `{user:username}`,
              message.author.username
            );
            levelMessage = levelMessage.replace(
              `{user:discriminator}`,
              message.author.discriminator
            );
            levelMessage = levelMessage.replace(
              `{user:tag}`,
              message.author.tag
            );
            levelMessage = levelMessage.replace(
              `{user:mention}`,
              message.author
            );

            levelMessage = levelMessage.replace(`{user:level}`, user.level);
            levelMessage = levelMessage.replace(`{user:xp}`, user.xp);

            try {
              if (levelData) {
                await client.channels.cache
                  .get(levelData.Channel)
                  .send({ content: levelMessage })
                  .catch(() => { });
              } else {
                await message.channel.send({ content: levelMessage });
              }
            } catch {
              await message.channel.send({ content: levelMessage });
            }
          } else {
            try {
              if (levelData) {
                await client.channels.cache
                  .get(levelData.Channel)
                  .send({
                    content: `**GG** <@!${message.author.id}>, you are now level **${user.level}**`,
                  })
                  .catch(() => { });
              } else {
                message.channel.send({
                  content: `**GG** <@!${message.author.id}>, you are now level **${user.level}**`,
                });
              }
            } catch {
              message.channel.send({
                content: `**GG** <@!${message.author.id}>, you are now level **${user.level}**`,
              });
            }
          }

          levelRewards.findOne(
            { Guild: message.guild.id, Level: user.level },
            async (err, data) => {
              if (data) {
                message.guild.members.cache
                  .get(message.author.id)
                  .roles.add(data.Role)
                  .catch((e) => { });
              }
            }
          );
        }
      }
    }
  });

  // Message tracker system
  messagesSchema.findOne(
    { Guild: message.guild.id, User: message.author.id },
    async (err, data) => {
      if (data) {
        data.Messages += 1;
        data.save();

        messageRewards.findOne(
          { Guild: message.guild.id, Messages: data.Messages },
          async (err, data) => {
            if (data) {
              try {
                message.guild.members.cache
                  .get(message.author.id)
                  .roles.add(data.Role);
              } catch { }
            }
          }
        );
      } else {
        new messagesSchema({
          Guild: message.guild.id,
          User: message.author.id,
          Messages: 1,
        }).save();
      }
    }
  );

  // AFK system
  afk.findOne(
    { Guild: message.guild.id, User: message.author.id },
    async (err, data) => {
      if (data) {
        await afk.deleteOne({
          Guild: message.guild.id,
          User: message.author.id,
        });

        client
          .simpleEmbed(
            {
              desc: `${message.author} is no longer afk!`,
            },
            message.channel
          )
          .then(async (m) => {
            setTimeout(() => {
              m.delete();
            }, 5000);
          });

        if (message.member.displayName.startsWith(`[AFK] `)) {
          let name = message.member.displayName.replace(`[AFK] `, ``);
          message.member.setNickname(name).catch((e) => { });
        }
      }
    }
  );

  message.mentions.users.forEach(async (u) => {
    if (
      !message.content.includes("@here") &&
      !message.content.includes("@everyone")
    ) {
      afk.findOne(
        { Guild: message.guild.id, User: u.id },
        async (err, data) => {
          if (data) {
            client.simpleEmbed(
              { desc: `${u} is currently afk! **Reason:** ${data.Message}` },
              message.channel
            );
          }
        }
      );
    }
  });

  // Chat bot
  chatBotSchema.findOne({ Guild: message.guild.id }, async (err, data) => {
    if (!data) return;
    if (message.channel.id !== data.Channel) return;
    if (process.env.OPENAI) {
      fetch(
        `https://api.openai.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.OPENAI,
          },
          body: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [{
              'role': 'user',
              'content': message.content
            }]
          })
        }
      )
        .catch(() => {
        })
        .then((res) => {
          res.json().then((data) => {
            if(data.error) return;
            message.reply({ content: data.choices[0].message.content });
          });
        });
    } else {
      try {
        const input = message;
        try {
          fetch(
            `https://api.coreware.nl/fun/chat?msg=${encodeURIComponent(input)}&uid=${message.author.id}`,
          )
            .catch(() => { console.log })
            .then((res) => res.json())
            .catch(() => { console.log})
            .then(async (json) => {
              console.log(json);
              if (json) {
                if (
                  json.response !== " " ||
                  json.response !== undefined ||
                  json.response !== "" ||
                  json.response !== null
                ) {
                  try {
                    return message
                      .reply({ content: json.response })
                      .catch(() => { });
                  } catch { }
                }
              }
            })
            .catch(() => { });
        } catch { }
      } catch { }
    }
  });

  // Sticky messages
  try {
    Schema.findOne(
      { Guild: message.guild.id, Channel: message.channel.id },
      async (err, data) => {
        if (!data) return;

        const lastStickyMessage = await message.channel.messages
          .fetch(data.LastMessage)
          .catch(() => { });
        if (!lastStickyMessage) return;
        await lastStickyMessage.delete({ timeout: 1000 });

        const newMessage = await client.simpleEmbed(
          { desc: `${data.Content}` },
          message.channel
        );

        data.LastMessage = newMessage.id;
        data.save();
      }
    );
  } catch { }

  // Prefix
  var guildSettings = await Functions.findOne({ Guild: message.guild.id });
  if (!guildSettings) {
    new Functions({
      Guild: message.guild.id,
      Prefix: client.config.discord.prefix,
    }).save();

    guildSettings = await Functions.findOne({ Guild: message.guild.id });
  }

  if (!guildSettings || !guildSettings.Prefix) {
    Functions.findOne({ Guild: message.guild.id }, async (err, data) => {
      data.Prefix = client.config.discord.prefix;
      data.save();
    });

    guildSettings = await Functions.findOne({ Guild: message.guild.id });
  }

  if (!guildSettings || !guildSettings.Prefix) {
    var prefix = client.config.Discord.prefix;
  } else {
    var prefix = guildSettings.Prefix;
  }

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`
  );

  if (!prefixRegex.test(message.content.toLowerCase())) return;
  const [, matchedPrefix] = message.content.toLowerCase().match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (
    message.mentions.users.first() &&
    message.mentions.users.first().id == client.user.id &&
    command.length === 0
  ) {
    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setLabel("Invite")
        .setURL(
          client.config.discord.botInvite
        )
        .setStyle(Discord.ButtonStyle.Link),

      new Discord.ButtonBuilder()
        .setLabel("Support server")
        .setURL(client.config.discord.serverInvite)
        .setStyle(Discord.ButtonStyle.Link)
    );

    client
      .embed(
        {
          title: "Hi, i'm Bot",
          desc: `Use with commands via Discord ${client.emotes.normal.slash} commands`,
          fields: [
            {
              name: "📨┆Invite me",
              value: `Invite Bot in your own server! [Click here](${client.config.discord.botInvite})`,
            },
            {
              name: "❓┇I don't see any slash commands",
              value:
                "The bot may not have permissions for this. Open the invite link again and select your server. The bot then gets the correct permissions",
            },
            {
              name: "❓┆Need support?",
              value: `For questions you can join our [support server](${client.config.discord.serverInvite})!`,
            },
            {
              name: "🐞┆Found a bug?",
              value: `Report all bugs via: \`/report bug\`!`,
            },
          ],
          components: [row],
        },
        message.channel
      )
      .catch(() => { });
  }

  const cmd = await Commands.findOne({
    Guild: message.guild.id,
    Name: command,
  });
  if (cmd) {
    return message.channel.send({ content: cmdx.Responce });
  }

  const cmdx = await CommandsSchema.findOne({
    Guild: message.guild.id,
    Name: command,
  });
  if (cmdx) {
    if (cmdx.Action == "Normal") {
      return message.channel.send({ content: cmdx.Responce });
    } else if (cmdx.Action == "Embed") {
      return client.simpleEmbed(
        {
          desc: `${cmdx.Responce}`,
        },
        message.channel
      );
    } else if (cmdx.Action == "DM") {
      return message.author.send({ content: cmdx.Responce }).catch((e) => {
        client.errNormal(
          {
            error: "I can't DM you, maybe you have DM turned off!",
          },
          message.channel
        );
      });
    }
  }
};


