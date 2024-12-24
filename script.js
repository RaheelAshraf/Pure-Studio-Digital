// Audio elements
const mainAudio = new Audio('https://stream-155.zeno.fm/01pg7vn11zhvv?zs=qHrnGEYKTzOuQRVXV_2Wbw');
const featuredAudio = new Audio('https://stream-155.zeno.fm/01pg7vn11zhvv?zs=qHrnGEYKTzOuQRVXV_2Wbw');

// Main player controls
const playBtn = document.querySelector('.play-btn');
const volumeSlider = document.querySelector('.volume input');
const volumeIcon = document.querySelector('.volume i');

// Featured player controls
const featuredPlayBtn = document.querySelector('.featured-play-btn');

// Play/Pause functions
function toggleMainAudio() {
    if (mainAudio.paused) {
        mainAudio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>Stop Listening';
        startVisualizer();
    } else {
        mainAudio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>Start Listening';
        stopVisualizer();
    }
}

function toggleFeaturedAudio() {
    if (featuredAudio.paused) {
        featuredAudio.play();
        featuredPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        featuredAudio.pause();
        featuredPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Volume control
function updateVolume(e) {
    const volume = e.target.value / 100;
    mainAudio.volume = volume;
    featuredAudio.volume = volume;
    
    // Update volume icon
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Visualizer animation
const visualizerBars = document.querySelectorAll('.visualizer span');
let visualizerInterval;

function startVisualizer() {
    if (visualizerInterval) return;
    
    visualizerInterval = setInterval(() => {
        visualizerBars.forEach(bar => {
            const height = Math.random() * 100;
            bar.style.height = `${height}%`;
        });
    }, 100);
}

function stopVisualizer() {
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
        visualizerInterval = null;
        visualizerBars.forEach(bar => {
            bar.style.height = '30%';
        });
    }
}

// Event listeners
playBtn.addEventListener('click', toggleMainAudio);
featuredPlayBtn.addEventListener('click', toggleFeaturedAudio);
volumeSlider.addEventListener('input', updateVolume);

// Initialize volume
volumeSlider.value = 80;
mainAudio.volume = 0.8;
featuredAudio.volume = 0.8;

// Handle audio errors
function handleAudioError(error) {
    console.error('Audio playback error:', error);
    // Reset buttons to play state
    playBtn.innerHTML = '<i class="fas fa-play"></i>Start Listening';
    featuredPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    stopVisualizer();
}

mainAudio.addEventListener('error', handleAudioError);
featuredAudio.addEventListener('error', handleAudioError);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    mainAudio.pause();
    featuredAudio.pause();
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let currentAudio = null;
    let currentPlayingButton = null;
    let isPlaying = false;
    const audioStreams = new Map();

    // Pre-initialize audio streams
    function initializeAudioStream(url) {
        if (!audioStreams.has(url)) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';
            audio.src = url;
            audioStreams.set(url, audio);
        }
        return audioStreams.get(url);
    }

    // Initialize all streams
    document.querySelectorAll('.station-play').forEach(button => {
        initializeAudioStream(button.dataset.stationUrl);
    });
    // Initialize hero stream
    initializeAudioStream('http://live3.rcast.net:9150/;stream');

    // Function to update button state
    function updateButtonState(button, isPlaying) {
        const icon = button.querySelector('i');
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            button.classList.add('playing');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            button.classList.remove('playing');
        }
    }

    // Function to stop current audio
    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (currentPlayingButton) {
            updateButtonState(currentPlayingButton, false);
        }
    }

    // Function to handle station play/pause
    function handleStationPlay(button) {
        const stationUrl = button.dataset.stationUrl;
        const audio = audioStreams.get(stationUrl);
        
        // If hero button was playing, update its state
        const heroButton = document.querySelector('.hero .play-button');
        if (heroButton && heroButton.classList.contains('playing')) {
            updateButtonState(heroButton, false);
            heroButton.innerHTML = '<i class="fas fa-play"></i>Start Listening';
        }

        if (currentPlayingButton === button) {
            // Same button clicked - toggle play/pause
            if (audio.paused) {
                stopCurrentAudio();
                audio.play();
                currentAudio = audio;
                currentPlayingButton = button;
                updateButtonState(button, true);
                isPlaying = true;
            } else {
                audio.pause();
                updateButtonState(button, false);
                isPlaying = false;
            }
        } else {
            // Different button clicked
            stopCurrentAudio();
            audio.play();
            currentAudio = audio;
            currentPlayingButton = button;
            updateButtonState(button, true);
            isPlaying = true;
        }
    }

    // Add click event listeners to all station play buttons
    document.querySelectorAll('.station-play').forEach(button => {
        button.addEventListener('click', () => handleStationPlay(button));
    });

    // Handle main hero play button
    const heroPlayButton = document.querySelector('.hero .play-button');
    if (heroPlayButton) {
        const defaultUrl = 'http://live3.rcast.net:9150/;stream';
        
        heroPlayButton.addEventListener('click', function() {
            const audio = audioStreams.get(defaultUrl);

            if (!isPlaying) {
                stopCurrentAudio();
                audio.play();
                currentAudio = audio;
                isPlaying = true;
                this.innerHTML = '<i class="fas fa-pause"></i>Stop Listening';
                this.classList.add('playing');
            } else {
                audio.pause();
                currentAudio = null;
                isPlaying = false;
                this.innerHTML = '<i class="fas fa-play"></i>Start Listening';
                this.classList.remove('playing');
            }
        });
    }

    // Add error handling for all audio streams
    audioStreams.forEach((audio, url) => {
        audio.addEventListener('error', () => {
            if (currentAudio === audio) {
                isPlaying = false;
                if (currentPlayingButton) {
                    updateButtonState(currentPlayingButton, false);
                    currentPlayingButton = null;
                }
                if (heroPlayButton && heroPlayButton.classList.contains('playing')) {
                    heroPlayButton.innerHTML = '<i class="fas fa-play"></i>Start Listening';
                    heroPlayButton.classList.remove('playing');
                }
            }
        });
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});
