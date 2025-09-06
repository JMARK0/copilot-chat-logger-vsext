// src/CircularBuffer.ts
export class CircularBuffer<T> {
    private buffer: (T | undefined)[];
    private head: number = 0;
    private tail: number = 0;
    private count: number = 0;
    private readonly capacity: number;

    constructor(capacity: number) {
        if (capacity <= 0) {
            throw new Error('Capacity must be greater than 0');
        }
        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }

    /**
     * Add an item to the buffer. If buffer is full, overwrites the oldest item.
     */
    push(item: T): void {
        this.buffer[this.head] = item;

        if (this.count < this.capacity) {
            this.count++;
        } else {
            // Buffer is full, move tail forward (overwrite oldest)
            this.tail = (this.tail + 1) % this.capacity;
        }

        this.head = (this.head + 1) % this.capacity;
    }

    /**
     * Get all items in the buffer (from oldest to newest)
     */
    getAll(): T[] {
        if (this.count === 0) {
            return [];
        }

        const result: T[] = [];
        let index = this.tail;

        for (let i = 0; i < this.count; i++) {
            const item = this.buffer[index];
            if (item !== undefined) {
                result.push(item);
            }
            index = (index + 1) % this.capacity;
        }

        return result;
    }

    /**
     * Get the current size of the buffer
     */
    size(): number {
        return this.count;
    }

    /**
     * Check if buffer is full
     */
    isFull(): boolean {
        return this.count === this.capacity;
    }

    /**
     * Clear all items from the buffer
     */
    clear(): void {
        this.buffer = new Array(this.capacity);
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    /**
     * Get most recent items (up to n items)
     */
    getRecent(n: number): T[] {
        const allItems = this.getAll();
        return allItems.slice(-n);
    }

    /**
     * Export buffer contents to JSON string
     */
    toJSON(): string {
        return JSON.stringify({
            items: this.getAll(),
            metadata: {
                capacity: this.capacity,
                currentSize: this.count,
                isFull: this.isFull(),
                timestamp: new Date().toISOString()
            }
        }, null, 2);
    }
}