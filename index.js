const Discord   = require("discord.js");
const bot       = new Discord.Client();
const botconfig = require("./botconfig.json");

/*
 * Server specifics and variables
 * */
const channels = {

  chatChannels: {
    schwarzesBrett: {
      id: "749376233631907931",
    },

    huehnerhof: {
      id: "749390915902374040",
    },
  },

  tagChannels: {

    feedback: {
      id: "749613262135361557",
      embedColor: "#3a9be0",

      titleMessage: function (userName = "Anonym") {
        return "Feedback von " + userName;
      },
    },

    spielvorschlaege: {
      id: "749613506084470844",
      embedColor: "#e65755",

      titleMessage: function (userName = "Anonym") {
        return userName + " schlägt vor:";
      },
    },

    wunschbrunnen: {
      id: "749613571113222214",
      embedColor: "#E69E35",

      titleMessage: function (userName = "Anonym") {
        return userName + " wünscht sich folgendes:";
      },
    },
  },
}

/*
 * Bot login
 * */
bot.login(botconfig.token);

bot.on("ready", async () => {
  console.log(bot.user.username + ' is online!');
  bot.user.setActivity(botconfig.botActivity);
});

/*
 * Message handling
 * */
bot.on("message", async message => {

  if (message.author.bot) return; //  prevent feedbacks

  sendEmbedIfSuggestion(message);

  /*
   * Bot commands
   * */
  if (message.content.indexOf(botconfig.prefix) !== 0) return;

  const args = message.content.slice(botconfig.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  switch ( command ) {

    case "say":

      const sayMessage = args.join(" ");
      message.delete().catch(O_o => {});
      message.channel.send(sayMessage);

      break;

    default: message.channel.send("Command not found...");
    break;

} 
});

/*
 * Functions
 **/
function separateIdAndContent (str) {

  let idString = str.split(" ")[0];

  return {
    id: idString.slice(2, idString.length-1),
    content: str.replace(idString, "")
  };

}

function idIsTagChannelId (potentialId) {

  for (let key in channels.tagChannels) {
    if (channels.tagChannels[key]?.id == potentialId) return true;
  }

  return false;

}

function createEmbedFromChannelId (id, author, thumbnail, content) {

  let embedColor = "#FFFFFF";
  let titleMessage = "";

  for (let key in channels.tagChannels) {
    if (channels.tagChannels[key]?.id == id) {
      embedColor   = channels.tagChannels[key].embedColor;
      titleMessage = channels.tagChannels[key].titleMessage(author);
    }
  }

  return new Discord.MessageEmbed()
    .setColor(embedColor)
    .setTitle(titleMessage)
    .setDescription(content)
    .setThumbnail(thumbnail);

}

function sendEmbedIfSuggestion (message) {

  splitMessage = separateIdAndContent(message.content);

  if (!idIsTagChannelId(splitMessage.id)) return;
  if (splitMessage.content === "") return;

  let embed = createEmbedFromChannelId(splitMessage.id,
                                       message.author.username,
                                       message.author.avatarURL(),
                                       splitMessage.content);

  bot.channels.cache.get(splitMessage.id).send(embed);

}
