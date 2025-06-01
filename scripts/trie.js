class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.songIndexes = new Set();
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, songIndex) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) node.children[char] = new TrieNode();
            node = node.children[char];
            node.songIndexes.add(songIndex);
        }
        node.isEndOfWord = true;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!node.children[char]) return new Set();
            node = node.children[char];
        }
        return node.songIndexes;
    }
}

export { Trie };