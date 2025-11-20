// [PERBAIKAN] Import data dari data.js
import { budayaData } from './data.js';

// [TAMBAHAN] Fungsi untuk memotong teks berdasarkan jumlah kata
function truncateTextByWords(text, wordLimit) {
    const words = text.split(' ');
    if (words.length > wordLimit) {
        // Potong array kata sesuai batas dan gabungkan kembali, lalu tambahkan "..."
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    // Kembalikan teks asli jika lebih pendek dari batas
    return text;
}

// ... (kode Anda yang lain) ...

// Navbar functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Update active link
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearBtn = document.getElementById('clearSearch');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length > 0) {
        clearBtn.classList.add('visible');
        performSearch(query);
    } else {
        clearBtn.classList.remove('visible');
        searchResults.classList.remove('visible');
    }
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    searchResults.classList.remove('visible');
    searchInput.focus();
});

function performSearch(query) {
    const results = budayaData.filter(item => 
        item.kota.toLowerCase().includes(query) ||
        item.daerah.toLowerCase().includes(query) ||
        item.jenis.toLowerCase().includes(query)
    );
    displaySearchResults(results);
}

function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">Tidak ada hasil yang ditemukan</div>';
        searchResults.classList.add('visible');
        return;
    }

   // [PERBAIKAN] Tambahkan 'index' untuk animasi stagger
   const html = results.map((item, index) => `
        <div class="search-result-item" onclick="handleSearchClick(${item.id})" style="--i: ${index}">
            <div class="result-kota">${item.kota}</div> 
            <div class="result-daerah">${item.daerah}</div>
            <div class="result-jenis">${item.jenis}</div>
        </div>
    `).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('visible');
}

// [PERBAIKAN] Pisahkan fungsi klik search
window.handleSearchClick = (id) => {
    // 1. Tampilkan detail di modal
    showDetailView(id);
    
    // 2. Tutup search
    searchResults.classList.remove('visible');
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    
    // 3. (Opsional) Scroll ke slider budaya
    // [PERBAIKAN] ID section Anda adalah 'budaya', bukan 'daerah'
    document.getElementById('budaya').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // 4. (Opsional) Highlight kartu di slider
    highlightCard(id);
}

function highlightCard(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.style.animation = 'none';
        void card.offsetWidth; // Memicu reflow
        card.style.animation = 'highlight 1s ease';
    }
}

// Slider functionality
const sliderContainer = document.getElementById('sliderContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderDots = document.getElementById('sliderDots');

let isDown = false;
let isDragging = false;
let startX;
let scrollLeft;

// Populate slider with culture cards
function populateSlider() {
    // [PERBAIKAN] Tambahkan 'index' untuk animasi stagger
    const cardsHtml = budayaData.map((item, index) => `
        <a href="${item.url}" class="culture-card" data-id="${item.id}" style="--i: ${index}">
            <div class="card-kota">${item.kota}</div>
            <div class="card-daerah">${item.daerah}</div>
            <div class="card-jenis">${item.jenis}</div>

            <div class="card-deskripsi">${truncateTextByWords(item.deskripsi_kota, 20)}</div> 

        </a>
    `).join('');

    sliderContainer.innerHTML = cardsHtml;
    createDots();
}

// Create navigation dots
function createDots() {
    if (budayaData.length === 0) return;
    const dotsHtml = budayaData.map((_, index) => 
        `<div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
    ).join('');
    
    sliderDots.innerHTML = dotsHtml;
    
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            scrollToIndex(index);
        });
    });
}

// Scroll to specific card index
function scrollToIndex(index) {
    const card = sliderContainer.children[index];
    if (card) {
        const cardWidth = card.offsetWidth;
        const gap = 30;
        const scrollPosition = (cardWidth + gap) * index - (sliderContainer.offsetWidth / 2) + (cardWidth / 2); // Pusatkan kartu
        sliderContainer.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
}

// Update active dot based on scroll position
function updateActiveDot() {
    if (sliderContainer.children.length === 0) return;
    
    const scrollPosition = sliderContainer.scrollLeft;
    const containerWidth = sliderContainer.offsetWidth;
    let activeIndex = 0;
    
    // Cari kartu yang paling tengah
    let minDistance = Infinity;
    for (let i = 0; i < sliderContainer.children.length; i++) {
        const card = sliderContainer.children[i];
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const containerCenter = scrollPosition + containerWidth / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            activeIndex = i;
        }
    }
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Navigation buttons
prevBtn.addEventListener('click', () => {
    const scrollAmount = (sliderContainer.children[0].offsetWidth + 30) * -1;
    sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
    const scrollAmount = sliderContainer.children[0].offsetWidth + 30;
    sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

// Drag to scroll
sliderContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    isDragging = false;
    startX = e.pageX - sliderContainer.offsetLeft;
    scrollLeft = sliderContainer.scrollLeft;
    sliderContainer.style.cursor = 'grabbing';
});

sliderContainer.addEventListener('mouseleave', () => {
    isDown = false;
    isDragging = false;
    sliderContainer.style.cursor = 'grab';
});

sliderContainer.addEventListener('mouseup', () => {
    isDown = false;
    sliderContainer.style.cursor = 'grab';
});

sliderContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderContainer.offsetLeft;
    const walk = (x - startX) * 2;
    
    if (Math.abs(walk) > 10) { 
        isDragging = true;
    }
    
    sliderContainer.scrollLeft = scrollLeft - walk;
});

// Update dots on scroll
sliderContainer.addEventListener('scroll', updateActiveDot);

// Modal (Pop-up) functionality
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

// Event listener untuk klik pada card
sliderContainer.addEventListener('click', (e) => {
    if (isDragging) {
        e.preventDefault();
        return;
    }
    const clickedCard = e.target.closest('.culture-card');
    if (clickedCard) {
        e.preventDefault(); // Mencegah link '#'
        const id = clickedCard.dataset.id;
        showDetailView(id);
    }
});

// ==========================================================
// [FUNGSI YANG DIPERBARUI TOTAL]
// =I- =========================================================

function showDetailView(id) {
    const item = budayaData.find(b => b.id == id);
    if (!item) return;

    document.querySelector('.culture-card.active')?.classList.remove('active');

    // 1. [PERUBAHAN] Buat HTML untuk daftar budaya (bukan slider)
    let daftarBudayaHtml = '';
    
    if (item.budaya_spesifik && item.budaya_spesifik.length > 0) {
        
        // Loop setiap budaya dan buat div terpisah
        const itemsHtml = item.budaya_spesifik.map(budaya => `
            <div class="budaya-item">
                <img src="${budaya.gambar}" alt="${budaya.nama}" class="budaya-item-image">
                <h3>${budaya.nama}</h3>
                <p>${budaya.deskripsi}</p>
            </div>
        `).join(''); // Gabungkan semua div

        daftarBudayaHtml = `
            <h2 class="section-title" style="font-size: 1.8rem; margin-top: 30px; margin-bottom: 20px;">Budaya Khas</h2>
            ${itemsHtml}
        `;
    }

    // 2. Buat HTML Modal Lengkap
    modalContent.innerHTML = `
        <div class="detail-content">
            <button class="close-detail-btn" id="closeDetailBtn">✕</button>
            <img src="${item.image}" alt="${item.daerah}" class="detail-image">
            <div class="detail-header">
                <div class="kota">${item.kota}</div>
                <h1>${item.daerah}</h1>
                <div class="jenis">${item.jenis}</div>
            </div>
            <p>${item.deskripsi_kota}</p> 
            
            ${daftarBudayaHtml}
        </div>
    `;

    // 3. Tampilkan Modal
    modalOverlay.classList.add('active');
    document.querySelector(`.culture-card[data-id="${id}"]`)?.classList.add('active');

    // 4. [DIHAPUS] Panggilan ke initModalSlider() dihapus karena tidak ada slider
}

// [FUNGSI DIHAPUS] Fungsi initModalSlider() sudah dihapus.

// ==========================================================
// Akhir dari bagian yang diubah
// ==========================================================

function hideDetailView() {
    modalOverlay.classList.remove('active');
    document.querySelector('.culture-card.active')?.classList.remove('active');
    setTimeout(() => {
        modalContent.innerHTML = ''; 
    }, 300);
}

// Event listener untuk menutup modal
modalOverlay.addEventListener('click', (e) => {
    // [PERBAIKAN] Pastikan tombol di dalam modal tidak menutup modal
    if (e.target.id === 'modalOverlay' || e.target.closest('#closeDetailBtn')) {
        hideDetailView();
    }
});


// Add highlight animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 15px 30px rgba(74, 144, 226, 0.3); }
    }
`;
document.head.appendChild(style);

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Navbar hide/show
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    // Navbar shadow
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
    
    // Update active nav link on scroll
    let currentSection = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// Initialize the slider when page loads
document.addEventListener('DOMContentLoaded', () => {
    populateSlider();
    console.log('Website Budaya Jawa Timur siap!');
});