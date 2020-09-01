
function Profiles () {
}

Profiles.prototype.Profile = function (user, description) {
    this.user        = user;
    this.description = description;
};

Profiles.prototype.addProfile = function (profile) {
    if (!(profile instanceof this.Profile)) return;
    this[profile.user.username] = profile;
    return profile;
};

Profiles.prototype.findMatches = function (profile) {

    let matches = [];
    for (key in this) {

      if (!(this[key] instanceof this.Profile)) continue;
      if (!(profile instanceof this.Profile)) continue;

      if(this[key].user == profile.user) continue;

      for (let item of profile.description) {

        if ( this[key].description.includes( item ) ) {
          matches.push(this[key].user);
        }
      }
    }
    return matches;
};

Profiles.prototype.matchMessage = function (sourceUser, matchedUsers) {

    if (sourceUser == undefined) return null;

    let numOfMatches = matchedUsers.length;
    if (numOfMatches < 1) return null;

    let message = mention(sourceUser) + ", du hast etwas gemeinsam mit ";

    matchedUsers.forEach( (user, index) => {

      if (numOfMatches > 1 && index == numOfMatches-1) {
        message = message.slice(0, message.lastIndexOf(",")) + " und " + mention(user) + "!";
      } else {
        message += mention(user) + ", "
      }

    });

    return message;
};

Profiles.prototype.generateProfileFromMessage = function (message) {

  let splitContent = message.content
      .split(" ").join("")
      .split("\n")
      .filter( item => item.includes(":"));

  splitContent.forEach((item, index, arr) => {
    arr[index] = item.slice(item.indexOf(":") + 1);
  });

  if (splitContent === undefined || splitContent.length == 0) return;

  formatEmojisInContent(splitContent);

  return new this.Profile (message.author, splitContent);

};

Profiles.prototype.initializeExistingProfiles = function (channelId, bot) {

  let checkInChannel = bot.channels.cache.get(channelId);

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
      this.addProfile(this.generateProfileFromMessage(item));
    }

  });
};

Profiles.prototype.sendMatchesIfProfileMessage = function (message, channelId, bot) {

  if (message.channel == bot.channels.cache.get(channelId)) {

    let profile = this.addProfile(this.generateProfileFromMessage(message));
    let matches = this.findMatches(profile);
    let matchMessage = this.matchMessage(profile?.user, matches);

    if (matchMessage) {
      message.channel.send(matchMessage);
    }
  }
};


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

/*----------------------------*/
module.exports = {Profiles};
