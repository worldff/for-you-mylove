// Global variables
let audioElement = null;
let isPlaying = false;
let progress = 0;
let progressInterval = null;
let heartInterval = null;
let isAudioLoaded = false;

// Initialize when page loads
function init() {
    try {
        // Initialize audio element
        audioElement = document.getElementById('birthdayAudio');

        if (audioElement) {
            setupAudioEvents();
        }

        // Create floating hearts
        createFloatingHearts();
        heartInterval = setInterval(createFloatingHearts, 3000);

        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeyPress);

        console.log('Website initialized successfully');
    } catch (error) {
        console.error('Error initializing website:', error);
    }
}

// Setup audio event listeners
function setupAudioEvents() {
    if (!audioElement) return;

    audioElement.addEventListener('loadstart', () => {
        showLoading(true);
    });

    audioElement.addEventListener('canplaythrough', () => {
        showLoading(false);
        isAudioLoaded = true;
        showSuccess('Audio berhasil dimuat!');
    });

    audioElement.addEventListener('error', (e) => {
        showLoading(false);
        showError('Audio tidak dapat dimuat. Pastikan file audio tersedia.');
        console.error('Audio error:', e);
    });

    audioElement.addEventListener('ended', () => {
        if (audioElement.loop) {
            audioElement.currentTime = 0;
            audioElement.play();
        } else {
            resetPlayer();
        }
    });

    audioElement.addEventListener('timeupdate', updateProgress);
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 3000);
    }
}

// Create floating hearts
function createFloatingHearts() {
    const hearts = ['💕', '❤️', '💖', '💝', '🌹', '💗', '💘'];
    const container = document.getElementById('floatingHearts');

    if (!container) return;

    for (let i = 0; i < 3; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(heart);

        // Remove heart after animation
        setTimeout((element) => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 7000, heart);
    }
}

// Toggle play/pause music
function togglePlay() {
    if (!audioElement) {
        showError('Audio element tidak ditemukan');
        return;
    }

    try {
        const playBtn = document.getElementById('playBtn');

        if (isPlaying) {
            audioElement.pause();
            isPlaying = false;
            playBtn.textContent = '▶️';
            stopProgressBar();
        } else {
            audioElement.play().then(() => {
                isPlaying = true;
                playBtn.textContent = '⏸️';
                startProgressBar();
                createFloatingHearts();
            }).catch((error) => {
                console.error('Error playing audio:', error);
                showError('Tidak dapat memutar audio');
            });
        }
    } catch (error) {
        console.error('Error in togglePlay:', error);
        showError('Terjadi kesalahan saat memutar audio');
    }
}

// Start progress bar
function startProgressBar() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }

    progressInterval = setInterval(() => {
        if (isPlaying && audioElement && audioElement.duration) {
            updateProgress();
        }
    }, 100);
}

// Update progress bar
function updateProgress() {
    if (!audioElement || !audioElement.duration) return;

    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;

    if (duration > 0) {
        progress = (currentTime / duration) * 100;
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
}

// Stop progress bar
function stopProgressBar() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Set progress when clicking on progress bar
function setProgress(event) {
    if (!audioElement || !audioElement.duration) return;

    const progressContainer = event.currentTarget;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = (clickX / width) * 100;

    const newTime = (percentage / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
}

// Reset player
function resetPlayer() {
    isPlaying = false;
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.textContent = '▶️';
    }
    stopProgressBar();

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// Handle keyboard events
function handleKeyPress(event) {
    if (event.code === 'Space' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        togglePlay();
    }
}

// Trigger upload file
function triggerUpload(index) {
    const uploadInput = document.getElementById('upload' + index);
    if (uploadInput) {
        uploadInput.click();
    }
}

// Handle image upload
function handleImageUpload(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size too large. Please select an image under 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const uploadArea = event.target.previousElementSibling;
        if (uploadArea) {
            uploadArea.innerHTML = `<img src="${e.target.result}" alt="Uploaded photo" class="uploaded-image">`;
            uploadArea.classList.add('has-image');
            createFloatingHearts();

            // Add click event to view full image
            const img = uploadArea.querySelector('.uploaded-image');
            if (img) {
                img.onclick = () => viewFullImage(e.target.result);
            }
        }
    };
    reader.onerror = function () {
        showError('Error reading file');
    };
    reader.readAsDataURL(file);
}

// View full image in modal
function viewFullImage(src) {
    const modal = document.createElement('div');
    modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                cursor: pointer;
            `;

    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            `;

    modal.appendChild(img);
    document.body.appendChild(modal);

    // Close modal when clicked
    modal.onclick = () => {
        document.body.removeChild(modal);
    };

    // Close modal with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Smooth scroll to content
function scrollToContent() {
    const contentSection = document.querySelector('.content-section');
    if (contentSection) {
        contentSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Cleanup function
function cleanup() {
    if (heartInterval) {
        clearInterval(heartInterval);
    }
    if (progressInterval) {
        clearInterval(progressInterval);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('beforeunload', cleanup);

// Fallback if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Service Worker registration (optional for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be registered here for offline functionality
    });
}