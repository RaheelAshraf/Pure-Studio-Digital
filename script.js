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

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        // Toggle menu when hamburger is clicked
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu when clicking a nav link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // Mobile Navigation Setup
    const navToggle = document.querySelector('.nav-toggle');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navToggle.contains(e.target) && 
                !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
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

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for header
                    behavior: 'smooth',
                    duration: 500
                });
            }
        });
    });

    // Add scroll animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});
