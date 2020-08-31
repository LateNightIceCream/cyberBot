const Discord   = require("discord.js");
const botconfig = require("./botconfig.json");
const bot       = new Discord.Client();

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
    addChannel: function (name, id, embedColor, titleMessage) {
      this[name] = {
        id:           id,
        embedColor:   embedColor,
        titleMessage: titleMessage,

        createEmbed:  function (author="", content="", thumbnail="") {
          return new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setTitle(this.titleMessage(author))
            .setDescription(content)
            .setThumbnail(thumbnail);
        }
      };
    },

    getChannelById: function (id) {
      for (let key in this) {
        if (this[key]?.id == id) return this[key];
      }
      return null;
    },
  },
}

channels.tagChannels.addChannel(
  name         = "feedback",
  id           = "749613262135361557",
  embedColor   = "#3a9be0",
  titleMessage = (username) =>  ("Feedback von " + (username ?? "Anonym") + ":")
);

channels.tagChannels.addChannel(
  name         = "spielvorschlaege",
  id           = "749613506084470844",
  embedColor   = "#e65755",
  titleMessage = (username) => ((username ?? "Anonym") + " schlägt vor:")
);

channels.tagChannels.addChannel(
  name         = "wunschbrunnen",
  id           = "749613571113222214",
  embedColor   = "#7775ca",
  titleMessage = (username) => ((username ?? "Anonym") + " wünscht sich folgendes:")
);

channels.tagChannels["wunschbrunnen"].titleMessage("uwu");


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
    id:      idString.slice(2, idString.length-1),
    content: str.replace(idString, "")
  };

}

function sendEmbedIfSuggestion (message) {

  let splitMessage = separateIdAndContent(message.content);

  let channel = channels.tagChannels.getChannelById(splitMessage.id);

  if (channel == null) return;
  if (splitMessage.content === "") return;

  let embed = channel.createEmbed(message.author.username,
                                  splitMessage.content,
                                  message.author.avatarURL()
                                 );

  bot.channels.cache.get(splitMessage.id).send(embed);

}
