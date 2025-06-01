// Song data array - will be populated from music directory
let songs = [];

// Function to load songs from the music directory
function loadSongsFromDirectory() {
    // Get all music files from the directory
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
    
    // Map of known artists for these songs
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
    
    // Process each music file
    songs = musicFiles.map(file => {
        // Remove the file extension
        const title = file.replace(".mp3", "");
        // Get artist from the map or use "Unknown Artist" as fallback
        const artist = artistMap[title] || "Unknown Artist";
        
        return {
            title: title,
            artist: artist,
            file: `/assets/music/${encodeURIComponent(file)}`,
            cover: `/assets/images/covers/${encodeURIComponent(title)}.jpg`
        };
    });

    songTrie = new Trie();
    songs.forEach((song, idx) => {
        songTrie.insert(song.title, idx);
        songTrie.insert(song.artist, idx);
    });
}

import { Queue } from './queue.js';
import { Stack } from './stack.js';
import { Trie } from './trie.js';

// Song playback data structures
let isAscending = true;
let currentSong = null;  // Currently playing song
let playingQueue = new Queue();
let playHistory = new Stack();
let songTrie = null;

// Original songs array (unsorted)
let originalSongs = [];

// Filtered songs for search functionality
let filteredSongs = [];

// Function to load songs into the playlist
function loadSongs(songsToLoad = songs) {
    const songList = document.querySelector('.song-list');
    
    // Clear existing content
    songList.innerHTML = '';
    
    // If this is the first load, save the original order
    if (originalSongs.length === 0 && songs.length > 0) {
        originalSongs = [...songs];
    }
    
    // Display message if no songs found
    if (songsToLoad.length === 0) {
        const noSongsMsg = document.createElement('div');
        noSongsMsg.className = 'no-songs-message';
        noSongsMsg.textContent = 'No songs found. Try a different search.';
        songList.appendChild(noSongsMsg);
        return;
    }
    
    // Add songs to the playlist
    songsToLoad.forEach((song, index) => {
        // Create song item for the main playlist
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
            songItem.classList.add('active');
        }
        songItem.dataset.index = index;
        
        // Create the song info container
        const songInfo = document.createElement('div');
        songInfo.className = 'song-info-container';
        songInfo.innerHTML = `
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;
        
        // Create the hover actions container (initially hidden)
        const hoverActions = document.createElement('div');
        hoverActions.className = 'hover-actions';
        hoverActions.innerHTML = `
            <button class="action-btn add-to-queue">Add</button>
        `;
        
        // Add the elements to the song item
        songItem.appendChild(songInfo);
        songItem.appendChild(hoverActions);
        
        // Add event listener for adding to queue
        songItem.querySelector('.add-to-queue').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the song item click event
            addToQueue(song);
            showNotification(`Added "${song.title}" to queue`);
        });
        
        // Add click event listener to play the song when clicked
        songItem.addEventListener('click', function() {
            playSong(song);
        });
        
        songList.appendChild(songItem);
    });
    
    // Update current song display if there is a current song
    if (currentSong) {
        updateCurrentSong();
    } else {
        // Clear the player if no song is playing
        clearPlayer();
    }
    
    // Load the upcoming list separately
    loadUpcomingList();
}

// Audio element for playing music
let audioPlayer = null;

// Function to clear the player when no song is playing
function clearPlayer() {
    document.querySelector('.current-song').textContent = 'Select a song';
    document.querySelector('.current-artist').textContent = 'from the playlist';
    
    // Clear album cover
    const albumCoverImg = document.getElementById('album-cover-img');
    albumCoverImg.src = '';
    albumCoverImg.alt = '♪';
    albumCoverImg.parentElement.style.fontSize = '48px';
    albumCoverImg.parentElement.style.color = '#8b4513';
    albumCoverImg.parentElement.innerHTML = '♪';
    
    // Reset progress bar
    document.querySelector('.progress').style.width = '0%';
    document.querySelectorAll('.time-info span')[0].textContent = '0:00';
    document.querySelectorAll('.time-info span')[1].textContent = '0:00';
    
    // Reset play button
    const playBtn = document.querySelector('.play-btn');
    playBtn.textContent = '▶';
    
    // Stop any audio playback
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
}

// Function to play a song
function playSong(song) {
    if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
        console.log('Same song already playing. Skipping re-play.');
        return;
    }

    console.log('Playing song:', song.title, 'by', song.artist);

    try {
        if (currentSong) {
            playHistory.push(currentSong);
        }

        currentSong = song;

        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('active');
        });

        document.querySelectorAll('.song-item').forEach(item => {
            const index = parseInt(item.dataset.index);
            if (
              index >= 0 && 
              index < songs.length && 
              songs[index] &&  // check existence
              songs[index].title === song.title && 
              songs[index].artist === song.artist
            ) {
                item.classList.add('active');
            }
        });

        updateCurrentSong();
        loadUpcomingList();

        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }

        audioPlayer = new Audio();
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNextFromQueue);

        audioPlayer.src = song.file;
        audioPlayer.load();

        document.querySelector('.play-btn').textContent = '⏸';

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playback started successfully');
            }).catch(error => {
                console.error('Error playing audio:', error);
                setTimeout(() => {
                    audioPlayer.play().catch(e => console.error('Retry failed:', e));
                }, 1000);
            });
        }
    } catch (error) {
        console.error('Error in playSong function:', error);
    }
}

// Function to add a song to the queue
function addToQueue(song) {
    if (!song || !song.title || !song.artist) {
        console.warn('Trying to add invalid song to queue:', song);
        return;
    }

    playingQueue.insert(song);
    showNotification(`"${song.title}" added to queue`);
    loadUpcomingList();
}

// Function to play the next song from the queue
function playNextFromQueue() {
    if (playingQueue.size() > 0) {
        // Get the next song from the queue
        const nextSong = playingQueue.remove();
        playSong(nextSong);
    } else if (currentSong) {
        // If queue is empty but we have a current song, just stop
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        document.querySelector('.play-btn').textContent = '▶';
    }
}

// Function to play the previous song from history
function playPreviousFromHistory() {
    if (playHistory.size() > 0) {
        // If current song is playing and has progressed, restart it
        if (audioPlayer && audioPlayer.currentTime > 5) {
            audioPlayer.currentTime = 0;
            return;
        }
        
        // Get the previous song from history
        const previousSong = playHistory.pop();
        
        // Add current song to the front of the queue
        if (currentSong) {
            playingQueue.insertFront(currentSong);
        }
        
        // Play the previous song without adding to history
        currentSong = previousSong;
        
        // Update UI and play
        updateCurrentSong();
        loadUpcomingList();
        
        if (audioPlayer) {
            audioPlayer.src = previousSong.file;
            audioPlayer.load();
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }
}

// Function to show a notification
function showNotification(message) {
    // Check if notification element exists
    let notification = document.querySelector('.notification');
    
    // Create if it doesn't exist
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Function to update current song display
function updateCurrentSong() {
    try {
        if (!currentSong) {
            clearPlayer();
            return;
        }
        
        document.querySelector('.current-song').textContent = currentSong.title;
        document.querySelector('.current-artist').textContent = currentSong.artist;
        
        // Update album cover image - using a completely different approach
        const albumArtDiv = document.querySelector('.album-art');
        if (albumArtDiv) {
            // Clear any existing content
            albumArtDiv.innerHTML = '';
            
            // Create a new image element
            const newImg = document.createElement('img');
            newImg.id = 'album-cover-img';
            newImg.alt = `${currentSong.title} by ${currentSong.artist}`;
            
            // Log the image path for debugging
            console.log('Attempting to load image from:', currentSong.cover);
            
            // Set up error handler before setting src
            newImg.onerror = function() {
                console.error('Failed to load image:', currentSong.cover);
                
                // Try direct path without URL encoding
                const directPath = `../assets/images/covers/${currentSong.title}.jpg`;
                console.log('Trying direct path:', directPath);
                
                // Try another alternative path
                const altPath = `../assets/images/${currentSong.title}.jpg`;
                console.log('Trying alternative path:', altPath);
                
                // Show fallback music note
                albumArtDiv.innerHTML = '<div class="fallback-cover">♪</div>';
                albumArtDiv.querySelector('.fallback-cover').style.fontSize = '48px';
                albumArtDiv.querySelector('.fallback-cover').style.color = '#8b4513';
                albumArtDiv.querySelector('.fallback-cover').style.display = 'flex';
                albumArtDiv.querySelector('.fallback-cover').style.justifyContent = 'center';
                albumArtDiv.querySelector('.fallback-cover').style.alignItems = 'center';
                albumArtDiv.querySelector('.fallback-cover').style.height = '100%';
            };
            
            // Set the source and append to the container
            newImg.src = currentSong.cover;
            albumArtDiv.appendChild(newImg);
        } else {
            console.warn('Album art container not found');
        }
    } catch (error) {
        console.error('Error in updateCurrentSong:', error);
    }
}

// Function to load upcoming songs list
function loadUpcomingList() {
    const upcomingList = document.querySelector('.upcoming-list');
    upcomingList.innerHTML = '';
    
    if (playingQueue.size() === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-queue-message';
        emptyMessage.textContent = 'No upcoming songs. Add songs to the queue!';
        upcomingList.appendChild(emptyMessage);
        return;
    }
    
    const queueArray = playingQueue.toArray();
    queueArray.forEach((song, idx) => {
        if (!song) return; // Skip undefined/null entries

        const upcomingItem = document.createElement('div');
        upcomingItem.className = 'upcoming-item';

        // Clear the previous content (if needed)
        upcomingItem.innerHTML = '';

        // Create and populate title element
        const titleEl = document.createElement('div');
        titleEl.className = 'song-title';
        titleEl.textContent = song.title || 'Unknown Title';

        // Create and populate artist element
        const artistEl = document.createElement('div');
        artistEl.className = 'song-artist';
        artistEl.textContent = song.artist || 'Unknown Artist';

        // Create and populate queue position element
        const posEl = document.createElement('div');
        posEl.className = 'queue-position';
        posEl.textContent = `#${idx + 1}`;

        // Append to the parent container
        upcomingItem.appendChild(titleEl);
        upcomingItem.appendChild(artistEl);
        upcomingItem.appendChild(posEl);


        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-from-queue';
        removeBtn.innerHTML = '&times;';

        removeBtn.addEventListener('click', () => {
            // Get fresh queueArray (because queue may have changed)
            const currentQueue = playingQueue.toArray();
            // Find index of this song in current queue
            const currentIndex = currentQueue.findIndex(s => s === song);
            if (currentIndex !== -1) {
                playingQueue.removeAt(currentIndex);
                loadUpcomingList();
                showNotification(`Removed from queue`);
            } else {
                console.warn('Song to remove not found in queue:', song);
            }
        });

        upcomingItem.appendChild(removeBtn);
        upcomingList.appendChild(upcomingItem);
    });
}


// Function to toggle sort order
function toggleSort() {
    const button = document.querySelector('.sort-button');
    
    // Sort ONLY the songs array for the main playlist
    songs.sort((a, b) => {
        if (isAscending) {
            return b.title.localeCompare(a.title);
        } else {
            return a.title.localeCompare(b.title);
        }
    });
    
    // Update button text
    isAscending = !isAscending;
    button.textContent = isAscending ? 'Sort Z - A' : 'Sort A - Z';
    
    // Reload only the main playlist
    const songList = document.querySelector('.song-list');
    songList.innerHTML = '';
    
    // Add songs to the playlist
    songs.forEach((song, index) => {
        // Create song item for the main playlist
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
            songItem.classList.add('active');
        }
        songItem.dataset.index = index;
        
        // Create the song info container
        const songInfo = document.createElement('div');
        songInfo.className = 'song-info-container';
        songInfo.innerHTML = `
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;
        
        // Create the hover actions container
        const hoverActions = document.createElement('div');
        hoverActions.className = 'hover-actions';
        hoverActions.innerHTML = `
            <button class="action-btn add-to-queue">Add</button>
        `;
        
        // Add the elements to the song item
        songItem.appendChild(songInfo);
        songItem.appendChild(hoverActions);
        
        // Add event listener for adding to queue
        songItem.querySelector('.add-to-queue').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the song item click event
            addToQueue(song);
        });
        
        // Add click event listener to play the song when clicked
        songItem.addEventListener('click', function() {
            playSong(song);
        });
        
        songList.appendChild(songItem);
    });
}

// Function to search songs
function searchSongs() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // If search is empty, show all songs
    if (searchTerm === '') {
        filteredSongs = [];
        loadSongs(songs);
        return;
    }
    
    //Filter songs
    const matchedIndexes = songTrie.searchPrefix(searchTerm);
    filteredSongs = Array.from(matchedIndexes).map(idx => songs[idx]);
    
    // Load the filtered songs
    loadSongs(filteredSongs);
}

// Function to clear search
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    filteredSongs = [];
    loadSongs(songs);
}

// Function to update progress bar
function updateProgress() {
    if (!audioPlayer) return;
    
    const progressBar = document.querySelector('.progress');
    const timeInfoSpans = document.querySelectorAll('.time-info span');
    
    // Calculate progress percentage
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${percent}%`;
    
    // Update time display
    if (timeInfoSpans.length === 2) {
        // Format current time
        const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
        const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
        timeInfoSpans[0].textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        
        // Format total time
        if (!isNaN(audioPlayer.duration)) {
            const totalMinutes = Math.floor(audioPlayer.duration / 60);
            const totalSeconds = Math.floor(audioPlayer.duration % 60);
            timeInfoSpans[1].textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        }
    }
    

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load songs from directory
    loadSongsFromDirectory();
    
    // Load songs into playlist
    loadSongs();
    
    // Playback controls using specific IDs
    document.getElementById('play-btn').addEventListener('click', function () {
        if (!currentSong) {
            if (playingQueue.size() > 0) {
                playNextFromQueue();
            }
            return;
        }

        if (!audioPlayer) {
            audioPlayer = new Audio();
            audioPlayer.src = currentSong.file;
            audioPlayer.addEventListener('timeupdate', updateProgress);
            audioPlayer.addEventListener('ended', playNextFromQueue);
            audioPlayer.load();
        }

        if (audioPlayer.paused) {
            this.textContent = '⏸';
            audioPlayer.play().catch(e => console.error('Playback error:', e));
        } else {
            this.textContent = '▶';
            audioPlayer.pause();
        }
    });

    document.getElementById('next-btn').addEventListener('click', function () {
        playNextFromQueue();
    });

    document.getElementById('prev-btn').addEventListener('click', function () {
        playPreviousFromHistory();
    });

    // Make progress bar clickable
    document.querySelector('.progress-bar').addEventListener('click', function(e) {
        if (!audioPlayer || !currentSong) return;
        
        // Calculate click position percentage
        const rect = this.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        
        // Set audio time based on click position
        audioPlayer.currentTime = clickPosition * audioPlayer.duration;
        
        // Update progress bar
        updateProgress();
    });
    document.querySelector('.sort-button').addEventListener('click', toggleSort);
    document.getElementById('search-input').addEventListener('input', searchSongs);
    document.querySelector('.clear-search').addEventListener('click', clearSearch);
});
