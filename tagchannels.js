const Discord = require("discord.js");

function Channels () {
}

Channels.prototype.Channel = function (name, id, embedColor, titleMessage) {
    this.name       = name;
    this.id         = id;
    this.embedColor = embedColor;
    this.titleMessage = titleMessage;
}

Channels.prototype.addChannel = function (name, id, embedColor, titleMessage) {
    this[name] = new this.Channel(name, id, embedColor, titleMessage);
}

Channels.prototype.getChannelById = function (id) {
    for (let key in this) {
        if (this[key].id == id) return this[key];
    }
    return null;
}

Channels.prototype.Channel.prototype.createEmbed = function (author, content, thumbnailURL) {
    return new Discord.MessageEmbed()
        .setColor(this.embedColor)
        .setTitle(this.titleMessage instanceof Function ? this.titleMessage(author) : this.titleMessage)
        .setDescription(content)
        .setThumbnail(thumbnailURL)
}

Channels.prototype.sendEmbedIfTagged = function (message, bot) {

    let splitMessage = separateIdAndContent (message.content);
    if (splitMessage == null || splitMessage === "") return null;

    let channel = this.getChannelById(splitMessage.id);
    if (channel == null) return null;

    let embed = channel.createEmbed(
        message.author.username,
        splitMessage.content,
        message.author.avatarURL()
    );

    bot.channels.cache.get(splitMessage.id).send(embed);
}


function separateIdAndContent (str) {
    if (str.charAt(0) !== "<") return null;

    let idString = str.split(" ")[0];
    let id = idString.slice(2, idString.length - 1);

    if (isNaN(id)) return null;

    return {
        id      : id,
        content : str.replace(idString, "")
    };
}


module.exports = {Channels};
