module.exports = class Queue {
    constructor() {
        this.songs = [];
        this.current = null;
    }

    isEmpty() {
        return this.songs.length === 0;
    }

    enqueue(song) {
        this.songs.push(song);

    }

    dequeue() {
        const returnSong = this.songs.shift();
        this.current = returnSong;
        return returnSong;
    }

    getSongs() {
        return this.songs;
    }
};

