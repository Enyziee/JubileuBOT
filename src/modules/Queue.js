module.exports = class Queue {
    constructor() {
        this.songs = [];
        this.current = null;
    }

    isEmpty() {
        return this.current == null;
    }

    enqueue(song) {
        this.songs.push(song);

    }

    dequeue() {
        const returnSong = this.songs.shift();
        this.current = returnSong;
        return returnSong;
    }
};

