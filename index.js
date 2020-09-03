const Discord      = require("discord.js");
const TagChannels  = require("./tagchannels.js");
const UserProfiles = require("./profiles.js");
const SingleWrite  = require("./singlewritechannel.js");
const botconfig    = require("./botconfig.json");
const bot          = new Discord.Client();
const tagChannels  = new TagChannels.Channels();
const profiles     = new UserProfiles.Profiles();


tagChannels.addChannel(
  name         = "feedback",
  id           = "749613262135361557",
  embedColor   = "#3a9be0",
  titleMessage = (username = "Anonym") =>  ("Feedback von " + (username)  + ":") // "??" operator needs node v14
);

tagChannels.addChannel(
  name         = "spielvorschlaege",
  id           = "749613506084470844",
  embedColor   = "#e65755",
  titleMessage = (username = "Anonym") => ((username) + " schlägt vor:")
);

tagChannels.addChannel(
  name         = "wunschbrunnen",
  id           = "749613571113222214",
  embedColor   = "#7775ca",
  titleMessage = (username = "Anonym") => ((username) + " wünscht sich folgendes:")
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

//  let chan = bot.channels.cache.get("749613262135361557");

 // chan.send("_Hier könnte dein Feedback stehen!_\nUm Feedback dazulassen, musst du eine Nachricht schreiben, die mit \"#feedback\" beginnt.");

});

/*
 * Message handling
 * */
bot.on("message", async message => {

  if (message.author.bot) return; //  prevent feedbacks

  checkInSingleWrite.checkAndNotify(message);

  profiles.sendMatchesIfProfileMessage(message, checkIn.testid, bot);

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
