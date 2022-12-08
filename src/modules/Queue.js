module.exports = class Queue {
    constructor() {
        this.queue = [];
    }

    enqueue(item) {
        this.queue.push(item);
    }

    dequeue() {
        if (this.queue.length < 1) {
            return null;
        }
        return this.queue.shift();
    }

    display() {
        return this.queue.values();
    }

    size() {
        return this.queue.length;
    }

    isEmpty() {
        return this.size() < 1;
    }
};