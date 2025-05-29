class Stack {
    constructor(size = 100) {
      this.maxSize = size;                 // set stack size
      this.stackArray = new Array(size);  // create the array
      this.top = -1;                       // no items yet
    }
  
    push(item) {
      this.stackArray[++this.top] = item; // increment top and insert item
    }
  
    pop() {
      return this.stackArray[this.top--]; // return item and decrement top
    }
  
    peek() {
      return this.stackArray[this.top];   // return top item without removing it
    }
  
    isEmpty() {
      return this.top === -1;             // true if stack is empty
    }
  
    isFull() {
      return this.top === this.maxSize - 1; // true if stack is full
    }
    size() {
      return this.top + 1;  // since top starts at -1, size is top+1
  }
  }

export { Stack };
