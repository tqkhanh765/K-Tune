class Stack {
    constructor(size = 100) {
      this.maxSize = size;
      this.stackArray = new Array(size);
      this.top = -1;
    }
  
    push(item) {
      this.stackArray[++this.top] = item;
    }
  
    pop() {
      return this.stackArray[this.top--];
    }
  
    peek() {
      return this.stackArray[this.top];
    }
  
    isEmpty() {
      return this.top === -1;
    }
  
    isFull() {
      return this.top === this.maxSize - 1;
    }
    
    size() {
      return this.top + 1;
    }
}

export { Stack };
