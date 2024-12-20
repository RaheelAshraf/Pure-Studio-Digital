// Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    document.body.classList.toggle('nav-open');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
    }
});

// Radio Stations Player
class RadioPlayer {
    constructor() {
        this.stations = new Map();
        this.currentStation = null;
        this.streamUrl = 'https://paul-derbeat-sd-radio.triggerfm.de';
        this.volumeControl = document.querySelector('.volume-control input');
        this.setupStations();
        this.setupEventListeners();
    }

    setupStations() {
        // Main station
        const mainStation = {
            audio: new Audio(this.streamUrl),
            button: document.querySelector('.main-player .play-btn'),
            card: document.querySelector('.main-player'),
            name: 'main'
        };
        this.stations.set('main', mainStation);

        // Additional stations
        document.querySelectorAll('.station-card').forEach(card => {
            const stationId = card.dataset.station;
            const station = {
                audio: new Audio(this.streamUrl),
                button: card.querySelector('.play-btn'),
                card: card,
                name: stationId
            };
            this.stations.set(stationId, station);
        });
    }

    setupEventListeners() {
        this.volumeControl.addEventListener('input', () => {
            const volume = this.volumeControl.value / 100;
            this.stations.forEach(station => {
                station.audio.volume = volume;
            });
        });

        this.stations.forEach(station => {
            station.button.addEventListener('click', () => {
                this.toggleStation(station.name);
            });

            station.audio.addEventListener('play', () => {
                this.updateStationUI(station.name, true);
            });

            station.audio.addEventListener('pause', () => {
                this.updateStationUI(station.name, false);
            });

            station.audio.addEventListener('error', (e) => {
                console.error(`Error playing station ${station.name}:`, e);
                this.updateStationUI(station.name, false);
            });
        });
    }

    toggleStation(stationId) {
        const station = this.stations.get(stationId);
        
        if (this.currentStation && this.currentStation !== stationId) {
            // Stop current station
            const currentStation = this.stations.get(this.currentStation);
            currentStation.audio.pause();
            this.updateStationUI(this.currentStation, false);
        }

        if (station.audio.paused) {
            // Play new station
            station.audio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
            this.currentStation = stationId;
        } else {
            // Pause current station
            station.audio.pause();
            this.currentStation = null;
        }
    }

    updateStationUI(stationId, isPlaying) {
        const station = this.stations.get(stationId);
        const icon = station.button.querySelector('i');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            station.card.classList.add('playing');
        } else {
            icon.className = 'fas fa-play';
            station.card.classList.remove('playing');
        }
    }
}

// Initialize radio player
const radioPlayer = new RadioPlayer();

// Sample playlist data
const playlist = [
    { time: '12:00 AM', title: 'Late Night Jazz', artist: 'Various Artists' },
    { time: '2:00 AM', title: 'Smooth Saxophone', artist: 'John Coltrane' },
    { time: '4:00 AM', title: 'Morning Melodies', artist: 'Miles Davis' },
    { time: '6:00 AM', title: 'Jazz at Sunrise', artist: 'Duke Ellington' },
    { time: '8:00 AM', title: 'Coffee & Jazz', artist: 'Ella Fitzgerald' },
    { time: '10:00 AM', title: 'Jazz Standards', artist: 'Louis Armstrong' }
];

// Populate schedule
const scheduleGrid = document.querySelector('.schedule-grid');

function populateSchedule() {
    playlist.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="time">${item.time}</div>
            <div class="program">
                <h3>${item.title}</h3>
                <p>${item.artist}</p>
            </div>
        `;
        scheduleGrid.appendChild(scheduleItem);
    });
}

populateSchedule();

// Contact Form
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // Here you would typically send the form data to your server
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
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
