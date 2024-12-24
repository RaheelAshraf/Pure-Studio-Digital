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

    class AudioBufferManager {
        constructor() {
            this.audio = new Audio();
            this.isPlaying = false;
            this.activeButton = null;
            this.lastVolume = 80;
            this.loadingStates = new Map();

            // Configure audio element
            this.audio.preload = "auto";
            this.audio.crossOrigin = "anonymous";

            // Set initial volume
            const volumeControl = document.querySelector('.volume input[type="range"]');
            if (volumeControl) {
                this.audio.volume = volumeControl.value / 100;
            }

            // Add event listeners
            this.audio.addEventListener('canplay', () => {
                this.hideLoading(this.activeButton);
            });

            this.audio.addEventListener('waiting', () => {
                if (this.activeButton) this.showLoading(this.activeButton);
            });

            this.audio.addEventListener('playing', () => {
                if (this.activeButton) this.hideLoading(this.activeButton);
            });

            this.audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.hideLoading(this.activeButton);
                this.updateButtonState(this.activeButton, false);
            });

            // Preload streams
            this.preloadStreams();
        }

        showLoading(button) {
            if (!button) return;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
            button.classList.add('loading');
        }

        hideLoading(button) {
            if (!button) return;
            button.classList.remove('loading');
            this.updateButtonState(button, this.isPlaying);
        }

        preloadStreams() {
            document.querySelectorAll('[data-stream]').forEach(button => {
                const streamUrl = button.dataset.stream;
                if (!streamUrl) return;

                // Create a temporary audio element for preloading
                const temp = new Audio();
                temp.preload = "metadata";
                temp.src = streamUrl;
                
                // Store loading state
                this.loadingStates.set(streamUrl, false);
                
                temp.addEventListener('loadedmetadata', () => {
                    this.loadingStates.set(streamUrl, true);
                    temp.remove(); // Clean up
                });
            });
        }

        togglePlayback(button) {
            if (!button || !button.dataset.stream) return;

            // Handle same button toggle
            if (this.activeButton === button) {
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play(button);
                }
                return;
            }

            // Switch to new stream
            if (this.isPlaying) {
                this.pause();
            }
            this.play(button);
        }

        play(button) {
            const streamUrl = button.dataset.stream;
            
            // Show loading immediately
            this.showLoading(button);
            
            // Update audio source if it's a new stream
            if (this.audio.src !== streamUrl) {
                this.audio.src = streamUrl;
                this.audio.load();
            }

            // Attempt playback immediately
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.activeButton = button;
                    this.hideLoading(button);
                    this.updateAllButtons();
                }).catch(error => {
                    console.error('Playback failed:', error);
                    this.hideLoading(button);
                });
            }
        }

        pause() {
            this.audio.pause();
            this.isPlaying = false;
            this.updateButtonState(this.activeButton, false);
            this.activeButton = null;
        }

        updateButtonState(button, playing) {
            if (!button) return;
            const icon = button.querySelector('i');
            if (icon && !button.classList.contains('loading')) {
                icon.className = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
            }
        }

        updateAllButtons() {
            document.querySelectorAll('[data-stream]').forEach(button => {
                this.updateButtonState(button, button === this.activeButton && this.isPlaying);
            });
        }

        setVolume(value) {
            this.audio.volume = value / 100;
            this.lastVolume = value;
        }

        toggleMute() {
            if (this.audio.volume > 0) {
                this.lastVolume = this.audio.volume * 100;
                this.setVolume(0);
                return false;
            } else {
                this.setVolume(this.lastVolume);
                return true;
            }
        }
    }

    // Initialize Audio Manager
    const audioManager = new AudioBufferManager();

    // Handle all play buttons with debounce
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    document.querySelectorAll('[data-stream]').forEach(button => {
        button.addEventListener('click', debounce((e) => {
            e.preventDefault();
            audioManager.togglePlayback(button);
        }, 300));
    });

    // Volume Controls
    const volumeControls = document.querySelectorAll('.volume input[type="range"]');
    const volumeIcons = document.querySelectorAll('.volume i');

    function updateVolumeIcon(volume) {
        volumeIcons.forEach(icon => {
            icon.className = 'fas ' + (
                volume === 0 ? 'fa-volume-mute' :
                volume < 50 ? 'fa-volume-down' :
                'fa-volume-up'
            );
        });
    }

    volumeControls.forEach(control => {
        control.value = audioManager.lastVolume;
        control.addEventListener('input', (e) => {
            const newVolume = parseInt(e.target.value);
            audioManager.setVolume(newVolume);
            volumeControls.forEach(vc => vc.value = newVolume);
            updateVolumeIcon(newVolume);
        });
    });

    volumeIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const isNotMuted = audioManager.toggleMute();
            volumeControls.forEach(vc => {
                vc.value = isNotMuted ? audioManager.lastVolume : 0;
            });
            updateVolumeIcon(isNotMuted ? audioManager.lastVolume : 0);
        });
    });
});