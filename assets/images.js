// Image URLs for the website with optimized parameters
const images = {
    // Hero background - high quality since it's above the fold
    hero: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&w=1800&q=80',

    // Station images - optimized for different screen sizes
    stations: {
        main: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&w=800&q=75',
        station1: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&w=600&q=75',
        // ... other images with optimized parameters
    }
};

// Preload critical images
function preloadCriticalImages() {
    const critical = [images.hero];
    critical.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Export for use in other files
export { images, preloadCriticalImages };
