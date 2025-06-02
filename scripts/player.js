import { loadSongsFromDirectory, songs } from './songData.js';
import {
    playSong,
    playNextFromQueue,
    playPreviousFromHistory,
    togglePlayPause,
    seekAudio,
    getAudioPlayerStatus,
    getAudioDuration,
    currentSong
} from './playback.js';
import {
    loadSongs,
    toggleSort,
    searchSongs,
    clearSearch,
    updateCurrentSong,
    clearPlayer
} from './playlistManager.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded. Initializing player...');
    loadSongsFromDirectory();
    loadSongs();

    // Play/Pause Button
    document.getElementById('play-btn').addEventListener('click', function () {
        console.log('Play/Pause button clicked.');
        const status = getAudioPlayerStatus();

        if (status === 'stopped') {
            if (currentSong) {
                playSong(currentSong);
            } else if (songs.length > 0) {
                playSong(songs[0]);
            } else {
                console.warn('No songs available to play.');
                showNotification('No songs found!');
            }
        } else {
            togglePlayPause();
            setTimeout(() => {
                const newStatus = getAudioPlayerStatus();
                this.textContent = (newStatus === 'playing') ? '⏸' : '▶';
            }, 50);
        }
    });

    // Next Button
    document.getElementById('next-btn').addEventListener('click', function () {
        console.log('Next button clicked.');
        playNextFromQueue();
        document.querySelector('.play-btn').textContent = '▶';
    });

    // Previous Button
    document.getElementById('prev-btn').addEventListener('click', function () {
        console.log('Previous button clicked.');
        playPreviousFromHistory();
        document.querySelector('.play-btn').textContent = '▶';
    });

    // Progress Bar Click (Seeking)
    document.querySelector('.progress-bar').addEventListener('click', function(e) {
        console.log('Progress bar clicked.');
        const duration = getAudioDuration();
        if (!currentSong || duration === 0) {
            console.warn('Cannot seek: No current song or duration unavailable.');
            return;
        }

        const progressBar = this;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const timeToSeek = clickPosition * duration;

        seekAudio(timeToSeek);
        console.log(`Seeking to ${timeToSeek} seconds.`);
        updateCurrentSong();
    });

    // Sort Button
    document.querySelector('.sort-button').addEventListener('click', function() {
        console.log('Sort button clicked.');
        toggleSort();
    });

    // Search Input (Live Search)
    document.getElementById('search-input').addEventListener('input', function() {
        console.log('Search input changed.');
        searchSongs();
    });

    // Clear Search Button
    document.querySelector('.clear-search').addEventListener('click', function() {
        console.log('Clear search button clicked.');
        clearSearch();
    });
});