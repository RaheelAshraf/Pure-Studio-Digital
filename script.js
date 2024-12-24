document.addEventListener('DOMContentLoaded', () => {
    const streamUrl = 'http://live3.rcast.net:9150/;stream';
    const audio = new Audio();
    audio.preload = 'auto';
    let isPlaying = false;
    let activeButton = null;

    const navButton = document.getElementById('navListenBtn');
    const heroButton = document.querySelector('.play-btn.main-stream');
    const featuredButtons = document.querySelectorAll('.action-btn.play-btn');

    // Pre-buffer main stream
    audio.src = streamUrl;
    audio.load();

    function toggleIcon(button, playing) {
        const icon = button.querySelector('i');
        if (playing) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    }

    function resetOtherButtons(activeBtn) {
        if (navButton && navButton !== activeBtn) toggleIcon(navButton, false);
        if (heroButton && heroButton !== activeBtn) toggleIcon(heroButton, false);
        featuredButtons.forEach(btn => {
            if (btn !== activeBtn) toggleIcon(btn, false);
        });
    }

    function toggleStream(button, url) {
        if (isPlaying && activeButton === button) {
            audio.pause();
            isPlaying = false;
            activeButton = null;
            toggleIcon(button, false);
        } else {
            if (activeButton) {
                toggleIcon(activeButton, false);
            }
            resetOtherButtons(button);

            if (audio.src !== url) {
                audio.src = url;
            }
            
            toggleIcon(button, true);
            audio.play();
            isPlaying = true;
            activeButton = button;
        }
    }

    // Add click handlers
    navButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleStream(navButton, streamUrl);
    });

    heroButton.addEventListener('click', () => {
        toggleStream(heroButton, streamUrl);
    });

    // Add click handlers to featured station buttons
    featuredButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonStreamUrl = button.dataset.stream;
            if (buttonStreamUrl) {
                toggleStream(button, buttonStreamUrl);
            }
        });
    });

    // Handle errors silently in background
    audio.addEventListener('error', () => {
        if (isPlaying) {
            isPlaying = false;
            if (activeButton) {
                toggleIcon(activeButton, false);
            }
            activeButton = null;
        }
    });
});