import { Queue } from './queue.js';
import { Stack } from './stack.js';
import { updateCurrentSong, loadUpcomingList, showNotification, clearPlayer } from './playlistManager.js';
import { songs } from './songData.js';

export let currentSong = null;
export let playingQueue = new Queue();
export let playHistory = new Stack();

let audioPlayer = null;

// Function to get the audio player status
export function getAudioPlayerStatus() {
    if (!audioPlayer) return 'stopped';
    if (audioPlayer.paused) return 'paused';
    return 'playing';
}

// Function to toggle play/pause
export function togglePlayPause() {
    if (!audioPlayer) {
        if (currentSong) {
            playSong(currentSong);
        } else if (songs.length > 0) {
            playSong(songs[0]);
        }
        return;
    }

    if (audioPlayer.paused) {
        audioPlayer.play().catch(e => console.error('Playback error during play toggle:', e));
    } else {
        audioPlayer.pause();
    }
}

// Function to seek in the audio
export function seekAudio(timeInSeconds) {
    if (audioPlayer && !isNaN(audioPlayer.duration)) {
        audioPlayer.currentTime = timeInSeconds;
    }
}

// Function to get the current audio duration
export function getAudioDuration() {
    return audioPlayer && !isNaN(audioPlayer.duration) ? audioPlayer.duration : 0;
}


// Function to play a song
export function playSong(song) {
    if (!song || !song.file) {
        console.error('Attempted to play invalid song:', song);
        showNotification('Error: Invalid song data.');
        return;
    }

    if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
        console.log('Same song already selected.');
        if (audioPlayer && audioPlayer.paused) {
            audioPlayer.play().catch(e => console.error('Playback error trying to resume same song:', e));
        } else if (!audioPlayer) {
            console.warn('Audio player missing for current song, attempting to re-initialize.');
            setupAndPlayAudio(song);
        } else {
            console.log('Same song is already playing.');
        }
        updatePlaylistUI(song);
        return;
    }

    console.log('Playing song:', song.title, 'by', song.artist);

    try {
        if (currentSong) {
            playHistory.push(currentSong);
        }

        currentSong = song;
        updatePlaylistUI(song);

        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }

        setupAndPlayAudio(song);

    } catch (error) {
        console.error('Error in playSong function:', error);
        showNotification('An error occurred while trying to play the song.');
        clearPlayer();
    }
}

// Internal helper to set up and play audio
function setupAndPlayAudio(song) {
    audioPlayer = new Audio();

    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNextFromQueue);

    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio playback error:', audioPlayer.error, e);
        let errorMsg = 'Error playing audio.';
        switch (audioPlayer.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                errorMsg = 'Audio playback aborted.';
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                errorMsg = 'A network error caused the audio download to fail.';
                break;
            case MediaError.MEDIA_ERR_DECODE:
                errorMsg = 'The audio playback was aborted due to a corruption problem or because the audio used features the browser did not support.';
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMsg = 'The audio could not be loaded, either because the server or network failed or because the format is not supported.';
                break;
            default:
                errorMsg = 'An unknown audio error occurred.';
                break;
        }
        showNotification(errorMsg);

        console.log('Attempting to play next song due to error.');
        playNextFromQueue();
    });

    audioPlayer.src = song.file;
    audioPlayer.load();

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Audio playback started successfully');
            document.querySelector('.play-btn').textContent = '⏸';
        }).catch(error => {
            console.error('Error playing audio (autoplay prevented?):', error);
            document.querySelector('.play-btn').textContent = '▶';
            showNotification('Playback blocked. Click play to start.');
        });
    }
}


// Function to add a song to the queue
export function addToQueue(song) {
    if (!song || !song.title || !song.artist) {
        console.warn('Trying to add invalid song to queue:', song);
        return;
    }

    playingQueue.insert(song);
    showNotification(`Added "${song.title}" to queue`);
    loadUpcomingList();
}

// Function to play the next song from the queue
export function playNextFromQueue() {
    if (playingQueue.size() > 0) {
        const nextSong = playingQueue.remove();
        playSong(nextSong);
    } else if (currentSong) {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        console.log('Queue is empty, playback stopped.');
        currentSong = null;
        clearPlayer();
    } else {
        console.log('Queue is empty and no song is currently playing.');
        clearPlayer();
    }
}

// Function to play the previous song from history
export function playPreviousFromHistory() {
    if (audioPlayer && audioPlayer.currentTime > 5 && currentSong) {
        audioPlayer.currentTime = 0;
        console.log('Restarting current song.');
        return;
    }

    if (playHistory.size() > 0) {
        const previousSong = playHistory.pop();

        if (currentSong) {
            if (!(previousSong.title === currentSong.title && previousSong.artist === currentSong.artist)) {
                playingQueue.insertFront(currentSong);
            }
        }

        playSong(previousSong);

    } else {
        console.log('Play history is empty.');
        if(audioPlayer && currentSong) {
            audioPlayer.currentTime = 0;
            if (audioPlayer.paused) {
                audioPlayer.play().catch(e => console.error('Playback error during prev toggle:', e));
            }
        } else if (!currentSong && songs.length > 0) {
            console.log('No history and no current song to restart.');
        }
    }
}

// Function to update progress bar (updates UI based on playback state)
function updateProgress() {
    // Check if the necessary UI elements exist
    const progressBar = document.querySelector('.progress');
    const timeInfoSpans = document.querySelectorAll('.time-info span');

    if (!audioPlayer || !progressBar || timeInfoSpans.length < 2) return;

    // Calculate progress percentage
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${percent}%`;

    // Update time display
    // Format current time
    const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
    const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
    timeInfoSpans[0].textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;

    // Format total time
    if (!isNaN(audioPlayer.duration)) {
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        timeInfoSpans[1].textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    } else {
         timeInfoSpans[1].textContent = '--:--';
    }
}

// Function to update the playlist UI
function updatePlaylistUI(song) {
    // Remove active class from all song items
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('active');
    });

    if (song) {
        document.querySelectorAll('.song-item').forEach(item => {
             const itemTitleElement = item.querySelector('.song-title');
             const itemArtistElement = item.querySelector('.song-artist');

             if (itemTitleElement && itemArtistElement &&
                 itemTitleElement.textContent === song.title &&
                 itemArtistElement.textContent === song.artist) {
                 item.classList.add('active');
             }
        });
    }

    // Update the currently displayed song info
    updateCurrentSong();

    // Update the upcoming queue list
    loadUpcomingList();
}