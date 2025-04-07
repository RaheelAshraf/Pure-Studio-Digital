document.addEventListener('DOMContentLoaded', async () => {
    // Import radio stations
    let RADIO_STATIONS;
    try {
        const module = await import('./stations.js');
        RADIO_STATIONS = module.default;
    } catch (error) {
        console.error('Error loading radio stations:', error);
        RADIO_STATIONS = {};
    }
    
    // Mobile Navigation Elements
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    // Store the scroll position when opening nav
    let scrollPosition = 0;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

    // Toggle Mobile Navigation
    function toggleMobileNav() {
        const isOpen = mobileNav.classList.toggle('active');
        
        if (isOpen) {
            // Store current scroll position
            scrollPosition = window.pageYOffset;
            // Add scroll lock
            body.classList.add('nav-active');
            // Apply negative top margin to maintain visual position
            body.style.top = `-${scrollPosition}px`;
            // Prevent touch events on body
            body.style.touchAction = 'none';
            
            // Add touch event listeners to prevent scrolling
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('wheel', preventScroll, { passive: false });
        } else {
            // Remove scroll lock
            body.classList.remove('nav-active');
            // Reset body position
            body.style.top = '';
            body.style.touchAction = '';
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
            
            // Remove touch event listeners
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('wheel', preventScroll);
        }
        
        navMenu.classList.toggle('active', isOpen);
        
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-times', isOpen);
    }

    // Prevent scroll/touch events
    function preventScroll(e) {
        e.preventDefault();
    }

    mobileNavToggle.addEventListener('click', toggleMobileNav);

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && 
            !mobileNav.contains(e.target) && 
            !mobileNavToggle.contains(e.target)) {
            closeMobileNav();
        }
    });

    // Close mobile nav when clicking links
    document.querySelectorAll('.nav-link, .mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileNav();
        });
    });

    // Handle mobile navigation clicks for smooth scrolling
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (!href || href === '#') return;
            
            if (href === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
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

    // Update the home link click handler
    document.querySelectorAll('.mobile-nav a[href="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileNav(); // Close mobile nav first
            setTimeout(() => { // Add small delay to ensure smooth transition
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 300);
        });
    });

    // Navigation active state handling
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveLink(hash) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            // Check if we should highlight home link
            if (hash === '' && (href === '/' || href === '/home')) {
                link.classList.add('active');
            }
            // Check for section links
            else if (hash && href.includes(hash)) {
                link.classList.add('active');
            }
        });
    }

    // Create Intersection Observer for sections
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -100px 0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                setActiveLink('#' + sectionId);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });

    // Update navigation click handlers with better error handling
    document.querySelectorAll('.nav-link, .mobile-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (!href) return;

                // If we're on terms.html, handle navigation differently
                const isTermsPage = window.location.pathname.includes('terms.html');
                if (isTermsPage && (href === '/home' || href === '/')) {
                    window.location.href = href;
                    return;
                }

                // Handle home link
                if (href === '/' || href === '/home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                
                // Handle section links
                if (href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        // Close mobile nav if open
                        closeMobileNav();
                        
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            } catch (error) {
                console.error('Navigation error:', error);
            }
        });
    });

    // Handle scroll to update active state
    function highlightNavOnScroll() {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // If at the top of the page (with some buffer)
        if (scrollPos < windowHeight * 0.3) {
            setActiveLink('');
            return;
        }

        // If at the bottom of the page
        if (scrollPos + windowHeight >= documentHeight - 100) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                setActiveLink('#' + lastSection.getAttribute('id'));
            }
            return;
        }

        // Check which section we're in
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                currentSection = '#' + section.getAttribute('id');
            }
        });

        setActiveLink(currentSection);
    }

    // Add debouncing for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Update scroll handler with debouncing
    window.addEventListener('scroll', debounce(highlightNavOnScroll, 100));
    
    // Set initial active state
    if (window.location.hash) {
        setActiveLink(window.location.hash);
    } else {
        setActiveLink('');
    }

    class AudioBufferManager {
        constructor() {
            this.audio = new Audio();
            this.audio.preload = "auto";
            this.audio.crossOrigin = "anonymous";
            this.isPlaying = false;
            this.activeButton = null;
            this.lastVolume = 80;
            this.isLoading = false;
            this.currentStation = null;
            this.streamBuffers = new Map();
            this._hasRetried = false;

            // Set volume immediately
            this.audio.volume = this.lastVolume / 100;

            // Add loading state listeners
            this.audio.addEventListener('waiting', () => this.setLoadingState(true));
            this.audio.addEventListener('playing', () => this.setLoadingState(false));
            this.audio.addEventListener('error', () => this.setLoadingState(false));

            // Pre-initialize streams and add preconnect links
            const streamingDomains = new Set();
            const streamUrls = [];
            
            // Process all station buttons
            document.querySelectorAll('[data-station]').forEach(button => {
                const stationKey = button.dataset.station;
                if (stationKey && RADIO_STATIONS[stationKey]) {
                    const streamUrl = RADIO_STATIONS[stationKey];
                    try {
                        const url = new URL(streamUrl);
                        streamingDomains.add(url.origin);
                        streamUrls.push(streamUrl);
                    } catch (e) {
                        console.error('Invalid stream URL for station:', stationKey, e);
                    }
                }
            });

            // Add preconnect links for all streaming domains with high priority
            streamingDomains.forEach(domain => {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preconnect';
                preloadLink.href = domain;
                preloadLink.crossOrigin = 'anonymous';
                document.head.appendChild(preloadLink);
                
                // Add DNS prefetch for faster resolution
                const dnsPrefetch = document.createElement('link');
                dnsPrefetch.rel = 'dns-prefetch';
                dnsPrefetch.href = domain;
                document.head.appendChild(dnsPrefetch);
            });

            // Preload audio stream metadata for faster switching
            this.preloadStreamMetadata(streamUrls);
            
            // Preload buffer samples for each stream
            this.preloadStreamBuffers(streamUrls);

            // Add abort controller for loading states
            this.currentLoadingController = null;
            this.errorTimeout = null;
            this.loadingTimeout = null;
            
            // Add event listeners for better error handling
            this.audio.addEventListener('error', (e) => {
                this.handleAudioError(e);
            });

            this.audio.addEventListener('waiting', () => {
                this.handleLoading(true);
            });

            this.audio.addEventListener('playing', () => {
                this.handleLoading(false);
            });

            this.audio.addEventListener('canplay', () => {
                this.handleLoading(false);
            });

            // Reduce latency with low latency mode
            if (this.audio.mozAutoplayEnabled !== undefined) {
                this.audio.mozAutoplayEnabled = true;
            }
            
            // Add interaction observer
            this.setupInteractionObserver();
        }

        preloadStreamMetadata(streamUrls) {
            // Preload stream metadata without actually downloading the full content
            streamUrls.forEach(url => {
                fetch(url, { method: 'HEAD', mode: 'no-cors' })
                    .catch(e => console.log('Preload fetch:', e));
            });
        }

        setupInteractionObserver() {
            const enablePreload = () => {
                this.audio.preload = "auto";
                document.removeEventListener('click', enablePreload);
                document.removeEventListener('touchstart', enablePreload);
                
                // Pre-warm connection for main stream
                const mainStreamButton = document.querySelector('[data-station="MAIN_STREAM"]');
                if (mainStreamButton && RADIO_STATIONS.MAIN_STREAM) {
                    this.prewarmStream(RADIO_STATIONS.MAIN_STREAM);
                }
            };

            document.addEventListener('click', enablePreload, { once: true });
            document.addEventListener('touchstart', enablePreload, { once: true });
        }

        prewarmStream(streamUrl) {
            // Create a temporary audio element to preload stream
            const tempAudio = new Audio();
            tempAudio.preload = "auto";
            tempAudio.src = streamUrl;
            tempAudio.load();
            
            // Just load the initial metadata
            setTimeout(() => {
                tempAudio.pause();
                tempAudio.src = '';
            }, 500);
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
            this.currentStation = null;
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
            if (!button?.dataset.station) return;
            
            try {
                const stationKey = button.dataset.station;
                const streamUrl = RADIO_STATIONS[stationKey];
                
                if (!streamUrl) {
                    console.error('No URL found for station:', stationKey);
                    return;
                }
                
                // If same station is already playing, just pause
                if (this.currentStation === stationKey && this.isPlaying) {
                    this.pause();
                    return;
                }

                // Special handling for rcast.net streams
                const isRcastStream = streamUrl.includes('rcast.net');
                
                // Warm up the stream before switching to reduce lag
                this.prewarmStream(streamUrl);

                // Clear any existing stream before starting a new one
                this.clearCurrentStream();

                // Set up new stream
                this.activeButton = button;
                this.currentStation = stationKey;
                this.currentLoadingController = new AbortController();
                
                // Show loading state immediately
                this.setLoadingState(true);
                
                // Set new audio source with optimized settings
                this.audio.src = streamUrl;
                
                // Set low latency mode if available
                try {
                    if (this.audio.mozPreservesPitch !== undefined) {
                        this.audio.mozPreservesPitch = false;
                    }
                    if (this.audio.preservesPitch !== undefined) {
                        this.audio.preservesPitch = false;
                    }
                    
                    // Special handling for rcast.net streams
                    if (isRcastStream) {
                        // Force CORS mode for rcast streams
                        this.audio.crossOrigin = "anonymous";
                        // Add cache buster to URL to avoid caching issues
                        if (!streamUrl.includes('?')) {
                            this.audio.src = streamUrl + '?_=' + new Date().getTime();
                        }
                    }
                } catch (e) {
                    console.log('Advanced audio settings not supported');
                }
                
                // Load with high priority
                this.audio.load();

                // Add shorter timeout for rcast streams
                const playbackTimeout = setTimeout(() => {
                    if (this.isLoading) {
                        this.handleAudioError(new Error('Playback timeout'));
                    }
                }, isRcastStream ? 6000 : 8000); // Shorter timeout for rcast streams

                // Attempt to play the stream with low latency
                this.audio.play()
                    .then(() => {
                        clearTimeout(playbackTimeout);
                        this.isPlaying = true;
                        this.updateButtonState(button, true);
                        this.setLoadingState(false);
                    })
                    .catch(error => {
                        clearTimeout(playbackTimeout);
                        if (error.name !== 'AbortError') {
                            console.error('Playback error:', error);
                            
                            // Special retry for rcast streams
                            if (isRcastStream && !this._hasRetried) {
                                this._hasRetried = true;
                                console.log('Retrying rcast stream with different approach');
                                
                                // Try with a different approach for rcast streams
                                setTimeout(() => {
                                    this.audio.src = streamUrl + '?_=' + new Date().getTime();
                                    this.audio.load();
                                    this.audio.play()
                                        .then(() => {
                                            this.isPlaying = true;
                                            this.updateButtonState(button, true);
                                            this.setLoadingState(false);
                                            this._hasRetried = false;
                                        })
                                        .catch(e => {
                                            this._hasRetried = false;
                                            this.handleAudioError(e);
                                        });
                                }, 500);
                            } else {
                                this._hasRetried = false;
                                this.handleAudioError(error);
                            }
                        }
                    });
            } catch (error) {
                console.error('Toggle playback error:', error);
                this.handleAudioError(error);
            }
        }

        pause() {
            if (this.audio) {
                this.audio.pause();
            }
            if (this.activeButton) {
                this.updateButtonState(this.activeButton, false);
            }
            this.isPlaying = false;
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

        handleLoading(isLoading) {
            this.isLoading = isLoading;
            this.setLoadingState(isLoading);
        }

        handleAudioError(error) {
            console.error('Audio Error:', error);
            this.setLoadingState(false);
            this.clearCurrentStream();
            
            if (this.activeButton) {
                // Clear any existing error message
                clearTimeout(this.errorTimeout);
                const existingError = this.activeButton.parentNode.querySelector('.audio-error');
                if (existingError) {
                    existingError.remove();
                }

                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'audio-error';
                errorMessage.textContent = 'Unable to play stream. Please try again.';
                this.activeButton.parentNode.appendChild(errorMessage);

                // Remove error message after 5 seconds
                this.errorTimeout = setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            }
        }

        preloadStreamBuffers(streamUrls) {
            // Create audio contexts for each stream to warm up the connection
            if (window.AudioContext || window.webkitAudioContext) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                
                // Preload the first second of each stream to memory for instant playback
                streamUrls.forEach(url => {
                    if (url.includes('rcast.net')) {
                        // Add a timestamp to avoid caching
                        const cacheBuster = url.includes('?') ? '&_=' : '?_=';
                        const bufferedUrl = url + cacheBuster + new Date().getTime();
                        
                        try {
                            // Create temporary audio element to preload buffer
                            const tempAudio = new Audio();
                            tempAudio.crossOrigin = "anonymous";
                            tempAudio.preload = "auto";
                            tempAudio.src = bufferedUrl;
                            
                            // Just trigger loading but don't actually play
                            tempAudio.load();
                            
                            // Store reference to later cleanup
                            this.streamBuffers.set(url, tempAudio);
                            
                            // Cleanup after 2 seconds
                            setTimeout(() => {
                                tempAudio.src = '';
                                tempAudio.load();
                            }, 2000);
                        } catch (e) {
                            console.log('Error preloading buffer:', e);
                        }
                    }
                });
            }
        }
    }

    // Initialize Audio Manager immediately
    const audioManager = new AudioBufferManager();

    // Remove duplicate click handlers and keep only one
    document.querySelectorAll('[data-station]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentScroll = window.scrollY;
            audioManager.togglePlayback(button);
            window.scrollTo(0, currentScroll);
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

    // Update close handlers
    function closeMobileNav() {
        const mobileNav = document.querySelector('.mobile-nav');
        const navMenu = document.querySelector('.nav-menu');
        const body = document.body;
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');

        if (mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('nav-active');
            body.style.top = '';
            body.style.touchAction = '';
            
            // Update toggle button icon
            const icon = mobileNavToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            
            // Remove event listeners
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('wheel', preventScroll);
            
            // Restore scroll position
            const scrollY = document.body.style.top;
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }
});