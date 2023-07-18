export default class Queue {
    queue: Array<string>;
    constructor() {
        this.queue = [];
    }

    enqueue(item: string) {
        this.queue.push(item);
    }

    dequeue() {
        if (this.queue.length < 1) {
            return undefined;
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

    clear() {
        this.queue = [];
    }
}