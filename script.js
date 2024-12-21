document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelector('.nav-links');
    const playButton = document.querySelector('.play-button');
    const audioPlayer = new Audio('https://stream4.rcast.net/72127');
    let isPlaying = false;
    
    console.log('Nav links element:', navLinks);

    if (playButton) {
        playButton.addEventListener('click', () => {
            if (!isPlaying) {
                audioPlayer.play()
                    .then(() => {
                        isPlaying = true;
                        playButton.innerHTML = '<i class="fas fa-pause"></i>Stop Listening';
                        playButton.classList.add('playing');
                    })
                    .catch(error => {
                        console.error('Error playing audio:', error);
                    });
            } else {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-play"></i>Start Listening';
                playButton.classList.remove('playing');
            }
        });
    }
});
