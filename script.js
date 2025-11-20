import { budayaData } from './data.js';

function truncateTextByWords(text, wordLimit) {
    const words = text.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
}

// Navbar Logic
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

if(hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(hamburger) hamburger.classList.remove('active');
        if(navMenu) navMenu.classList.remove('active');
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

// Search Logic
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearBtn = document.getElementById('clearSearch');

if(searchInput) {
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
}

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

window.handleSearchClick = (id) => {
    showDetailView(id);
    searchResults.classList.remove('visible');
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    const budayaSection = document.getElementById('budaya');
    if(budayaSection) budayaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightCard(id);
}

function highlightCard(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.style.animation = 'none';
        void card.offsetWidth; 
        card.style.animation = 'highlight 1s ease';
    }
}

// === SLIDER BUDAYA (CLEAN MODERN CARD) ===
const sliderContainer = document.getElementById('sliderContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderDots = document.getElementById('sliderDots');

let isDown = false;
let isDragging = false;
let startX;
let scrollLeft;

function populateSlider() {
    if(!sliderContainer) return;

    const cardsHtml = budayaData.map((item, index) => {
        // Prioritaskan foto_bg dari data.js, fallback ke Picsum
        const coverImg = item.foto_bg ? item.foto_bg : `https://picsum.photos/500/400?random=${item.id}`;

        return `
        <div class="culture-card" data-id="${item.id}" style="--i: ${index}">
            
            <div class="card-header-img">
                <img src="${coverImg}" 
                     alt="${item.daerah}" 
                     class="card-cover-img"
                     onerror="this.src='https://via.placeholder.com/500x300?text=No+Image'">
            </div>

            <div class="card-floating-logo">
                <img src="${item.image}" alt="Logo ${item.kota}" onerror="this.style.opacity='0.3'">
            </div>

            <div class="card-body">
                <span class="card-meta">${item.kota}</span>
                <h3 class="card-title">${item.daerah}</h3>
                <p class="card-desc">
                    ${truncateTextByWords(item.deskripsi_kota, 15)}
                </p>
                
                <div class="card-link">
                    Jelajahi <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `}).join('');

    sliderContainer.innerHTML = cardsHtml;
    createDots();
}

function createDots() {
    if (budayaData.length === 0 || !sliderDots) return;
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

function scrollToIndex(index) {
    if(!sliderContainer) return;
    const card = sliderContainer.children[index];
    if (card) {
        const cardWidth = card.offsetWidth;
        const gap = 30;
        const scrollPosition = (cardWidth + gap) * index - (sliderContainer.offsetWidth / 2) + (cardWidth / 2); 
        sliderContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
}

function updateActiveDot() {
    if (!sliderContainer || sliderContainer.children.length === 0) return;
    const scrollPosition = sliderContainer.scrollLeft;
    const containerWidth = sliderContainer.offsetWidth;
    let activeIndex = 0;
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

if(prevBtn) {
    prevBtn.addEventListener('click', () => {
        if(sliderContainer.children.length > 0) {
            const scrollAmount = (sliderContainer.children[0].offsetWidth + 30) * -1;
            sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
}
if(nextBtn) {
    nextBtn.addEventListener('click', () => {
        if(sliderContainer.children.length > 0) {
            const scrollAmount = sliderContainer.children[0].offsetWidth + 30;
            sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
}

if(sliderContainer) {
    sliderContainer.addEventListener('mousedown', (e) => {
        isDown = true; isDragging = false;
        startX = e.pageX - sliderContainer.offsetLeft;
        scrollLeft = sliderContainer.scrollLeft;
        sliderContainer.style.cursor = 'grabbing';
    });
    sliderContainer.addEventListener('mouseleave', () => {
        isDown = false; isDragging = false; sliderContainer.style.cursor = 'grab';
    });
    sliderContainer.addEventListener('mouseup', () => {
        isDown = false; sliderContainer.style.cursor = 'grab';
    });
    sliderContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return; e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 10) isDragging = true;
        sliderContainer.scrollLeft = scrollLeft - walk;
    });
    sliderContainer.addEventListener('scroll', updateActiveDot);
    sliderContainer.addEventListener('click', (e) => {
        if (isDragging) { e.preventDefault(); return; }
        const clickedCard = e.target.closest('.culture-card');
        if (clickedCard) { e.preventDefault(); const id = clickedCard.dataset.id; showDetailView(id); }
    });
}

// === MODAL LOGIC (MAGAZINE STYLE) ===
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

function showDetailView(id) {
    const item = budayaData.find(b => b.id == id);
    if (!item) return;

    document.querySelector('.culture-card.active')?.classList.remove('active');

    // 1. Generate Grid HTML untuk Budaya Spesifik
    let highlightsHtml = '';
    if (item.budaya_spesifik && item.budaya_spesifik.length > 0) {
        const itemsHtml = item.budaya_spesifik.map(budaya => `
            <div class="highlight-card">
                <img src="${budaya.gambar}" 
                     alt="${budaya.nama}" 
                     class="highlight-thumb"
                     onerror="this.src='https://via.placeholder.com/100?text=Img'">
                <div class="highlight-content">
                    <h4>${budaya.nama}</h4>
                    <p>${budaya.deskripsi}</p>
                </div>
            </div>
        `).join('');

        highlightsHtml = `
            <h3 class="section-label">Kekayaan Budaya Khas</h3>
            <div class="highlights-grid">
                ${itemsHtml}
            </div>
        `;
    }

    // 2. Pilih Gambar Header (Prioritas: foto_bg > placeholder)
    const headerImage = item.foto_bg ? item.foto_bg : `https://picsum.photos/800/400?random=${item.id}`;

    // 3. Render Modal
    modalContent.innerHTML = `
        <div class="modal-header-modern">
            <img src="${headerImage}" alt="${item.daerah}" class="modal-cover-img">
            <div class="modal-header-overlay">
                <span class="modal-tag">${item.kota}</span>
                <h1 class="modal-title">${item.daerah}</h1>
            </div>
            <button class="close-modal-btn" id="closeDetailBtn">✕</button>
        </div>

        <div class="modal-body-modern">
            <p class="modal-desc-main">
                ${item.deskripsi_kota}
            </p>
            ${highlightsHtml}
        </div>
    `;

    modalOverlay.classList.add('active');
    document.querySelector(`.culture-card[data-id="${id}"]`)?.classList.add('active');
}

function hideDetailView() {
    modalOverlay.classList.remove('active');
    document.querySelector('.culture-card.active')?.classList.remove('active');
    setTimeout(() => { modalContent.innerHTML = ''; }, 300);
}

if(modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay' || e.target.closest('#closeDetailBtn')) {
            hideDetailView();
        }
    });
}

// Hero Slider Auto
const heroSlides = document.querySelectorAll('.hero-slide');
let currentHeroSlide = 0;
const slideInterval = 5000; 
function nextHeroSlide() {
    if(heroSlides.length === 0) return;
    heroSlides[currentHeroSlide].classList.remove('active');
    currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
    heroSlides[currentHeroSlide].classList.add('active');
}
if (heroSlides.length > 0) { setInterval(nextHeroSlide, slideInterval); }

// Navbar Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) {
        if(navbar) navbar.style.transform = 'translateY(-100%)';
    } else {
        if(navbar) navbar.style.transform = 'translateY(0)';
    }
    if (currentScroll > 50) {
        if(navbar) navbar.classList.add('scrolled');
    } else {
        if(navbar) navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
    let currentSection = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) { currentSection = section.getAttribute('id'); }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) { link.classList.add('active'); }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    populateSlider();
    console.log('Website Budaya Jawa Timur siap!');
});