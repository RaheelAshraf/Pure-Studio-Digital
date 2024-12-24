document.addEventListener('DOMContentLoaded', () => {
    // Mobile Nav Implementation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;

    function toggleMobileNav() {
        const isOpen = mobileNav.classList.toggle('active');
        body.classList.toggle('nav-active', isOpen);
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }

    mobileNavToggle.addEventListener('click', toggleMobileNav);

    // Handle mobile navigation clicks
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if href is empty or just "#"
            if (!href || href === '#') return;
            
            // Handle special cases
            if (href === '/') {
                e.preventDefault();
                toggleMobileNav();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            // Handle anchor links
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    toggleMobileNav();
                    setTimeout(() => {
                        const headerOffset = 60;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 300);
                }
            }
        });
    });

    let activeAudio = null;
    let audioStreams = new Map();
    let isPlaying = false;
    let activeButton = null;

    // Pre-initialize audio streams
    function initializeStreams() {
        document.querySelectorAll('[data-stream]').forEach(button => {
            const streamUrl = button.dataset.stream;
            if (!streamUrl || audioStreams.has(streamUrl)) return;

            const audio = new Audio();
            audio.preload = "auto";
            audio.crossOrigin = "anonymous";
            audio.src = streamUrl;
            
            // Set initial volume
            const volumeControl = document.querySelector('.volume input[type="range"]');
            if (volumeControl) {
                audio.volume = volumeControl.value / 100;
            }

            audioStreams.set(streamUrl, audio);
        });
    }

    // Initialize all streams immediately
    initializeStreams();

    function playStream(button) {
        const streamUrl = button.dataset.stream;
        if (!streamUrl) return;

        const newAudio = audioStreams.get(streamUrl);
        if (!newAudio) return;

        // If same stream is clicked, toggle play/pause
        if (activeButton === button) {
            if (isPlaying) {
                newAudio.pause();
                isPlaying = false;
            } else {
                newAudio.play().catch(() => {});
                isPlaying = true;
            }
            toggleIcon(button, isPlaying);
            return;
        }

        // Switch to new stream
        if (activeAudio) {
            activeAudio.pause();
            if (activeButton) {
                toggleIcon(activeButton, false);
            }
        }

        // Play new stream immediately
        newAudio.play().catch(() => {});
        activeAudio = newAudio;
        activeButton = button;
        isPlaying = true;
        toggleIcon(button, true);
    }

    // Toggle play/pause icon
    function toggleIcon(button, playing) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove(playing ? 'fa-play' : 'fa-pause');
            icon.classList.add(playing ? 'fa-pause' : 'fa-play');
        }
    }

    // Add click handlers to all stream buttons
    document.querySelectorAll('[data-stream]').forEach(button => {
        button.addEventListener('click', () => playStream(button));
    });

    // Volume control
    const volumeControls = document.querySelectorAll('.volume input[type="range"]');
    const volumeIcons = document.querySelectorAll('.volume i');
    let lastVolume = 80;

    function updateVolumeIcon(volume) {
        volumeIcons.forEach(icon => {
            icon.className = 'fas ' + (
                volume === 0 ? 'fa-volume-mute' :
                volume < 50 ? 'fa-volume-down' :
                'fa-volume-up'
            );
        });
    }

    function updateVolume(value) {
        const volume = value / 100;
        audioStreams.forEach(audio => {
            audio.volume = volume;
        });
        lastVolume = value;
        updateVolumeIcon(value);
    }

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

    // Keep streams warm
    setInterval(() => {
        audioStreams.forEach(audio => {
            if (!audio.paused) return;
            audio.load();
        });
    }, 30000);
});