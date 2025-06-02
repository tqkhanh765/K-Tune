import { songs, songTrie } from './songData.js';
import { playSong, addToQueue, currentSong, playingQueue, playHistory } from './playback.js';


let originalSongs = [];
let filteredSongs = [];
let isAscending = true;

// Function to load songs into the playlist (Displays songs)
export function loadSongs(songsToLoad = songs) {
    const songList = document.querySelector('.song-list');
    if (!songList) {
        console.error('Song list element not found!');
        return;
    }

    songList.innerHTML = '';

    if (originalSongs.length === 0 && songs.length > 0) {
        originalSongs = [...songs];
    }

    if (songsToLoad.length === 0) {
        const noSongsMsg = document.createElement('div');
        noSongsMsg.className = 'no-songs-message';
        noSongsMsg.textContent = 'No songs found. Try a different search.';
        songList.appendChild(noSongsMsg);
        return;
    }

    songsToLoad.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
            songItem.classList.add('active');
        }
        songItem.dataset.index = index;

        const songInfo = document.createElement('div');
        songInfo.className = 'song-info-container';
        songInfo.innerHTML = `
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;

        const hoverActions = document.createElement('div');
        hoverActions.className = 'hover-actions';
        hoverActions.innerHTML = `
            <button class="action-btn add-to-queue">Add</button>
        `;

        songItem.appendChild(songInfo);
        songItem.appendChild(hoverActions);

        songItem.querySelector('.add-to-queue').addEventListener('click', function(e) {
            e.stopPropagation();
            addToQueue(song);
            showNotification(`Added "${song.title}" to queue`);
        });

        songItem.addEventListener('click', function() {
            playSong(song);
        });

        songList.appendChild(songItem);
    });

    if (currentSong) {
        updateCurrentSong();
    } else {
        clearPlayer();
    }
    loadUpcomingList();
}

// Function to clear the player UI (does not stop audio)
export function clearPlayer() {
    // Update UI elements to a default state when no song is playing
    const currentSongElement = document.querySelector('.current-song');
    const currentArtistElement = document.querySelector('.current-artist');
    const albumCoverImg = document.getElementById('album-cover-img');
    const progressBar = document.querySelector('.progress');
    const timeInfoSpans = document.querySelectorAll('.time-info span');
    const playBtn = document.querySelector('.play-btn');

    if (currentSongElement) currentSongElement.textContent = 'Select a song';
    if (currentArtistElement) currentArtistElement.textContent = 'from the playlist';

    // Clear album cover and show fallback
    const albumArtDiv = document.querySelector('.album-art');
    if (albumArtDiv) {
        albumArtDiv.innerHTML = '<div class="fallback-cover">♪</div>';
        const fallbackDiv = albumArtDiv.querySelector('.fallback-cover');
        if (fallbackDiv) {
            fallbackDiv.style.fontSize = '48px';
            fallbackDiv.style.color = '#8b4513';
            fallbackDiv.style.display = 'flex';
            fallbackDiv.style.justifyContent = 'center';
            fallbackDiv.style.alignItems = 'center';
            fallbackDiv.style.height = '100%';
        }
    }

    // Reset progress bar and time display
    if (progressBar) progressBar.style.width = '0%';
    if (timeInfoSpans.length === 2) {
        timeInfoSpans[0].textContent = '0:00';
        timeInfoSpans[1].textContent = '0:00';
    }

    // Reset play button icon
    if (playBtn) playBtn.textContent = '▶';
}


// Function to show a notification (UI concern)
export function showNotification(message) {
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

// Function to update current song display (UI concern)
export function updateCurrentSong() {
    try {
        if (!currentSong) {
            clearPlayer();
            return;
        }

        const currentSongElement = document.querySelector('.current-song');
        const currentArtistElement = document.querySelector('.current-artist');

        if (currentSongElement) currentSongElement.textContent = currentSong.title;
        if (currentArtistElement) currentArtistElement.textContent = currentSong.artist;

        const albumArtDiv = document.querySelector('.album-art');
        if (albumArtDiv) {
            albumArtDiv.innerHTML = '';

            const newImg = document.createElement('img');
            newImg.id = 'album-cover-img';
            newImg.alt = `${currentSong.title} by ${currentSong.artist}`;

            console.log('Attempting to load image from:', currentSong.cover);

            newImg.onerror = function() {
                console.error('Failed to load image:', currentSong.cover);
                albumArtDiv.innerHTML = '<div class="fallback-cover">♪</div>';
                const fallbackDiv = albumArtDiv.querySelector('.fallback-cover');
                if (fallbackDiv) {
                    fallbackDiv.style.fontSize = '48px';
                    fallbackDiv.style.color = '#8b4513';
                    fallbackDiv.style.display = 'flex';
                    fallbackDiv.style.justifyContent = 'center';
                    fallbackDiv.style.alignItems = 'center';
                    fallbackDiv.style.height = '100%';
                }
            };

            newImg.src = currentSong.cover;
            albumArtDiv.appendChild(newImg);
        } else {
            console.warn('Album art container not found');
        }
    } catch (error) {
        console.error('Error in updateCurrentSong:', error);
    }
}

// Function to load upcoming songs list (Displays queue)
export function loadUpcomingList() {
    const upcomingList = document.querySelector('.upcoming-list');
    // Ensure the upcoming list element exists before proceeding
    if (!upcomingList) {
        console.error('Upcoming list element not found!');
        return;
    }

    upcomingList.innerHTML = '';

    // Use imported playingQueue to display upcoming songs
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

        // Add event listener to remove song from queue
        removeBtn.addEventListener('click', () => {
            // Get fresh queueArray (because queue may have changed)
            const currentQueue = playingQueue.toArray(); // Use imported playingQueue
            // Find index of this song in current queue
            const currentIndex = currentQueue.findIndex(s => s === song);
            if (currentIndex !== -1) {
                playingQueue.removeAt(currentIndex); // Use imported playingQueue
                loadUpcomingList(); // Call exported loadUpcomingList to re-render the queue
                showNotification(`Removed from queue`); // Call exported showNotification
            } else {
                console.warn('Song to remove not found in queue:', song);
            }
        });

        upcomingItem.appendChild(removeBtn);
        upcomingList.appendChild(upcomingItem);
    });
}


// Function to toggle sort order (Affects the main song list display)
export function toggleSort() {
    const button = document.querySelector('.sort-button');
    // Ensure the sort button exists
     if (!button) {
        console.error('Sort button not found!');
        return;
    }

    // Sort ONLY the songs array for the main playlist
    // Use imported songs array (modify it in place)
    songs.sort((a, b) => {
        if (isAscending) {
            return b.title.localeCompare(a.title);
        } else {
            return a.title.localeCompare(b.title);
        }
    });

    // Update button text and sort state
    isAscending = !isAscending;
    button.textContent = isAscending ? 'Sort Z - A' : 'Sort A - Z';

    // Reload the main playlist with the sorted songs
    loadSongs(songs); // Call exported loadSongs
}

// Function to search songs (Filters the main song list display)
export function searchSongs() {
    const searchInput = document.getElementById('search-input');
    // Ensure the search input exists
    if (!searchInput) {
        console.error('Search input element not found!');
        return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();

    // If search is empty, show all songs
    if (searchTerm === '') {
        filteredSongs = []; // Clear filtered songs
        loadSongs(songs); // Load all songs using exported loadSongs and imported songs
        return;
    }

    // Filter songs using the imported songTrie
    const matchedIndexes = songTrie.searchPrefix(searchTerm);
    // Use the imported songs array to get the full song objects by index
    filteredSongs = Array.from(matchedIndexes).map(idx => songs[idx]);

    // Load the filtered songs into the playlist display
    loadSongs(filteredSongs); // Call exported loadSongs with the filtered list
}

// Function to clear search (Resets the main song list display)
export function clearSearch() {
    const searchInput = document.getElementById('search-input');
    // Ensure the search input exists
    if (searchInput) {
        searchInput.value = ''; // Clear the input field
    }

    filteredSongs = []; // Clear filtered songs
    loadSongs(songs); // Load all songs using exported loadSongs and imported songs
}
