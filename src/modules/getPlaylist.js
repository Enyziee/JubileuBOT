module.exports = function getGuildQueue(client, guildId) {
    if (client.guildsPlaylists.get(guildId) == undefined) {
        const playlist = new Queue();
        client.guildsPlaylists.set(guildId, playlist);
    }

    return client.guildsPlaylists.get(guildId);
}