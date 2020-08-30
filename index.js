const Discord   = require("discord.js");
const bot       = new Discord.Client();
const botconfig = require("./botconfig.json");

/*
 * Server specifics and variables
 * */

const ids = {
  users: {
    ownerId: botconfig.ownerID,
  },
};

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
      embedColor: "#FF00FF",
    },

    spielvorschlaege: {
      id: "749613506084470844",
      embedColor: "#FF00FF",
    },

    wunschbrunnen: {
      id: "749613571113222214",
      embedColor: "#FF00FF",
    },
  }
}

/*
 * Bot login
 * */

bot.login(botconfig.token);

bot.on("ready", async () => {
  console.log(bot.user.username + ' is online!');
  bot.user.setActivity("");
});


/*
 * Message handling
 * */

bot.on("message", async message => {


  if (message.author.bot) return; //  prevent feedbacks

  sendEmbedIfSuggestion(message.content);

  /*
   * Bot commands
   * */

  if (message.content.indexOf(botconfig.prefix) !== 0) return;

  const args    = message.content.slice(botconfig.prefix.length).trim().split(/ +/g);

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

function separateIdAndContent (message) {

  let idString = message.split(" ")[0];

  return {id: idString.slice(2, idString.length-1), content: message.replace(idString, "")};

}

function idIsTagChannelId (potentialId) {

  for (key in channels.tagChannels) {
    if (channels.tagChannels[key]?.id == potentialId) return true;
  }

  return false;

}

function createEmbedFromChannelId (id, content) {

  let embedColor = "#FFFFFF";

  for (key in channels.tagChannels) {
    if (channels.tagChannels[key]?.id == id) {
      embedColor = channels.tagChannels[key].embedColor;
    }
  }

  return new Discord.MessageEmbed().setColor(embedColor).setDescription(content);

}

function sendEmbedIfSuggestion (message) {

  splitMessage = separateIdAndContent(message);

  if (!idIsTagChannelId(splitMessage.id)) return;
  if (splitMessage.content === "") return;

  let embed = createEmbedFromChannelId(splitMessage.id, splitMessage.content);

  bot.channels.cache.get(splitMessage.id).send(embed);

}
