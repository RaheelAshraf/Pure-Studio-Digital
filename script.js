// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');

    // Audio Player Controls
    const audio = new Audio('https://stream4.rcast.net/72127');
    const playButtons = document.querySelectorAll('.play-button');
    let activeButton = null;

    // Set audio properties
    audio.preload = 'none';

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Play button clicked');
            
            // If a different button was active, reset its icon
            if (activeButton && activeButton !== button) {
                const prevIcon = activeButton.querySelector('i');
                if (prevIcon) {
                    prevIcon.className = 'fas fa-play';
                }
            }

            const icon = button.querySelector('i');
            if (activeButton === button) {
                // If clicking the same button that's currently playing
                if (icon) icon.className = 'fas fa-play';
                audio.pause();
                activeButton = null;
            } else {
                // If clicking a new button or starting playback
                if (icon) icon.className = 'fas fa-pause';
                audio.play().catch(e => {
                    console.error('Error playing audio:', e);
                    // Reset button state if playback fails
                    if (icon) icon.className = 'fas fa-play';
                });
                activeButton = button;
            }
        });
    });

    // Mobile Menu Toggle - Optimized
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    let isMenuOpen = false;

    if (mobileMenuBtn && navLinks) {
        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            body.style.overflow = isMenuOpen ? 'hidden' : '';
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
        };

        // Use touchstart for better mobile response
        mobileMenuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleMenu();
        }, { passive: false });

        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
        });

        // Optimize touch scrolling in menu
        let touchStartY = 0;
        navLinks.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        navLinks.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const scrollTop = navLinks.scrollTop;
            const scrollHeight = navLinks.scrollHeight;
            const clientHeight = navLinks.clientHeight;

            // Prevent overscroll only when needed
            if ((scrollTop <= 0 && touchY > touchStartY) || 
                (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Optimize click handlers
        const closeMenu = () => {
            if (isMenuOpen) {
                isMenuOpen = false;
                navLinks.classList.remove('active');
                body.style.overflow = '';
                mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        };

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu, { passive: true });
        });

        // Use event delegation for outside clicks
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMenu();
            }
        }, { passive: true });
    }

    // Populate schedule (if needed)
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid && window.playlist) {
        function populateSchedule() {
            window.playlist.forEach(item => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item';
                scheduleItem.innerHTML = `
                    <div class="time">${item.time}</div>
                    <div class="program">
                        <h3>${item.show}</h3>
                        <p>${item.artist}</p>
                    </div>
                `;
                scheduleGrid.appendChild(scheduleItem);
            });
        }
        populateSchedule();
    }

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted:', {
                name: document.getElementById('name')?.value,
                email: document.getElementById('email')?.value,
                message: document.getElementById('message')?.value
            });
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Optimize smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                // Use requestAnimationFrame for smoother scrolling
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, { passive: false });
    });

    // Optimize intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('in-view');
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Batch observe operations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));
});
