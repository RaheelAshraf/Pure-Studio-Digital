document.addEventListener('DOMContentLoaded', () => {
    let activeAudio = null;
    let isPlaying = false;
    let activeButton = null;

    // Get all buttons that can play streams
    const streamButtons = document.querySelectorAll('[data-stream]');

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
            activeAudio.remove();
            activeAudio = null;
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

        // If same button clicked, stop playing
        if (activeButton === button && isPlaying) {
            stopCurrentAudio();
            return;
        }

        // Stop any existing stream first
        stopCurrentAudio();

        try {
            // Create and configure audio element
            const audio = document.createElement('audio');
            audio.src = streamUrl;
            document.body.appendChild(audio);
            
            // Set initial volume
            const volumeControl = document.querySelector('.volume input[type="range"]');
            if (volumeControl) {
                audio.volume = volumeControl.value / 100;
            }

            // Show loading state
            toggleIcon(button, true);

            // Start playback immediately
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    activeButton = button;
                    activeAudio = audio;
                }).catch(error => {
                    console.error('Playback failed:', error);
                    stopCurrentAudio();
                    toggleIcon(button, false);
                });
            }

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

    // Volume control
    const volumeControl = document.querySelector('.volume input[type="range"]');
    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            if (activeAudio) {
                activeAudio.volume = e.target.value / 100;
            }
        });
    }
});