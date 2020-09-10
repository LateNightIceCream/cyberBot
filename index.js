const Discord      = require("discord.js");
const TagChannels  = require("./tagchannels.js");
const UserProfiles = require("./profiles.js");
const SingleWrite  = require("./singlewritechannel.js");
const botconfig    = require("./botconfig.json");
const bot          = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const tagChannels  = new TagChannels.Channels();
const profiles     = new UserProfiles.Profiles();


tagChannels.addChannel(
  name         = "feedback",
  id           = "749613262135361557",
  embedColor   = "#3a9be0",
  titleMessage = (username) =>  ("Feedback von " + (username ?? "Anonym")  + ":") // "??" operator needs node v14
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

let checkIn = { // remove?
  id:     "749368247656382489",
  testid: "749611153730306120",

  approvedRoleIds: [
    "749370811001077881",
    "749371713547927564"
  ],
  moderatorIds: [
    "749370296502583357"
  ],
};


const checkInSingleWrite =  new SingleWrite.SingleWriteChannel(checkIn.id, bot, checkIn.moderatorIds, checkIn.approvedRoleIds);

/*
 * Bot login
 * */
bot.login(botconfig.token);

bot.on("ready", async () => {

  console.log(bot.user.username + " is online!");
  bot.user.setActivity("Space Invaders 🚀");

  profiles.initializeExistingProfiles(checkIn.id, bot);
  checkInSingleWrite.initializeChannelMessages();

});

bot.on('messageReactionAdd', async (reaction, user) => {
  // When we receive a reaction we check if the reaction is partial or not
  if (reaction.partial) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Something went wrong when fetching the message: ', error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  if (reaction.emoji.id == "750036575026675814" && reaction.count == 4 ) {
    reaction.message.channel.send("**" + reaction.message.author.username + "**" + " ist sehr **horny**!");
  }

});


/*
 * Message handling
 * */
bot.on("message", async message => {

  if (message.author.bot) return; //  prevent feedbacks

  checkInSingleWrite.checkAndNotify(message);

  profiles.sendMatchesIfProfileMessage(message, checkIn.id, bot);

  tagChannels.sendEmbedIfTagged(message, bot);

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
