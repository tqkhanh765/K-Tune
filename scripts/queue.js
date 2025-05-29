class Queue {
    constructor(size = 100) {
      this.maxSize = size;
      this.queArray = new Array(size);
      this.front = 0;
      this.rear = -1;
      this.nItems = 0;
    }
  
    insert(item) {
      if (this.rear === this.maxSize - 1) {
        this.rear = -1; // wraparound
      }
      this.queArray[++this.rear] = item;
      this.nItems++;
    }
  
    remove() {
      const temp = this.queArray[this.front++];
      if (this.front === this.maxSize) {
        this.front = 0; // wraparound
      }
      this.nItems--;
      return temp;
    }
  
    peekFront() {
      return this.queArray[this.front];
    }
  
    isEmpty() {
      return this.nItems === 0;
    }
  
    isFull() {
      return this.nItems === this.maxSize;
    }
  
    size() {
      return this.nItems;
    }

    insertFront(item) {
        if (this.isFull()) {
          throw new Error("Queue is full");
        }
        // Move front backward with wraparound
        this.front = (this.front - 1 + this.maxSize) % this.maxSize;
        this.queArray[this.front] = item;
        this.nItems++;
    }
    
    removeAt(index) {
        if (index < 0 || index >= this.nItems) {
          throw new Error("Index out of bounds");
        }
    
        const realIndex = (this.front + index) % this.maxSize;
        const removedItem = this.queArray[realIndex];
    
        // Shift elements to fill the gap
        for (let i = index; i < this.nItems - 1; i++) {
          const from = (this.front + i + 1) % this.maxSize;
          const to = (this.front + i) % this.maxSize;
          this.queArray[to] = this.queArray[from];
        }
    
        // Adjust rear with wraparound
        this.rear = (this.rear - 1 + this.maxSize) % this.maxSize;
        this.nItems--;
    
        return removedItem;
    }
    toArray() {
        const result = [];
        for (let i = 0; i < this.nItems; i++) {
          const index = (this.front + i) % this.maxSize;
          result.push(this.queArray[index]);
        }
        return result;
    }
  }

export { Queue };