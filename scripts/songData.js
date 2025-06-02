import { Trie } from './trie.js';

export let songs = [];

const artistMap = {
    "Butterfly": "BTS",
    "Clap": "SEVENTEEN",
    "Downpour": "I.O.I",
    "Energetic": "WannaOne",
    "Feel the POP": "ZEROBASEONE",
    "Fiesta": "IZ*ONE",
    "Gone": "ROSÉ",
    "Gnarly - Clean Edit": "KATSEYE",
    "Hurt": "NewJeans",
    "Kill This Love": "BLACKPINK",
    "Left and Right": "Charlie Puth ft. Jung Kook",
    "Love Lee": "AKMU",
    "Love wins all": "IU ft. BTS V",
    "Magnetic": "ILLIT",
    "Maze in the mirror": "TXT",
    "Me Gustas Tu": "GFRIEND",
    "Missing You": "BTOB",
    "ONLY": "LeeHi",
    "Polaroid Love": "ENHYPEN",
    "Still With You": "Jung Kook",
    "Summer Rain": "GFRIEND"
};

export let songTrie = null;

// Load songs from the music directory
export function loadSongsFromDirectory() {
    const musicFiles = [
        "Butterfly.mp3",
        "Clap.mp3",
        "Downpour.mp3",
        "Energetic.mp3",
        "Feel the POP.mp3",
        "Fiesta.mp3",
        "Gone.mp3",
        "Gnarly - Clean Edit.mp3",
        "Hurt.mp3",
        "Kill This Love.mp3",
        "Left and Right.mp3",
        "Love Lee.mp3",
        "Love wins all.mp3",
        "Magnetic.mp3",
        "Maze in the mirror.mp3",
        "Me Gustas Tu.mp3",
        "Missing You.mp3",
        "ONLY.mp3",
        "Polaroid Love.mp3",
        "Still With You.mp3",
        "Summer Rain.mp3"
    ];

    // Process each music file
    songs = musicFiles.map(file => {
        const title = file.replace(".mp3", "");
        const artist = artistMap[title] || "Unknown Artist";


        return {
            title: title,
            artist: artist,
            file: `/assets/music/${encodeURIComponent(file)}`,
            cover: `/assets/images/covers/${encodeURIComponent(title)}.jpg`
        };
    });

    // Create a Trie for searching
    songTrie = new Trie();
    songs.forEach((song, idx) => {
        songTrie.insert(song.title, idx);
        songTrie.insert(song.artist, idx);
    });
}