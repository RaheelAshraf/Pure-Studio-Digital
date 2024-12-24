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
            
            // Handle special cases
            if (href === '/') {
                e.preventDefault();
                toggleMobileNav();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            // Handle anchor links
            if (href.startsWith('#')) {
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
    let isPlaying = false;
    let activeButton = null;
    const audioStreams = new Map();
    
    // Pre-initialize the main stream immediately
    const mainStreamUrl = 'http://live3.rcast.net:9150/;stream';
    const mainAudio = new Audio();
    mainAudio.preload = "auto";
    mainAudio.crossOrigin = "anonymous";
    mainAudio.src = mainStreamUrl;
    
    // Optimize initial loading
    mainAudio.load();
    audioStreams.set(mainStreamUrl, mainAudio);

    // Initialize other streams with delay
    setTimeout(() => {
        const streamButtons = document.querySelectorAll('[data-stream]');
        streamButtons.forEach(button => {
            const streamUrl = button.dataset.stream;
            if (streamUrl && streamUrl !== mainStreamUrl && !audioStreams.has(streamUrl)) {
                const audio = new Audio();
                audio.preload = "auto";
                audio.crossOrigin = "anonymous";
                audio.src = streamUrl;
                audioStreams.set(streamUrl, audio);
            }
        });
    }, 2000); // Delay other streams initialization

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
            const audio = audioStreams.get(streamUrl);
            if (!audio) return;

            if (activeAudio) {
                stopCurrentAudio();
            }

            // Set volume before playing
            const volumeControl = document.querySelector('.volume input[type="range"]');
            if (volumeControl) {
                audio.volume = volumeControl.value / 100;
            }

            toggleIcon(button, true);
            
            // Force reload for better start
            if (!isPlaying && audio.readyState < 3) {
                audio.load();
            }

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
    const streamButtons = document.querySelectorAll('[data-stream]');
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