const Discord   = require("discord.js");
const botconfig = require("./botconfig.json");
const bot       = new Discord.Client();

/*
 * Server specifics
 * */
function TagChannel (name, id, embedColor, titleMessage)  {
  this.name         = name;
  this.id           = id;
  this.embedColor   = embedColor;
  this.titleMessage = titleMessage;
};

TagChannel.prototype.createEmbed = function (author, content, thumbnail="") {
  return new Discord.MessageEmbed()
    .setColor(this.embedColor)
    .setTitle(this.titleMessage(author))
    .setDescription(content)
    .setThumbnail(thumbnail);
};

let tagChannels = {

  addChannel: function (name, id, embedColor, titleMessage) {
    this[name] = new TagChannel(name, id, embedColor, titleMessage);
  },

  getChannelById: function (id) {
    for (let key in this) {
      if (this[key]?.id == id) return this[key];
    }
    return null;
  },
};

tagChannels.addChannel(
  name         = "feedback",
  id           = "749613262135361557",
  embedColor   = "#3a9be0",
  titleMessage = (username) =>  ("Feedback von " + (username ?? "Anonym") + ":")
);

tagChannels.addChannel(
  name         = "spielvorschlaege",
  id           = "749613506084470844",
  embedColor   = "#e65755",
  titleMessage = (username) => ((username ?? "Anonym") + " schlägt vor:")
);

tagChannels.addChannel(
  name         = "wunschbrunnen",
  id           = "749613571113222214",
  embedColor   = "#7775ca",
  titleMessage = (username) => ((username ?? "Anonym") + " wünscht sich folgendes:")
);


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

  sendEmbedIfTagged(message);

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

  if (str.charAt(0) !== "<") return null;

  let idString = str.split(" ")[0];
  let id = idString.slice(2, idString.length-1);

  if (isNaN(id)) return null;

  return {
    id:      id,
    content: str.replace(idString, "")
  };

}

function sendEmbedIfTagged (message) {

  let splitMessage = separateIdAndContent(message.content);
  if (splitMessage == null || splitMessage.content === "") return;

  let channel = tagChannels.getChannelById(splitMessage.id);
  if (channel == null) return;

  let embed = channel.createEmbed(message.author.username,
                                  splitMessage.content,
                                  message.author.avatarURL()
                                 );

  bot.channels.cache.get(splitMessage.id).send(embed);

}
