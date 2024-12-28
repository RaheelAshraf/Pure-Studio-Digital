document.addEventListener('DOMContentLoaded', () => {
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
            if (hash === '' && (href === '/' || href === 'index.html')) {
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

                // Handle home link
                if (href === '/' || href === 'index.html') {
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

            // Add error handling and loading states
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
            if (!button?.dataset.stream) {
                console.error('No stream URL provided');
                return;
            }

            try {
                // If same button is clicked while playing, just pause and return
                if (this.activeButton === button && this.isPlaying) {
                    this.pause();
                    return;
                }

                // If different button clicked or not playing
                if (this.activeButton !== button || !this.isPlaying) {
                    // Clear any existing stream if switching to a new button
                    if (this.activeButton !== button) {
                        this.clearCurrentStream();
                    }

                    // Create new abort controller for this stream
                    this.currentLoadingController = new AbortController();
                    
                    // Show loading state immediately
                    this.handleLoading(true);
                    this.activeButton = button;
                    
                    // Start new stream only if not already playing
                    if (!this.isPlaying) {
                        const streamUrl = button.dataset.stream;
                        this.audio.src = streamUrl;
                        this.audio.load();

                        // Add timeout for slow connections
                        const playbackTimeout = setTimeout(() => {
                            if (this.isLoading) {
                                this.handleAudioError(new Error('Playback timeout'));
                            }
                        }, 10000); // 10 second timeout

                        this.audio.play()
                            .then(() => {
                                clearTimeout(playbackTimeout);
                                this.isPlaying = true;
                                this.updateButtonState(button, true);
                            })
                            .catch(error => {
                                clearTimeout(playbackTimeout);
                                if (error.name !== 'AbortError') {
                                    this.handleAudioError(error);
                                }
                            });
                    }
                }
            } catch (error) {
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
            clearTimeout(this.loadingTimeout);
            
            if (isLoading) {
                this.loadingTimeout = setTimeout(() => {
                    this.setLoadingState(true);
                }, 500); // Add small delay to prevent flashing
            } else {
                this.setLoadingState(false);
            }
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
    }

    // Initialize Audio Manager immediately
    const audioManager = new AudioBufferManager();

    // Remove duplicate click handlers and keep only one
    document.querySelectorAll('[data-stream]').forEach(button => {
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