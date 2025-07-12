document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentPage = 0;
    const totalPages = pages.length;

    console.log('Tổng số trang:', totalPages);

    // Khởi tạo trạng thái ban đầu
    function initializeBook() {
        // Không cần set transform vì đã có trong CSS
        pages.forEach((page, index) => {
            page.style.zIndex = totalPages - index;
        });
        updateButtons();
    }

    // Cập nhật trạng thái nút
    function updateButtons() {
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;
        
        if (currentPage === 0) {
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.style.opacity = '1';
        }
        
        if (currentPage === totalPages - 1) {
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.style.opacity = '1';
        }
        
        console.log('Trang hiện tại:', currentPage);
    }

    // Hiệu ứng âm thanh lật trang (tạo âm thanh bằng Web Audio API)
    function playPageFlipSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Bỏ qua nếu không thể tạo âm thanh
        }
    }

    // Thêm hiệu ứng confetti khi mở trang cuối
    function addConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.style.animation = 'confettiFall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 100);
        }
    }

    // Thêm CSS animation cho confetti
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Lật trang tiếp theo
    function nextPage() {
        console.log('Lật trang tiếp theo từ:', currentPage);
        if (currentPage < totalPages - 1) {
            pages[currentPage].classList.add('flipped');
            currentPage++;
            updateButtons();
            
            // Thêm hiệu ứng âm thanh
            playPageFlipSound();
            
            // Kiểm tra nếu là trang cuối
            if (currentPage === totalPages - 1) {
                setTimeout(() => {
                    addConfetti();
                }, 500);
            }
        } else if (currentPage === totalPages - 1) {
            // Nếu đã ở trang cuối, lật ngược về trang đầu
            resetToFirstPage();
        }
    }

    // Reset về trang đầu tiên
    function resetToFirstPage() {
        console.log('Reset về trang đầu tiên');
        
        // Lật ngược tất cả các trang về vị trí ban đầu
        for (let i = totalPages - 1; i >= 0; i--) {
            setTimeout(() => {
                pages[i].classList.remove('flipped');
                pages[i].style.zIndex = totalPages - i;
            }, (totalPages - 1 - i) * 300 + (i === 0 ? 800 : (i === 1 ? 150 : 0))); // Trang bìa lật ở 1700ms
        }
        
        currentPage = 0;
        updateButtons();
        
        // Thêm hiệu ứng âm thanh
        playPageFlipSound();
    }

    // Lật trang trước
    function prevPage() {
        console.log('Lật trang trước từ:', currentPage);
        if (currentPage > 0) {
            currentPage--;
            pages[currentPage].classList.remove('flipped');
            
            // Đảm bảo trang hiện tại hiển thị đúng
            pages[currentPage].style.zIndex = totalPages - currentPage;
            
            updateButtons();
            
            // Thêm hiệu ứng âm thanh
            playPageFlipSound();
        }
    }

    // Event listeners
    nextBtn.addEventListener('click', nextPage);
    prevBtn.addEventListener('click', prevPage);

    // Click vào trang để lật
    pages.forEach((page, index) => {
        page.addEventListener('click', () => {
            console.log('Click vào trang:', index, 'Trang hiện tại:', currentPage);
            // Chỉ cho phép click vào trang hiện tại để lật tiếp
            if (index === currentPage && currentPage < totalPages - 1) {
                nextPage();
            } else if (index === currentPage && currentPage === totalPages - 1) {
                // Nếu đã ở trang cuối, click để reset về trang đầu
                resetToFirstPage();
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextPage();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevPage();
        }
    });

    // Touch events cho mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next page
                nextPage();
            } else {
                // Swipe right - previous page
                prevPage();
            }
        }
    }

    // Khởi tạo sách
    initializeBook();

    // Thêm hiệu ứng hover cho các trang
    pages.forEach(page => {
        page.addEventListener('mouseenter', () => {
            // Chỉ hover khi không phải trang hiện tại hoặc trang đã lật
            const pageIndex = Array.from(pages).indexOf(page);
            if (pageIndex !== currentPage && !page.classList.contains('flipped')) {
                page.style.transform = 'scale(1.02)';
            }
        });
        
        page.addEventListener('mouseleave', () => {
            // Chỉ reset transform nếu không phải trang đã lật
            if (!page.classList.contains('flipped')) {
                page.style.transform = '';
            }
        });
    });

    // Thêm hiệu ứng loading
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Thêm hiệu ứng loading ban đầu
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 1s ease-in-out'; 