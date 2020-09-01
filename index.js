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

let checkIn = { // remove
  id:     "749368247656382489",
  testid: "749611153730306120"
};

function Profile (user, description) {
  this.user        = user;
  this.description = description;
}

let profiles = {

  addProfile: function (profile) {
    if (!(profile instanceof Profile)) return;
    this[profile.user.username] = profile;
    return profile;
  },

  findMatches: function (profile) {

    let matches = [];
    for (key in this) {

      if (!(this[key] instanceof Profile)) continue;
      if (!(profile instanceof Profile)) continue;

      if(this[key].user == profile.user) continue;

      for (let item of profile.description) {

        if ( this[key].description.includes( item ) ) {
          matches.push(this[key].user);
        }
      }
    }
    return matches;
  },

  matchMessage: function (sourceUser, matchedUsers) {

    if (sourceUser == undefined) return null;

    let numOfMatches = matchedUsers.length;
    if (numOfMatches < 1) return null;

    let message = mention(sourceUser) + " hat etwas gemeinsam mit ";

    matchedUsers.forEach( (user, index) => {

      if (numOfMatches > 1 && index == numOfMatches-1) {
        message = message.slice(0, message.lastIndexOf(",")) + " und " + mention(user);
      } else {
        message += mention(user) + ", "
      }

    });

    return message;
  },
};

/*
 * Bot login
 * */
bot.login(botconfig.token);

bot.on("ready", async () => {

  console.log(bot.user.username + " is online!");
  bot.user.setActivity("Space Invaders 🚀");

  initializeExistingProfiles();

});

/*
 * Message handling
 * */
bot.on("message", async message => {

  if (message.author.bot) return; //  prevent feedbacks

  sendEmbedIfTagged(message);

  sendMatchesIfProfileMessage(message);

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

    case "match":

    for (let key in profiles) {

      let profile = profiles[key];
      let matches = profiles.findMatch(profile);

      message.channel.send(profiles.matchMessage(profile.user, matches));

    }

    break;

    default: message.channel.send("Command not found...");
    break;

} 
});


/*
 * Functions for moving tagged messages
 * */
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

/*
 * Functions for profile creation from profiling message
 * */
function sendMatchesIfProfileMessage (message) {

  if (message.channel == bot.channels.cache.get(checkIn.id)) {

    let profile = profiles.addProfile(generateProfileFromMessage(message));
    let matches = profiles.findMatches(profile);
    let matchMessage = profiles.matchMessage(profile?.user, matches);

    if (matchMessage) {
      message.channel.send(matchMessage);
    }
  }
}

function initializeExistingProfiles() {

  let checkInChannel = bot.channels.cache.get(checkIn.id);

  let messages = checkInChannel.messages.fetch().then( messages => {

    let mapped = messages.map( message => {
      return {
        content: message.content.toLowerCase().split("*").join(""),
        author:  message.author
      }
    });

    let filtered = mapped.filter( m => {
      return m.content.startsWith("steck") || m.content.startsWith("nick");
    });

    for (let item of filtered) {
      profiles.addProfile(generateProfileFromMessage(item));
    }

  });

}

function generateProfileFromMessage (message) {

  let splitContent = message.content
      .split(" ").join("")
      .split("\n")
      .filter( item => item.includes(":"));

  splitContent.forEach((item, index, arr) => {
    arr[index] = item.slice(item.indexOf(":") + 1);
  });

  if (splitContent === undefined || splitContent.length == 0) return;

  formatEmojisInContent(splitContent);

  return new Profile (message.author, splitContent);

}

function formatEmojisInContent(contentArray) {
  let emojiArray = emojiStringToArray(contentArray[contentArray.length-1]);
  contentArray.pop();
  for (let emoji of emojiArray) {
    contentArray.push(emoji);
  }
}

function emojiStringToArray (str) {

  let split = str.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
  let arr = [];

  for (var i=0; i<split.length; i++) {
    char = split[i]
    if (char !== "") {
      arr.push(char);
    }
  }

  return arr;
}

function mention (user) {
  return "<@" + user.id + ">";
}
