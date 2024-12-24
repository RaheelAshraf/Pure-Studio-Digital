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
            // Initialize audio immediately
            this.audio = new Audio();
            this.audio.preload = "auto";
            this.audio.crossOrigin = "anonymous";
            this.isPlaying = false;
            this.activeButton = null;
            this.lastVolume = 80;
            this.isLoading = false;

            // Set volume immediately
            this.audio.volume = this.lastVolume / 100;

            // Add loading state listeners
            this.audio.addEventListener('waiting', () => this.setLoadingState(true));
            this.audio.addEventListener('playing', () => this.setLoadingState(false));
            this.audio.addEventListener('error', () => this.setLoadingState(false));

            // Pre-initialize streams
            document.querySelectorAll('[data-stream]').forEach(button => {
                const stream = button.dataset.stream;
                if (stream) {
                    const preloadLink = document.createElement('link');
                    preloadLink.rel = 'preconnect';
                    preloadLink.href = new URL(stream).origin;
                    document.head.appendChild(preloadLink);
                }
            });

            // Add abort controller for loading states
            this.currentLoadingController = null;
        }

        clearCurrentStream() {
            // Clear loading state if any
            if (this.currentLoadingController) {
                this.currentLoadingController.abort();
                this.currentLoadingController = null;
            }

            // Clear current playback
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
                this.audio.load();
            }

            // Reset UI states
            if (this.activeButton) {
                this.setLoadingState(false);
                this.updateButtonState(this.activeButton, false);
            }

            this.isPlaying = false;
            this.activeButton = null;
        }

        setLoadingState(isLoading) {
            this.isLoading = isLoading;
            if (this.activeButton) {
                const icon = this.activeButton.querySelector('i');
                const loadingSpinner = this.activeButton.querySelector('.loading-spinner');
                
                if (isLoading) {
                    this.activeButton.classList.add('loading');
                    if (!loadingSpinner) {
                        icon.style.display = 'none';
                        const spinner = document.createElement('div');
                        spinner.className = 'loading-spinner';
                        this.activeButton.insertBefore(spinner, icon);
                    }
                } else {
                    this.activeButton.classList.remove('loading');
                    if (loadingSpinner) {
                        loadingSpinner.remove();
                        icon.style.display = '';
                    }
                    this.updateButtonState(this.activeButton, this.isPlaying);
                }
            }
        }

        togglePlayback(button) {
            if (!button?.dataset.stream) return;

            // If same button is clicked while playing, just pause
            if (this.activeButton === button && this.isPlaying) {
                this.pause();
                return;
            }

            // Clear any existing stream before starting new one
            this.clearCurrentStream();

            // Create new abort controller for this stream
            this.currentLoadingController = new AbortController();
            
            // Show loading state immediately
            this.setLoadingState(true);
            this.activeButton = button;
            
            // Start new stream
            const streamUrl = button.dataset.stream;
            this.audio.src = streamUrl;
            this.audio.load();
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateButtonState(button, true);
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Playback failed:', error);
                    this.clearCurrentStream();
                }
            });
        }

        pause() {
            this.clearCurrentStream();
        }

        updateButtonState(button, playing) {
            if (!button) return;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
            }
        }

        setVolume(value) {
            if (!this.audio) return;
            this.audio.volume = value / 100;
            this.lastVolume = value;
        }

        toggleMute() {
            if (!this.audio) return true;
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

    // Initialize Audio Manager immediately
    const audioManager = new AudioBufferManager();

    // Direct click handling without debounce
    document.querySelectorAll('[data-stream]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            audioManager.togglePlayback(button);
        });
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