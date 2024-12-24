document.addEventListener('DOMContentLoaded', () => {
    let activeAudio = null;
    let isPlaying = false;
    let activeButton = null;
    const audioStreams = new Map();

    // Initialize audio elements early
    const streamButtons = document.querySelectorAll('[data-stream]');
    streamButtons.forEach(button => {
        const streamUrl = button.dataset.stream;
        if (streamUrl) {
            const audio = new Audio();
            audio.preload = "auto"; // Force preload
            audio.crossOrigin = "anonymous";
            audio.src = streamUrl;
            
            // Set low latency mode where supported
            if (typeof audio.mozPreservesPitch !== 'undefined') {
                audio.mozPreservesPitch = false;
            }
            
            // Reduce buffer size for quicker start
            if (typeof audio.buffered !== 'undefined') {
                audio.preload = "auto";
            }

            // Start loading the stream
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.pause(); // Pause immediately but keep buffer
                }).catch(() => {
                    // Ignore initial play error
                });
            }

            audioStreams.set(streamUrl, audio);
        }
    });

    function toggleIcon(button, playing) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove(playing ? 'fa-play' : 'fa-pause');
            icon.classList.add(playing ? 'fa-pause' : 'fa-play');
        }
    }

    function stopCurrentAudio() {
        if (activeAudio) {
            activeAudio.pause();
            isPlaying = false;
            if (activeButton) {
                toggleIcon(activeButton, false);
                activeButton = null;
            }
        }
    }

    function playStream(button) {
        const streamUrl = button.dataset.stream;
        if (!streamUrl) return;

        if (activeButton === button && isPlaying) {
            stopCurrentAudio();
            return;
        }

        try {
            // If same stream was just paused, resume quickly
            if (activeAudio && activeAudio === audioStreams.get(streamUrl)) {
                toggleIcon(button, true);
                activeAudio.play()
                    .then(() => {
                        isPlaying = true;
                        activeButton = button;
                    })
                    .catch(error => {
                        console.error('Resume failed:', error);
                        stopCurrentAudio();
                        toggleIcon(button, false);
                    });
                return;
            }

            stopCurrentAudio();

            const audio = audioStreams.get(streamUrl);
            if (!audio) return;

            // Set volume before playing
            const volumeControl = document.querySelector('.volume input[type="range"]');
            if (volumeControl) {
                audio.volume = volumeControl.value / 100;
            }

            toggleIcon(button, true);
            
            // Immediate play attempt
            audio.play()
                .then(() => {
                    isPlaying = true;
                    activeButton = button;
                    activeAudio = audio;
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                    stopCurrentAudio();
                    toggleIcon(button, false);
                });

        } catch (error) {
            console.error('Stream error:', error);
            stopCurrentAudio();
            toggleIcon(button, false);
        }
    }

    // Add click handlers to all stream buttons
    streamButtons.forEach(button => {
        button.addEventListener('click', () => playStream(button));
    });

    // Update volume controls to handle all volume inputs
    const volumeControls = document.querySelectorAll('.volume input[type="range"]');
    const volumeIcons = document.querySelectorAll('.volume i');
    let lastVolume = 80;
    
    function updateVolumeIcon(volumeLevel) {
        volumeIcons.forEach(icon => {
            icon.className = 'fas ' + (
                volumeLevel === 0 ? 'fa-volume-mute' :
                volumeLevel < 50 ? 'fa-volume-down' :
                'fa-volume-up'
            );
        });
    }

    function updateVolume(value) {
        if (activeAudio) {
            activeAudio.volume = value / 100;
            lastVolume = value;
            updateVolumeIcon(value);
        }
    }

    volumeIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            if (!activeAudio) return;

            if (activeAudio.volume > 0) {
                lastVolume = activeAudio.volume * 100;
                updateVolume(0);
                volumeControls.forEach(vc => vc.value = 0);
            } else {
                updateVolume(lastVolume);
                volumeControls.forEach(vc => vc.value = lastVolume);
            }
        });
    });

    volumeControls.forEach(control => {
        control.value = lastVolume;

        control.addEventListener('input', (e) => {
            const newVolume = e.target.value;
            volumeControls.forEach(vc => {
                vc.value = newVolume;
            });
            updateVolume(newVolume);
        });
    });

    // Optional: Keep the streams warm by periodically checking their status
    setInterval(() => {
        audioStreams.forEach((audio, url) => {
            if (audio !== activeAudio && audio.readyState < 3) {
                audio.load();
            }
        });
    }, 30000); // Check every 30 seconds
});